"use client"

import { useCallback, useEffect, useRef } from "react"

export function useDischargeSound() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioBufferRef = useRef<AudioBuffer | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  // MP3 파일 로드
  useEffect(() => {
    const loadAudio = async () => {
      try {
        const ctx = getAudioContext()
        const response = await fetch("/sounds/flash.mp3")
        const arrayBuffer = await response.arrayBuffer()
        const audioBuffer = await ctx.decodeAudioData(arrayBuffer)
        audioBufferRef.current = audioBuffer
      } catch (error) {
        console.error("Failed to load discharge sound:", error)
      }
    }

    loadAudio()
  }, [getAudioContext])

  const playDischarge = useCallback(() => {
    // 이미 재생 중이면 중복 재생 방지
    if (sourceRef.current) {
      return
    }

    // 오디오 버퍼가 로드되지 않았으면 재생하지 않음
    if (!audioBufferRef.current) {
      console.warn("Audio buffer not loaded yet")
      return
    }

    const ctx = getAudioContext()
    const currentTime = ctx.currentTime

    // BufferSource 생성 (MP3 재생용)
    const source = ctx.createBufferSource()
    source.buffer = audioBufferRef.current

    // 루프 설정 (무한 반복)
    source.loop = true

    // GainNode로 볼륨 제어
    const gainNode = ctx.createGain()

    // 페이드 인 효과 (0.1초)
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(0.5, currentTime + 0.1)

    // 선택적: EQ 필터 추가 (저음 강조)
    const lowShelf = ctx.createBiquadFilter()
    lowShelf.type = "lowshelf"
    lowShelf.frequency.value = 200
    lowShelf.gain.value = 3 // +3dB 저음 강조

    // 연결: source -> filter -> gain -> destination
    source.connect(lowShelf)
    lowShelf.connect(gainNode)
    gainNode.connect(ctx.destination)

    // 재생 (무한 반복)
    source.start(currentTime)

    // 참조 저장
    sourceRef.current = source
  }, [getAudioContext])

  const stopDischarge = useCallback(() => {
    if (sourceRef.current) {
      try {
        sourceRef.current.stop()
      } catch (error) {
        // Already stopped
      }
      sourceRef.current = null
    }
  }, [])

  return { playDischarge, stopDischarge }
}
