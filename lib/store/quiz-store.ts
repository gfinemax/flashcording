import { create } from "zustand"
import type { QuizSession } from "@/lib/types"

interface QuizState {
  currentSession: QuizSession | null
  currentQuestionIndex: number
  answers: Record<number, number>
  score: number
  isSubmitting: boolean

  setSession: (session: QuizSession) => void
  setCurrentQuestion: (index: number) => void
  submitAnswer: (questionId: number, optionId: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  finishSession: () => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentSession: null,
  currentQuestionIndex: 0,
  answers: {},
  score: 0,
  isSubmitting: false,

  setSession: (session) => set({ currentSession: session, currentQuestionIndex: 0, answers: {}, score: 0 }),

  setCurrentQuestion: (index) => set({ currentQuestionIndex: index }),

  submitAnswer: (questionId, optionId) => {
    const { answers, currentSession } = get()
    const newAnswers = { ...answers, [questionId]: optionId }

    // 정답 체크
    const question = currentSession?.questions.find((q) => q.id === questionId)
    let newScore = get().score
    if (question && question.correct_option_id === optionId) {
      newScore += 1
    }

    set({ answers: newAnswers, score: newScore })
  },

  nextQuestion: () => {
    const { currentQuestionIndex, currentSession } = get()
    if (currentSession && currentQuestionIndex < currentSession.questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 })
    }
  },

  previousQuestion: () => {
    const { currentQuestionIndex } = get()
    if (currentQuestionIndex > 0) {
      set({ currentQuestionIndex: currentQuestionIndex - 1 })
    }
  },

  finishSession: () => {
    set({ isSubmitting: true })
  },

  reset: () =>
    set({
      currentSession: null,
      currentQuestionIndex: 0,
      answers: {},
      score: 0,
      isSubmitting: false,
    }),
}))
