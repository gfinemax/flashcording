"use client"

import { motion } from "framer-motion"
import { useEffect, useRef } from "react"

export function MeshGradientSVG() {
  const audioContextRef = useRef<AudioContext | null>(null)
  const isAudioEnabledRef = useRef(false)

  // 오디오 컨텍스트 초기화 함수
  const initAudio = async () => {
    if (typeof window === "undefined") return

    // AudioContext가 없거나 closed 상태면 새로 생성
    if (!audioContextRef.current || audioContextRef.current.state === "closed") {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        console.log("🔊 AudioContext created, state:", audioContextRef.current.state)
      } catch (error) {
        console.error("❌ Audio initialization failed:", error)
        return
      }
    }

    // AudioContext가 suspended 상태면 resume
    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume()
        console.log("▶️ AudioContext resumed")
      } catch (error) {
        console.error("❌ Audio resume failed:", error)
        return
      }
    }

    isAudioEnabledRef.current = true
    console.log("✅ Audio fully enabled! State:", audioContextRef.current.state)
  }

  // 페이지 로드 시 사용자 인터랙션 대기
  useEffect(() => {
    const handleInteraction = () => {
      if (!isAudioEnabledRef.current) {
        initAudio()
        console.log("👆 User interaction detected - trying to enable audio")
      }
    }

    // 여러 이벤트에 리스너 추가 (once: true로 한 번만 실행)
    window.addEventListener("click", handleInteraction, { once: true })
    window.addEventListener("touchstart", handleInteraction, { once: true })
    window.addEventListener("keydown", handleInteraction, { once: true })

    // 컴포넌트 마운트 시 바로 시도
    console.log("🎵 Component mounted - attempting audio init")
    initAudio()

    return () => {
      // AudioContext를 닫지 않음 - 재사용 가능하도록 유지
      console.log("🧹 Cleanup - keeping AudioContext alive")
    }
  }, [])

  // 전기 방전 소리 1: 찌지직~ (짧은 크래클)
  const playElectricCrackle = async () => {
    if (!audioContextRef.current) {
      console.log("⚠️ AudioContext not initialized")
      return
    }

    // suspended 상태면 resume 시도
    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume()
        console.log("▶️ Resumed for playback")
      } catch (e) {
        console.error("Resume failed:", e)
        return
      }
    }

    const ctx = audioContextRef.current
    const duration = 0.15

    // 노이즈 버퍼 생성
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    // 전기 아크 노이즈
    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / bufferSize / 0.3)
      data[i] = (Math.random() * 2 - 1) * envelope
    }

    const source = ctx.createBufferSource()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    // 고주파 필터
    filter.type = "highpass"
    filter.frequency.setValueAtTime(2000, ctx.currentTime)

    gainNode.gain.setValueAtTime(0.25, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    source.buffer = buffer
    source.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    source.start(ctx.currentTime)
  }

  // 전기 방전 소리 2: 찌익~ (긴 스파크)
  const playElectricSpark = async () => {
    if (!audioContextRef.current) return

    // suspended 상태면 resume 시도
    if (audioContextRef.current.state === "suspended") {
      try {
        await audioContextRef.current.resume()
      } catch (e) {
        console.error("Resume failed:", e)
        return
      }
    }

    const ctx = audioContextRef.current
    const duration = 0.35

    // 주 오실레이터 (고주파 톤)
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = "sawtooth"
    osc.frequency.setValueAtTime(3000, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(1500, ctx.currentTime + duration)

    filter.type = "bandpass"
    filter.frequency.setValueAtTime(2500, ctx.currentTime)
    filter.Q.setValueAtTime(3, ctx.currentTime)

    gainNode.gain.setValueAtTime(0.2, ctx.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    osc.connect(filter)
    filter.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)

    // 노이즈 레이어 추가
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)

    for (let i = 0; i < bufferSize; i++) {
      const envelope = Math.exp(-i / bufferSize / 0.4)
      data[i] = (Math.random() * 2 - 1) * envelope * 0.3
    }

    const noiseSource = ctx.createBufferSource()
    const noiseGain = ctx.createGain()
    const noiseFilter = ctx.createBiquadFilter()

    noiseFilter.type = "highpass"
    noiseFilter.frequency.setValueAtTime(3000, ctx.currentTime)

    noiseGain.gain.setValueAtTime(0.15, ctx.currentTime)
    noiseGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration)

    noiseSource.buffer = buffer
    noiseSource.connect(noiseFilter)
    noiseFilter.connect(noiseGain)
    noiseGain.connect(ctx.destination)

    noiseSource.start(ctx.currentTime)
  }

  // 메인 전기 방전 패턴: 찌지직~ 찌익~ 찌지직~ 찌익~ (2초마다 반복)
  useEffect(() => {
    const mainInterval = setInterval(() => {
      console.log("⚡ 찌지직~")
      playElectricCrackle()

      setTimeout(() => {
        console.log("⚡ 찌익~")
        playElectricSpark()
      }, 400)

      setTimeout(() => {
        console.log("⚡ 찌지직~")
        playElectricCrackle()
      }, 900)

      setTimeout(() => {
        console.log("⚡ 찌익~")
        playElectricSpark()
      }, 1300)
    }, 2000)

    return () => clearInterval(mainInterval)
  }, [])

  // 추가 랜덤 전기 스파크 (분위기용)
  useEffect(() => {
    const randomInterval = setInterval(() => {
      if (Math.random() > 0.6) {
        playElectricCrackle()
      }
    }, 1200)

    return () => clearInterval(randomInterval)
  }, [])

  return (
    <motion.div
      className="relative w-full max-w-sm mx-auto p-8 rounded-lg"
      animate={{
        scale: [1, 1.05, 1],
      }}
      transition={{
        duration: 2,
        repeat: Number.POSITIVE_INFINITY,
        ease: "easeInOut",
      }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="280"
        height="320"
        viewBox="0 0 280 320"
        className="w-full h-auto"
      >
        <defs>
          {/* 메인 번개 그라디언트 - Deep Indigo to Electric Blue */}
          <linearGradient id="boltGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#60A5FA", stopOpacity: 1 }} />
            <stop offset="50%" style={{ stopColor: "#3B82F6", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#1E3A8A", stopOpacity: 1 }} />
          </linearGradient>

          {/* 네온 마젠타 악센트 */}
          <linearGradient id="accentGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style={{ stopColor: "#F472B6", stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: "#EC4899", stopOpacity: 1 }} />
          </linearGradient>

          {/* 글로우 효과 */}
          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 강한 글로우 */}
          <filter id="strongGlow">
            <feGaussianBlur stdDeviation="15" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* 배경 원형 글로우 */}
        <motion.circle
          cx="140"
          cy="160"
          r="100"
          fill="url(#boltGrad)"
          opacity="0.2"
          animate={{
            r: [100, 120, 100],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* 메인 번개 */}
        <motion.g
          filter="url(#strongGlow)"
          animate={{
            opacity: [1, 0.8, 1],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          style={{ transformOrigin: "140px 160px" }}
        >
          <motion.path
            d="M 160 40 L 120 140 L 150 140 L 110 240 L 180 130 L 145 130 L 160 40 Z"
            fill="url(#boltGrad)"
            stroke="#60A5FA"
            strokeWidth="2"
            animate={{
              fill: ["url(#boltGrad)", "url(#accentGrad)", "url(#boltGrad)"],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
          />
        </motion.g>

        {/* 번개 중심 하이라이트 */}
        <motion.path
          d="M 150 100 L 135 140 L 145 140 L 130 180 L 160 140 L 148 140 L 150 100 Z"
          fill="#FFFFFF"
          opacity="0.6"
          animate={{
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 1,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />

        {/* 에너지 파티클들 */}
        {[...Array(8)].map((_, i) => {
          const angle = (i * 360) / 8
          const startX = 140 + Math.cos((angle * Math.PI) / 180) * 80
          const startY = 160 + Math.sin((angle * Math.PI) / 180) * 80
          const endX = 140 + Math.cos((angle * Math.PI) / 180) * 120
          const endY = 160 + Math.sin((angle * Math.PI) / 180) * 120

          return (
            <motion.circle
              key={i}
              r="4"
              fill={i % 2 === 0 ? "#60A5FA" : "#EC4899"}
              filter="url(#glow)"
              animate={{
                cx: [startX, endX, startX],
                cy: [startY, endY, startY],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                delay: i * 0.25,
                repeat: Number.POSITIVE_INFINITY,
                ease: "linear",
              }}
            />
          )
        })}

        {/* 전기 스파크 효과 */}
        <motion.g opacity="0.8">
          {/* 위쪽 스파크 */}
          <motion.line
            x1="140"
            y1="40"
            x2="150"
            y2="20"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              opacity: [0, 1, 0],
              x2: [150, 155, 150],
            }}
            transition={{
              duration: 0.3,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1,
            }}
          />
          <motion.line
            x1="140"
            y1="40"
            x2="130"
            y2="25"
            stroke="#EC4899"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              opacity: [0, 1, 0],
              x2: [130, 125, 130],
            }}
            transition={{
              duration: 0.3,
              delay: 0.15,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1,
            }}
          />

          {/* 아래쪽 스파크 */}
          <motion.line
            x1="110"
            y1="240"
            x2="100"
            y2="260"
            stroke="#60A5FA"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              opacity: [0, 1, 0],
              x2: [100, 95, 100],
            }}
            transition={{
              duration: 0.3,
              delay: 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1,
            }}
          />
          <motion.line
            x1="110"
            y1="240"
            x2="120"
            y2="255"
            stroke="#EC4899"
            strokeWidth="2"
            strokeLinecap="round"
            animate={{
              opacity: [0, 1, 0],
              x2: [120, 125, 120],
            }}
            transition={{
              duration: 0.3,
              delay: 0.65,
              repeat: Number.POSITIVE_INFINITY,
              repeatDelay: 1,
            }}
          />
        </motion.g>

        {/* 번개 주변 에너지 링 */}
        <motion.circle
          cx="140"
          cy="160"
          r="60"
          fill="none"
          stroke="#60A5FA"
          strokeWidth="2"
          opacity="0.3"
          animate={{
            r: [60, 80, 60],
            opacity: [0.3, 0, 0.3],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeOut",
          }}
        />

        {/* 플래시 효과 */}
        <motion.circle
          cx="140"
          cy="140"
          r="5"
          fill="#FFFFFF"
          filter="url(#strongGlow)"
          animate={{
            opacity: [0, 1, 0],
            r: [5, 8, 5],
          }}
          transition={{
            duration: 0.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatDelay: 2,
          }}
        />

        {/* 데이터 흐름 라인 */}
        <motion.path
          d="M 50 100 Q 90 120 130 100"
          stroke="#EC4899"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="5,5"
          animate={{
            strokeDashoffset: [0, -10],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
        <motion.path
          d="M 150 220 Q 190 200 230 220"
          stroke="#60A5FA"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="5,5"
          animate={{
            strokeDashoffset: [0, -10],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            delay: 0.75,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </svg>

      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </motion.div>
  )
}
