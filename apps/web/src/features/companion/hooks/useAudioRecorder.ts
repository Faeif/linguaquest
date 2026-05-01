'use client'

import { useCallback, useRef, useState } from 'react'

interface SpeechRecognitionInstance {
  continuous: boolean
  interimResults: boolean
  lang: string
  start(): void
  stop(): void
  onresult: ((event: { results: { transcript: string }[][] }) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance
}

export function useAudioRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null)

  const initRecognition = useCallback(() => {
    if (typeof window === 'undefined') return false
    if (recognitionRef.current) return true

    const win = window as WindowWithSpeechRecognition
    const SpeechRecognition = win.SpeechRecognition ?? win.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser doesn't support speech recognition. Please try Google Chrome or Edge.")
      return false
    }

    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'zh-CN' // Specifically optimizing for Chinese
    recognitionRef.current = recognition
    return true
  }, [])

  const startRecording = useCallback(async () => {
    if (!initRecognition()) return

    try {
      setIsRecording(true)
      recognitionRef.current?.start()
    } catch (err) {
      console.error('Speech recognition start error:', err)
      setIsRecording(false)
    }
  }, [initRecognition])

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      if (!recognitionRef.current || !isRecording) {
        setIsRecording(false)
        return resolve(null)
      }

      setIsRecording(false)
      setIsProcessing(true)

      let resolved = false

      recognitionRef.current.onresult = (event: { results: { transcript: string }[][] }) => {
        if (resolved) return
        resolved = true
        const text = event.results[0][0].transcript
        setIsProcessing(false)
        resolve(text)
      }

      recognitionRef.current.onerror = (event: { error: string }) => {
        if (resolved) return
        resolved = true
        console.error('Speech recognition error', event.error)
        setIsProcessing(false)
        resolve(null)
      }

      recognitionRef.current.onend = () => {
        if (!resolved) {
          resolved = true
          setIsProcessing(false)
          resolve(null)
        }
      }

      try {
        recognitionRef.current.stop()
      } catch {
        if (!resolved) resolve(null)
      }
    })
  }, [isRecording])

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    // Mock transcribeAudio to satisfy the old interface if needed anywhere else
    transcribeAudio: async () => null,
  }
}
