"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { QuizCard } from "@/components/quiz-card"
import { QuizQuestionComponent } from "@/components/quiz-question"
import { CodeWritingQuestion } from "@/components/code-writing-question"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useQuizStore } from "@/lib/store/quiz-store"
import { mockQuizPools, createMockQuizSession } from "@/lib/mocks/quiz"
import { ArrowLeft, Trophy, Target } from "lucide-react"
import { getQuizPools, startQuizSession, completeQuiz } from "@/lib/services/quiz"
import { env } from "@/lib/env"
import { toast } from "sonner"

export default function QuizPage() {
  const router = useRouter()
  const [selectedPool, setSelectedPool] = useState<number | null>(null)
  const [showResults, setShowResults] = useState(false)
  const [quizPools, setQuizPools] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)

  const {
    currentSession,
    currentQuestionIndex,
    answers,
    score,
    setSession,
    setCurrentQuestion,
    submitAnswer,
    nextQuestion,
    previousQuestion,
    reset,
  } = useQuizStore()

  // Load quiz pools on mount
  useEffect(() => {
    const loadQuizPools = async () => {
      try {
        if (env.enableMockData) {
          setQuizPools(mockQuizPools)
        } else {
          const pools = await getQuizPools()
          setQuizPools(pools)
        }
      } catch (error) {
        toast.error("Failed to load quiz pools")
        // Fallback to mock data
        setQuizPools(mockQuizPools)
      }
    }
    loadQuizPools()
  }, [])

  const handleStartQuiz = async (poolId: number) => {
    setIsLoading(true)
    try {
      if (env.enableMockData) {
        const session = createMockQuizSession(poolId)
        setSession(session)
      } else {
        const session = await startQuizSession(poolId)
        setSession(session)
      }
      setSelectedPool(poolId)
    } catch (error) {
      toast.error("Failed to start quiz")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswer = (optionId: number) => {
    if (currentSession) {
      const currentQuestion = currentSession.questions[currentQuestionIndex]
      submitAnswer(currentQuestion.id, optionId)
    }
  }

  const handleNext = async () => {
    if (currentSession && currentQuestionIndex === currentSession.questions.length - 1) {
      // Quiz completed - submit to backend
      if (!env.enableMockData) {
        try {
          const result = await completeQuiz({
            session_id: currentSession.id,
            answers,
          })
          // Update score with backend result
          console.log("Quiz result:", result)
        } catch (error) {
          console.error("Failed to submit quiz:", error)
        }
      }
      setShowResults(true)
    } else {
      nextQuestion()
    }
  }

  const handleBackToList = () => {
    reset()
    setSelectedPool(null)
    setShowResults(false)
  }

  // 결과 화면
  if (showResults && currentSession) {
    const percentage = Math.round((score / currentSession.questions.length) * 100)
    const expGained = score * 10

    return (
      <AppLayout>
        <div className="p-6">
          <div className="max-w-2xl mx-auto space-y-6">
            <Button variant="ghost" onClick={handleBackToList}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              퀴즈 목록으로
            </Button>

            <Card className="border-primary">
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <Trophy className="h-10 w-10 text-primary" />
                </div>
                <CardTitle className="text-3xl">퀴즈 완료!</CardTitle>
                <CardDescription>수고하셨습니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center space-y-2">
                  <div className="text-5xl font-bold text-primary">{percentage}%</div>
                  <p className="text-sm text-muted-foreground">
                    {score} / {currentSession.questions.length} 정답
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Target className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <div className="text-2xl font-bold text-green-500">+{expGained} XP</div>
                      <p className="text-sm text-muted-foreground">획득 경험치</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <Trophy className="h-8 w-8 mx-auto mb-2 text-orange-500" />
                      <div className="text-2xl font-bold">{score}</div>
                      <p className="text-sm text-muted-foreground">정답 수</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <Button className="w-full" onClick={handleBackToList}>
                    다른 퀴즈 풀기
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full bg-transparent"
                    onClick={() => router.push("/gamification")}
                  >
                    프로필 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    )
  }

  // 퀴즈 진행 화면
  if (currentSession && selectedPool) {
    const currentQuestion = currentSession.questions[currentQuestionIndex]
    const progress = ((currentQuestionIndex + 1) / currentSession.questions.length) * 100

    return (
      <AppLayout>
        <div className="p-6">
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <Button variant="ghost" onClick={handleBackToList}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                나가기
              </Button>
              <div className="text-sm text-muted-foreground">
                정답률:{" "}
                {currentSession.questions.length > 0 ? Math.round((score / (currentQuestionIndex + 1)) * 100) : 0}%
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">진행률</span>
                <span className="font-medium">{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} />
            </div>

            {currentQuestion.type === "code-writing" ? (
              <CodeWritingQuestion
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={currentSession.questions.length}
                onNext={handleNext}
                onPrevious={previousQuestion}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === currentSession.questions.length - 1}
              />
            ) : (
              <QuizQuestionComponent
                question={currentQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={currentSession.questions.length}
                selectedOption={answers[currentQuestion.id]}
                onAnswer={handleAnswer}
                onNext={handleNext}
                onPrevious={previousQuestion}
                isFirst={currentQuestionIndex === 0}
                isLast={currentQuestionIndex === currentSession.questions.length - 1}
              />
            )}
          </div>
        </div>
      </AppLayout>
    )
  }

  // 퀴즈 목록 화면
  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">코딩 퀴즈</h1>
              <p className="text-muted-foreground">퀴즈를 풀고 실력을 향상시키세요</p>
            </div>
            <Button variant="outline" onClick={() => router.push("/agent")}>
              에이전트로 돌아가기
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizPools.map((pool) => (
              <QuizCard key={pool.id} pool={pool} onStart={handleStartQuiz} />
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
