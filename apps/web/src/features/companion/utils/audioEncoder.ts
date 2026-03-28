// Convert raw PCM float32 audio data to a 16kHz, 16-bit Mono WAV file
export function encodeWAV(samples: Float32Array, sampleRate: number = 16000): Blob {
  const buffer = new ArrayBuffer(44 + samples.length * 2)
  const view = new DataView(buffer)

  // Write RIFF header
  writeString(view, 0, 'RIFF')
  view.setUint32(4, 36 + samples.length * 2, true)
  writeString(view, 8, 'WAVE')
  writeString(view, 12, 'fmt ')
  view.setUint32(16, 16, true) // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
  view.setUint16(22, 1, true) // NumChannels (1 mono)
  view.setUint32(24, sampleRate, true) // SampleRate
  view.setUint32(28, sampleRate * 2, true) // ByteRate (SampleRate * NumChannels * BitsPerSample/8)
  view.setUint16(32, 2, true) // BlockAlign (NumChannels * BitsPerSample/8)
  view.setUint16(34, 16, true) // BitsPerSample (16-bit)

  // Write data subchunk
  writeString(view, 36, 'data')
  view.setUint32(40, samples.length * 2, true) // Subchunk2Size

  // Write PCM data
  floatTo16BitPCM(view, 44, samples)

  return new Blob([view], { type: 'audio/wav' })
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i))
  }
}

function floatTo16BitPCM(view: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]))
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true)
  }
}

export function downsampleBuffer(
  buffer: Float32Array,
  sampleRate: number,
  outSampleRate: number
): Float32Array {
  if (outSampleRate === sampleRate) {
    return buffer
  }
  const sampleRateRatio = sampleRate / outSampleRate
  const newLength = Math.round(buffer.length / sampleRateRatio)
  const result = new Float32Array(newLength)
  let offsetResult = 0
  let offsetBuffer = 0
  while (offsetResult < result.length) {
    const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio)
    let accum = 0
    let count = 0
    for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
      accum += buffer[i]
      count++
    }
    result[offsetResult] = accum / count
    offsetResult++
    offsetBuffer = nextOffsetBuffer
  }
  return result
}
