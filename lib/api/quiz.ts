import { apiClient } from "./client"
import type { QuizPool, QuizSession } from "@/lib/types"

export const quizAPI = {
  // 퀴즈 풀 목록 조회
  getQuizPools: async (params?: { tag?: string; difficulty?: string }) => {
    const { data } = await apiClient.get<QuizPool[]>("/quizzes", { params })
    return data
  },

  // 퀴즈 세션 시작
  startSession: async (poolId: number, numQuestions: number) => {
    const { data } = await apiClient.post<QuizSession>("/quiz/sessions", {
      pool_id: poolId,
      num_questions: numQuestions,
    })
    return data
  },

  // 세션 정보 조회
  getSession: async (sessionId: string) => {
    const { data } = await apiClient.get<QuizSession>(`/quiz/sessions/${sessionId}`)
    return data
  },

  // 답안 제출
  submitAnswer: async (sessionId: string, questionId: number, selectedOptionId: number) => {
    const { data } = await apiClient.post(`/quiz/sessions/${sessionId}/answers`, {
      question_id: questionId,
      selected_option_id: selectedOptionId,
    })
    return data
  },

  // 세션 종료
  finishSession: async (sessionId: string) => {
    const { data } = await apiClient.post(`/quiz/sessions/${sessionId}/finish`)
    return data
  },

  // 퀴즈 히스토리
  getHistory: async () => {
    const { data } = await apiClient.get("/quiz/history")
    return data
  },

  // 추천 퀴즈
  getRecommendations: async () => {
    const { data } = await apiClient.get<QuizPool[]>("/quiz/recommendations")
    return data
  },
}
