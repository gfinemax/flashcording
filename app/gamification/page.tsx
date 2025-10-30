"use client"

import { useRouter } from "next/navigation"
import { AppLayout } from "@/components/app-layout"
import { ProfileCard } from "@/components/profile-card"
import { StatsGrid } from "@/components/stats-grid"
import { BadgeGallery } from "@/components/badge-gallery"
import { Leaderboard } from "@/components/leaderboard"
import { ActivityFeed } from "@/components/activity-feed"
import { Button } from "@/components/ui/button"
import { useUserStore } from "@/lib/store/user-store"
import { mockBadges, mockLeaderboard, mockActivities } from "@/lib/mocks/gamification"
import { BookOpen, Code } from "lucide-react"

export default function GamificationPage() {
  const router = useRouter()
  const { user } = useUserStore()

  if (!user) {
    router.push("/login")
    return null
  }

  const mockStats = {
    totalCommits: 15,
    totalQuizzes: 23,
    totalCode: 42,
    totalBadges: mockBadges.filter((b) => b.earned).length,
  }

  const leaderboardWithUser = [
    ...mockLeaderboard,
    {
      rank: 12,
      user_id: user.id,
      username: user.username,
      exp: user.exp,
      avatar: user.avatar,
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
              <ProfileCard user={user} streakDays={7} badgeCount={mockStats.totalBadges} />

              <Leaderboard entries={leaderboardWithUser} currentUserId={user.id} />

              <ActivityFeed activities={mockActivities} />
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">활동 통계</h2>
                <StatsGrid stats={mockStats} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button className="h-auto py-6 flex-col gap-2" onClick={() => router.push("/quiz")}>
                  <BookOpen className="h-6 w-6" />
                  <span>퀴즈 풀기</span>
                </Button>
                <Button
                  variant="outline"
                  className="h-auto py-6 flex-col gap-2 bg-transparent"
                  onClick={() => router.push("/agent")}
                >
                  <Code className="h-6 w-6" />
                  <span>코드 생성하기</span>
                </Button>
              </div>

              <BadgeGallery badges={mockBadges} />
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
