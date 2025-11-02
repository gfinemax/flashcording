"use client"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { MeshGradientSVG } from "@/components/mesh-gradient-svg"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import { useDischargeSound } from "@/hooks/use-discharge-sound"

export default function IntroPage() {
  const router = useRouter()
  const { playDischarge, stopDischarge } = useDischargeSound()

  // 페이지 로드 시 방전 사운드 재생 (반복)
  useEffect(() => {
    const timer = setTimeout(() => {
      playDischarge()
    }, 500) // 애니메이션과 타이밍 맞춤

    // 페이지를 떠날 때 사운드 정지
    return () => {
      clearTimeout(timer)
      stopDischarge()
    }
  }, [playDischarge, stopDischarge])

  const handleGetStarted = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-8 overflow-hidden">
      <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 flex flex-col items-center gap-8 max-w-2xl mx-auto"
      >
        <div className="max-w-md">
          <MeshGradientSVG />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-center space-y-4"
        >
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Flash
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">AI-Powered Coding Agent</p>
          <p className="text-sm md:text-base text-muted-foreground max-w-md">
            Boost your productivity with intelligent code generation, automated commits, and gamified learning
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            size="lg"
            onClick={handleGetStarted}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => router.push("/agent")}
            className="border-primary/20 hover:bg-primary/10"
          >
            Explore Features
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          <button
            onClick={handleGetStarted}
            className="hover:text-primary transition-colors cursor-pointer underline-offset-4 hover:underline"
          >
            Click here to get started
          </button>
        </motion.div>
      </motion.div>
    </div>
  )
}
