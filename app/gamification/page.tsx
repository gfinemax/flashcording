"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { ProfileCard } from "@/components/profile-card"
import { StatsGrid } from "@/components/stats-grid"
import { BadgeGallery } from "@/components/badge-gallery"
import { Leaderboard } from "@/components/leaderboard"
import { ActivityFeed } from "@/components/activity-feed"
import { useUserStore } from "@/lib/store/user-store"
import { mockBadges, mockLeaderboard, mockActivities } from "@/lib/mocks/gamification"
import {
  getBadges,
  getLeaderboard,
  getActivities,
  getUserStats,
  type Badge,
  type LeaderboardEntry,
  type Activity,
  type UserStats,
} from "@/lib/services/gamification"
import { env } from "@/lib/env"
import { toast } from "sonner"

export default function GamificationPage() {
  const router = useRouter()
  const { user } = useUserStore()
  const [badges, setBadges] = useState<Badge[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    const loadGamificationData = async () => {
      setIsLoading(true)
      try {
        if (env.enableMockData) {
          // Use mock data
          setBadges(mockBadges)
          setLeaderboard(mockLeaderboard)
          setActivities(mockActivities)
          setStats({
            total_commits: 15,
            total_quizzes: 23,
            total_code: 42,
            total_badges: mockBadges.filter((b) => b.earned).length,
            streak_days: 7,
            total_exp: user.exp,
            level: user.level,
          })
        } else {
          // Load from API
          const [badgesData, leaderboardData, activitiesData, statsData] = await Promise.all([
            getBadges(),
            getLeaderboard(10),
            getActivities(20),
            getUserStats(),
          ])

          setBadges(badgesData)
          setLeaderboard(leaderboardData)
          setActivities(activitiesData)
          setStats(statsData)
        }
      } catch (error) {
        toast.error("Failed to load gamification data")
        // Fallback to mock data
        setBadges(mockBadges)
        setLeaderboard(mockLeaderboard)
        setActivities(mockActivities)
      } finally {
        setIsLoading(false)
      }
    }

    loadGamificationData()
  }, [user, router])

  if (!user) {
    return null
  }

  const displayStats = stats || {
    total_commits: 0,
    total_quizzes: 0,
    total_code: 0,
    total_badges: 0,
    streak_days: 0,
    total_exp: 0,
    level: 0,
  }

  const leaderboardWithUser = leaderboard.some((entry) => entry.user_id === user.id)
    ? leaderboard
    : [
        ...leaderboard,
        {
          rank: leaderboard.length + 1,
          user_id: user.id,
          username: user.username,
          exp: user.exp,
          avatar: user.avatar,
          level: user.level,
        },
      ]

  return (
    <AppLayout>
      <div className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">프로필</h1>
            <p className="text-muted-foreground">나의 성장 기록을 확인하세요</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ProfileCard
                user={user}
                streakDays={displayStats.streak_days}
                badgeCount={displayStats.total_badges}
              />

              <Leaderboard entries={leaderboardWithUser} currentUserId={user.id} />

              <ActivityFeed activities={activities} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">활동 통계</h2>
                <StatsGrid
                  stats={{
                    totalCommits: displayStats.total_commits,
                    totalQuizzes: displayStats.total_quizzes,
                    totalCode: displayStats.total_code,
                    totalBadges: displayStats.total_badges,
                  }}
                />
              </div>

              <BadgeGallery badges={badges} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
