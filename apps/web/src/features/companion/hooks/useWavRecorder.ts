import { useCallback, useRef, useState } from 'react'
import { downsampleBuffer, encodeWAV } from '../utils/audioEncoder'

export function useWavRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const isRecordingRef = useRef(false)

  const audioContextRef = useRef<AudioContext | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const processorRef = useRef<ScriptProcessorNode | null>(null)
  const audioChunksRef = useRef<Float32Array[]>([])
  const recordingLengthRef = useRef(0)

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream

      // Initialize AudioContext
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const context = new AudioContextClass()
      audioContextRef.current = context

      const source = context.createMediaStreamSource(stream)
      // Create processor (buffer size 4096, 1 input channel, 1 output channel)
      const processor = context.createScriptProcessor(4096, 1, 1)
      processorRef.current = processor

      audioChunksRef.current = []
      recordingLengthRef.current = 0

      processor.onaudioprocess = (e) => {
        if (!isRecordingRef.current) return
        const channelData = e.inputBuffer.getChannelData(0)
        // Copy data because the buffer is reused by the browser
        const chunk = new Float32Array(channelData.length)
        chunk.set(channelData)
        audioChunksRef.current.push(chunk)
        recordingLengthRef.current += chunk.length
      }

      source.connect(processor)
      processor.connect(context.destination)

      isRecordingRef.current = true
      setIsRecording(true)
    } catch (err) {
      console.error('Mic access error:', err)
      isRecordingRef.current = false
      setIsRecording(false)
    }
  }, [])

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    if (!isRecordingRef.current) return null

    isRecordingRef.current = false
    setIsRecording(false)

    // Detach and clean up
    if (processorRef.current && audioContextRef.current) {
      processorRef.current.disconnect()
      processorRef.current.onaudioprocess = null
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop()
      })
    }

    if (!audioContextRef.current) return null

    // Flatten all chunks into a single Float32Array
    const flattenedData = new Float32Array(recordingLengthRef.current)
    let offset = 0
    for (const chunk of audioChunksRef.current) {
      flattenedData.set(chunk, offset)
      offset += chunk.length
    }

    // Downsample to 16000Hz as required by Azure
    const sampleRate = audioContextRef.current.sampleRate
    const downsampled = downsampleBuffer(flattenedData, sampleRate, 16000)

    // Encode to WAV blob
    const wavBlob = encodeWAV(downsampled, 16000)

    // Close context
    await audioContextRef.current.close()
    audioContextRef.current = null
    streamRef.current = null
    processorRef.current = null

    return wavBlob
  }, [])

  return { isRecording, startRecording, stopRecording }
}
