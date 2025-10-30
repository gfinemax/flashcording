import { apiClient } from "./client"
import type { Badge, LeaderboardEntry, Activity } from "@/lib/types"

export const gamificationAPI = {
  // 프로필 조회
  getProfile: async () => {
    const { data } = await apiClient.get("/gami/profile")
    return data
  },

  // 이벤트 기록
  recordEvent: async (event: string, context?: any) => {
    const { data } = await apiClient.post("/gami/events", {
      event_name: event,
      context,
    })
    return data
  },

  // 배지 목록
  getBadges: async (status?: "earned" | "available") => {
    const { data } = await apiClient.get<Badge[]>("/gami/badges", {
      params: { status },
    })
    return data
  },

  // 리더보드
  getLeaderboard: async (period: "weekly" | "monthly" | "all" = "weekly") => {
    const { data } = await apiClient.get<LeaderboardEntry[]>("/gami/leaderboard", {
      params: { period },
    })
    return data
  },

  // 활동 피드
  getActivities: async (limit = 20) => {
    const { data } = await apiClient.get<Activity[]>("/gami/activities", {
      params: { limit },
    })
    return data
  },

  // 리워드 교환
  redeemReward: async (rewardId: string, quantity = 1) => {
    const { data } = await apiClient.post("/gami/redeem", {
      reward_id: rewardId,
      quantity,
    })
    return data
  },
}
