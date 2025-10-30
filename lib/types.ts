// User types
export interface User {
  id: string
  email: string
  username: string
  level: number
  exp: number
  avatar?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
}

// Agent types
export interface AgentJob {
  id: string
  prompt: string
  context: any
  status: "pending" | "processing" | "completed" | "failed"
  progress: number
  message: string
  result?: any
}

// Git types
export interface GitProject {
  id: string
  name: string
  path: string
  lastScanned?: string
}

export interface GitCommit {
  id: string
  hash: string
  message: string
  author: string
  timestamp: string
  filesChanged: number
}

export interface GitDiff {
  filePath: string
  language: string
  original: string
  modified: string
  additions: number
  deletions: number
}

// Quiz types
export interface QuizPool {
  id: number
  title: string
  category: string
  difficulty: "easy" | "medium" | "hard"
  question_count: number
}

export interface QuizQuestion {
  id: number
  text: string
  type?: "multiple-choice" | "code-writing"
  options: QuizOption[]
  correct_option_id: number
  explanation?: string
  code_template?: string
  test_cases?: TestCase[]
  language?: string
}

export interface QuizOption {
  id: number
  text: string
}

export interface QuizSession {
  session_id: string
  pool_id: number
  questions: QuizQuestion[]
  current_question: number
  score: number
}

export interface TestCase {
  input: string
  expected_output: string
}

// Gamification types
export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: "common" | "rare" | "epic"
  earned: boolean
  earnedAt?: string
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  exp: number
  avatar?: string
}

// Activity types
export interface Activity {
  id: string
  user_id: string
  event: string
  description: string
  exp_gained: number
  timestamp: string
  context?: any
}
