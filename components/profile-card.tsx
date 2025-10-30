"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Trophy, Flame, Star } from "lucide-react"
import type { User } from "@/lib/types"

interface ProfileCardProps {
  user: User
  streakDays?: number
  badgeCount?: number
}

export function ProfileCard({ user, streakDays = 0, badgeCount = 0 }: ProfileCardProps) {
  const nextLevelExp = user.level * 1000
  const progress = (user.exp / nextLevelExp) * 100

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={user.avatar || "/placeholder.svg"} />
            <AvatarFallback className="text-2xl bg-primary/10 text-primary">
              {user.username.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-2xl">{user.username}</CardTitle>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-semibold">Level {user.level}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {user.exp} / {nextLevelExp} XP
            </span>
          </div>
          <Progress value={progress} className="h-3" />
          <p className="text-xs text-muted-foreground text-right">{Math.round(progress)}% 완료</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20">
            <Trophy className="h-8 w-8 text-orange-500" />
            <div>
              <div className="text-2xl font-bold">{badgeCount}</div>
              <p className="text-xs text-muted-foreground">배지</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
            <Flame className="h-8 w-8 text-red-500" />
            <div>
              <div className="text-2xl font-bold">{streakDays}</div>
              <p className="text-xs text-muted-foreground">연속 활동</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
