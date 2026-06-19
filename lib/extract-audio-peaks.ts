export type AudioPeakData = {
  peaks: number[]
  duration: number
}

/** Decode an audio file in the browser and downsample to normalized peak bars. */
export async function extractAudioPeaks(file: File, barCount = 240): Promise<AudioPeakData> {
  const arrayBuffer = await file.arrayBuffer()
  const audioContext = new AudioContext()
  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0))
    const channel = audioBuffer.getChannelData(0)
    const samplesPerBar = Math.max(1, Math.floor(channel.length / barCount))
    const peaks: number[] = []

    for (let i = 0; i < barCount; i++) {
      const start = i * samplesPerBar
      const end = Math.min(start + samplesPerBar, channel.length)
      let max = 0
      for (let j = start; j < end; j++) {
        max = Math.max(max, Math.abs(channel[j]))
      }
      peaks.push(max)
    }

    const maxPeak = Math.max(...peaks, 0.001)
    return {
      peaks: peaks.map((p) => p / maxPeak),
      duration: audioBuffer.duration,
    }
  } finally {
    await audioContext.close()
  }
}
