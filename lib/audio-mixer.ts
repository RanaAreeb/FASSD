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

// Models (AASIST, HybridResNet) were trained on 16 kHz mono WAV.
// Browser MediaRecorder captures at the device native rate (44.1 or 48 kHz).
// Sending native-rate audio causes spectral mismatches that inflate the AI-origin score
// for genuine human recordings. Always resample to 16 kHz before upload.
const MODEL_SAMPLE_RATE = 16000

/** Convert browser MediaRecorder output (webm/ogg) to 16 kHz mono WAV for backend upload. */
export async function blobToWavFile(blob: Blob, filename: string): Promise<File> {
  const arrayBuffer = await blob.arrayBuffer()
  // Decode at native rate first, then resample to MODEL_SAMPLE_RATE via OfflineAudioContext.
  const probeCtx = new AudioContext()
  let nativeBuffer: AudioBuffer
  try {
    nativeBuffer = await probeCtx.decodeAudioData(arrayBuffer.slice(0))
  } finally {
    await probeCtx.close()
  }

  const nativeSamples = nativeBuffer.length
  const nativeRate = nativeBuffer.sampleRate
  const targetLength = Math.ceil((nativeSamples / nativeRate) * MODEL_SAMPLE_RATE)

  // OfflineAudioContext resamples during render.
  const offline = new OfflineAudioContext(1, targetLength, MODEL_SAMPLE_RATE)
  const src = offline.createBufferSource()

  // Mix to mono if stereo before resampling.
  if (nativeBuffer.numberOfChannels === 1) {
    src.buffer = nativeBuffer
  } else {
    const monoNative = new AudioContext().createBuffer(1, nativeSamples, nativeRate)
    const mix = monoNative.getChannelData(0)
    for (let ch = 0; ch < nativeBuffer.numberOfChannels; ch++) {
      const chData = nativeBuffer.getChannelData(ch)
      for (let i = 0; i < nativeSamples; i++) mix[i] += chData[i] / nativeBuffer.numberOfChannels
    }
    src.buffer = monoNative
  }

  src.connect(offline.destination)
  src.start(0)
  const resampled = await offline.startRendering()

  const wav = audioBufferToWav(resampled)
  const name = filename.toLowerCase().endsWith(".wav") ? filename : filename.replace(/\.[^.]+$/, "") + ".wav"
  return new File([wav], name, { type: "audio/wav" })
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
