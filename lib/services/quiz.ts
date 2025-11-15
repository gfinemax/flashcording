/**
 * Quiz API Service
 * Handles quiz operations with Django backend
 */

import { apiClient } from "@/lib/api/client"

export interface QuizPool {
  id: number
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  total_questions: number
  estimated_time: number
  category: string
  tags: string[]
}

export interface QuizOption {
  id: number
  text: string
}

export interface QuizQuestion {
  id: number
  type: "multiple-choice" | "code-writing"
  question: string
  code_snippet?: string
  options?: QuizOption[]
  correct_answer?: number
  language?: string
  starter_code?: string
  test_cases?: Array<{
    input: string
    expected_output: string
  }>
}

export interface QuizSession {
  id: string
  pool_id: number
  questions: QuizQuestion[]
  started_at: string
  expires_at: string
}

export interface SubmitAnswerRequest {
  session_id: string
  question_id: number
  answer: number | string
}

export interface SubmitAnswerResponse {
  correct: boolean
  explanation?: string
  score: number
}

export interface CompleteQuizRequest {
  session_id: string
  answers: Record<number, number | string>
}

export interface CompleteQuizResponse {
  score: number
  total_questions: number
  correct_answers: number
  exp_gained: number
  time_taken: number
  results: Array<{
    question_id: number
    correct: boolean
    user_answer: number | string
    correct_answer: number | string
  }>
}

/**
 * Get all available quiz pools
 */
export async function getQuizPools(): Promise<QuizPool[]> {
  const response = await apiClient.get<QuizPool[]>("/api/quizzes/pools")
  return response.data
}

/**
 * Get a specific quiz pool by ID
 */
export async function getQuizPool(poolId: number): Promise<QuizPool> {
  const response = await apiClient.get<QuizPool>(`/api/quizzes/pools/${poolId}`)
  return response.data
}

/**
 * Start a new quiz session
 */
export async function startQuizSession(poolId: number): Promise<QuizSession> {
  const response = await apiClient.post<QuizSession>("/api/quizzes/sessions", {
    pool_id: poolId,
  })
  return response.data
}

/**
 * Submit an answer to a quiz question
 */
export async function submitAnswer(data: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
  const response = await apiClient.post<SubmitAnswerResponse>("/api/quizzes/answers", data)
  return response.data
}

/**
 * Complete a quiz session and get results
 */
export async function completeQuiz(data: CompleteQuizRequest): Promise<CompleteQuizResponse> {
  const response = await apiClient.post<CompleteQuizResponse>("/api/quizzes/complete", data)
  return response.data
}

/**
 * Get user's quiz history
 */
export async function getQuizHistory(): Promise<
  Array<{
    session_id: string
    pool_title: string
    score: number
    completed_at: string
  }>
> {
  const response = await apiClient.get("/api/quizzes/history")
  return response.data
}
