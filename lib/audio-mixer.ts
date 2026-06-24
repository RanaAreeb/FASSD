function decodeFile(ctx: BaseAudioContext, file: File): Promise<AudioBuffer> {
  return file.arrayBuffer().then((data) => ctx.decodeAudioData(data.slice(0)))
}

function audioBufferToWav(buffer: AudioBuffer): Blob {
  const numChannels = 1
  const sampleRate = buffer.sampleRate
  const samples = buffer.getChannelData(0)
  const bytesPerSample = 2
  const blockAlign = numChannels * bytesPerSample
  const dataSize = samples.length * bytesPerSample
  const arrayBuffer = new ArrayBuffer(44 + dataSize)
  const view = new DataView(arrayBuffer)

  const writeString = (offset: number, value: string) => {
    for (let i = 0; i < value.length; i++) view.setUint8(offset + i, value.charCodeAt(i))
  }

  writeString(0, "RIFF")
  view.setUint32(4, 36 + dataSize, true)
  writeString(8, "WAVE")
  writeString(12, "fmt ")
  view.setUint32(16, 16, true)
  view.setUint16(20, 1, true)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * blockAlign, true)
  view.setUint16(32, blockAlign, true)
  view.setUint16(34, 16, true)
  writeString(36, "data")
  view.setUint32(40, dataSize, true)

  let offset = 44
  for (let i = 0; i < samples.length; i++) {
    const sample = Math.max(-1, Math.min(1, samples[i]))
    view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
    offset += 2
  }

  return new Blob([arrayBuffer], { type: "audio/wav" })
}

/** Convert browser MediaRecorder output (webm/ogg) to WAV for backend upload without ffmpeg. */
export async function blobToWavFile(blob: Blob, filename: string): Promise<File> {
  const arrayBuffer = await blob.arrayBuffer()
  const ctx = new AudioContext()
  try {
    const buffer = await ctx.decodeAudioData(arrayBuffer.slice(0))
    const mono =
      buffer.numberOfChannels === 1
        ? buffer
        : (() => {
            const out = ctx.createBuffer(1, buffer.length, buffer.sampleRate)
            const mix = out.getChannelData(0)
            for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
              const data = buffer.getChannelData(ch)
              for (let i = 0; i < data.length; i++) mix[i] += data[i] / buffer.numberOfChannels
            }
            return out
          })()
    const wav = audioBufferToWav(mono)
    const name = filename.toLowerCase().endsWith(".wav") ? filename : filename.replace(/\.[^.]+$/, "") + ".wav"
    return new File([wav], name, { type: "audio/wav" })
  } finally {
    await ctx.close()
  }
}

/** Insert an AI/synthetic segment into a human recording at a chosen second. */
export async function mixHumanWithAiSegment(
  humanFile: File,
  aiFile: File,
  insertAtSec: number,
  aiGain = 0.95,
): Promise<File> {
  const humanArray = await humanFile.arrayBuffer()
  const aiArray = await aiFile.arrayBuffer()
  const probe = new AudioContext()
  const [humanBuf, aiBuf] = await Promise.all([
    probe.decodeAudioData(humanArray.slice(0)),
    probe.decodeAudioData(aiArray.slice(0)),
  ])
  await probe.close()

  const sampleRate = humanBuf.sampleRate
  const insertSample = Math.max(0, Math.floor(insertAtSec * sampleRate))
  const outLength = Math.max(humanBuf.length, insertSample + aiBuf.length)
  const offline = new OfflineAudioContext(1, outLength, sampleRate)
  const out = offline.createBuffer(1, outLength, sampleRate)
  const outData = out.getChannelData(0)
  const humanData = humanBuf.getChannelData(0)
  const aiData = aiBuf.getChannelData(0)

  outData.set(humanData)
  for (let i = 0; i < aiData.length; i++) {
    const idx = insertSample + i
    if (idx < outLength) {
      outData[idx] = Math.max(-1, Math.min(1, outData[idx] + aiData[i] * aiGain))
    }
  }

  const wav = audioBufferToWav(out)
  return new File([wav], `mixed_${Date.now()}.wav`, { type: "audio/wav" })
}
