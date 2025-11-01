"use client"

import { useCallback, useRef } from "react"

export function useDischargeSound() {
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
    }
    return audioContextRef.current
  }, [])

  const playDischarge = useCallback(() => {
    const ctx = getAudioContext()
    const currentTime = ctx.currentTime

    // 메인 방전 소리 (화이트 노이즈 기반)
    const bufferSize = ctx.sampleRate * 0.3 // 300ms
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // 화이트 노이즈 생성
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1
    }

    const noise = ctx.createBufferSource()
    noise.buffer = buffer

    // 노이즈 필터 (전파 특성)
    const filter = ctx.createBiquadFilter()
    filter.type = "bandpass"
    filter.frequency.setValueAtTime(2000, currentTime)
    filter.frequency.exponentialRampToValueAtTime(500, currentTime + 0.3)
    filter.Q.value = 1.5

    // 볼륨 엔벨로프 (급격한 시작, 서서히 감소)
    const gainNode = ctx.createGain()
    gainNode.gain.setValueAtTime(0, currentTime)
    gainNode.gain.linearRampToValueAtTime(0.3, currentTime + 0.01) // 급격한 시작
    gainNode.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.3) // 서서히 감소

    // 전기 톤 추가 (고주파 성분)
    const osc1 = ctx.createOscillator()
    osc1.type = "square"
    osc1.frequency.setValueAtTime(3000, currentTime)
    osc1.frequency.exponentialRampToValueAtTime(1000, currentTime + 0.15)

    const osc1Gain = ctx.createGain()
    osc1Gain.gain.setValueAtTime(0, currentTime)
    osc1Gain.gain.linearRampToValueAtTime(0.15, currentTime + 0.005)
    osc1Gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.15)

    // 저주파 럼블 (전력 방출감)
    const osc2 = ctx.createOscillator()
    osc2.type = "sine"
    osc2.frequency.setValueAtTime(60, currentTime)
    osc2.frequency.exponentialRampToValueAtTime(30, currentTime + 0.2)

    const osc2Gain = ctx.createGain()
    osc2Gain.gain.setValueAtTime(0, currentTime)
    osc2Gain.gain.linearRampToValueAtTime(0.2, currentTime + 0.02)
    osc2Gain.gain.exponentialRampToValueAtTime(0.01, currentTime + 0.2)

    // 연결
    noise.connect(filter)
    filter.connect(gainNode)

    osc1.connect(osc1Gain)
    osc1Gain.connect(gainNode)

    osc2.connect(osc2Gain)
    osc2Gain.connect(gainNode)

    gainNode.connect(ctx.destination)

    // 재생
    const stopTime = currentTime + 0.3
    noise.start(currentTime)
    noise.stop(stopTime)

    osc1.start(currentTime)
    osc1.stop(currentTime + 0.15)

    osc2.start(currentTime)
    osc2.stop(currentTime + 0.2)
  }, [getAudioContext])

  return { playDischarge }
}
