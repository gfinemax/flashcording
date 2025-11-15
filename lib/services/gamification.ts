/**
 * Gamification API Service
 * Handles badges, achievements, leaderboards with Django backend
 */

import { apiClient } from "@/lib/api/client"

export interface Badge {
  id: number
  name: string
  description: string
  icon: string
  category: string
  earned: boolean
  earned_at?: string
  progress?: number
  total?: number
}

export interface LeaderboardEntry {
  rank: number
  user_id: string
  username: string
  exp: number
  avatar?: string
  level: number
}

export interface Activity {
  id: string
  type: "quiz" | "commit" | "code" | "badge"
  title: string
  description: string
  exp_gained: number
  timestamp: string
  icon?: string
}

export interface UserStats {
  total_commits: number
  total_quizzes: number
  total_code: number
  total_badges: number
  streak_days: number
  total_exp: number
  level: number
}

/**
 * Get user's badges
 */
export async function getBadges(): Promise<Badge[]> {
  const response = await apiClient.get<Badge[]>("/api/gamification/badges")
  return response.data
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(limit = 10): Promise<LeaderboardEntry[]> {
  const response = await apiClient.get<LeaderboardEntry[]>("/api/gamification/leaderboard", {
    params: { limit },
  })
  return response.data
}

/**
 * Get user's activity feed
 */
export async function getActivities(limit = 20): Promise<Activity[]> {
  const response = await apiClient.get<Activity[]>("/api/gamification/activities", {
    params: { limit },
  })
  return response.data
}

/**
 * Get user's stats
 */
export async function getUserStats(): Promise<UserStats> {
  const response = await apiClient.get<UserStats>("/api/gamification/stats")
  return response.data
}

/**
 * Award a badge to the user
 */
export async function awardBadge(badgeId: number): Promise<{
  badge: Badge
  exp_gained: number
}> {
  const response = await apiClient.post(`/api/gamification/badges/${badgeId}/award`)
  return response.data
}

/**
 * Add experience points
 */
export async function addExperience(
  amount: number,
  source: string,
): Promise<{
  new_exp: number
  level_up: boolean
  new_level?: number
}> {
  const response = await apiClient.post("/api/gamification/exp", {
    amount,
    source,
  })
  return response.data
}
