import type { Badge, LeaderboardEntry, Activity } from "@/lib/types"

export const mockBadges: Badge[] = [
  {
    id: "badge-1",
    name: "첫 걸음",
    description: "첫 로그인을 완료했습니다",
    icon: "🎯",
    rarity: "common",
    earned: true,
    earnedAt: "2025-10-20T10:00:00Z",
  },
  {
    id: "badge-2",
    name: "커밋 마스터",
    description: "10개의 커밋을 완료했습니다",
    icon: "💻",
    rarity: "common",
    earned: true,
    earnedAt: "2025-10-22T14:30:00Z",
  },
  {
    id: "badge-3",
    name: "퀴즈 왕",
    description: "50개의 퀴즈를 완료했습니다",
    icon: "👑",
    rarity: "rare",
    earned: false,
  },
  {
    id: "badge-4",
    name: "코드 장인",
    description: "100개의 코드를 생성했습니다",
    icon: "⚡",
    rarity: "rare",
    earned: false,
  },
  {
    id: "badge-5",
    name: "불굴의 의지",
    description: "30일 연속 활동했습니다",
    icon: "🔥",
    rarity: "epic",
    earned: false,
  },
]

export const mockLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user_id: "user-1",
    username: "김철수",
    exp: 3890,
  },
  {
    rank: 2,
    user_id: "user-2",
    username: "이영희",
    exp: 3120,
  },
  {
    rank: 3,
    user_id: "user-3",
    username: "박민수",
    exp: 2850,
  },
  {
    rank: 4,
    user_id: "user-4",
    username: "정수진",
    exp: 2650,
  },
  {
    rank: 5,
    user_id: "user-5",
    username: "최동욱",
    exp: 2500,
  },
]

export const mockActivities: Activity[] = [
  {
    id: "activity-1",
    user_id: "current-user",
    event: "quiz_completed",
    description: "Python 퀴즈 완료",
    exp_gained: 50,
    timestamp: "2025-10-29T08:00:00Z",
  },
  {
    id: "activity-2",
    user_id: "current-user",
    event: "badge_earned",
    description: "첫 커밋 배지 획득",
    exp_gained: 200,
    timestamp: "2025-10-28T15:30:00Z",
  },
  {
    id: "activity-3",
    user_id: "current-user",
    event: "quiz_completed",
    description: "Git 브랜칭 퀴즈 완료",
    exp_gained: 30,
    timestamp: "2025-10-28T10:00:00Z",
  },
]
