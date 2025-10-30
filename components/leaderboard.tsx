"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Medal, Award } from "lucide-react"
import type { LeaderboardEntry } from "@/lib/types"
import { cn } from "@/lib/utils"

interface LeaderboardProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

export function Leaderboard({ entries, currentUserId }: LeaderboardProps) {
  const [period, setPeriod] = useState<"weekly" | "monthly" | "all">("weekly")

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="h-6 w-6 text-yellow-500" />
    if (rank === 2) return <Medal className="h-6 w-6 text-gray-400" />
    if (rank === 3) return <Award className="h-6 w-6 text-orange-600" />
    return <span className="text-lg font-bold text-muted-foreground">{rank}</span>
  }

  const getRankBg = (rank: number) => {
    if (rank === 1) return "bg-yellow-500/10 border-yellow-500/20"
    if (rank === 2) return "bg-gray-400/10 border-gray-400/20"
    if (rank === 3) return "bg-orange-600/10 border-orange-600/20"
    return ""
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">리더보드</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
          <TabsList className="w-full">
            <TabsTrigger value="weekly" className="flex-1">
              주간
            </TabsTrigger>
            <TabsTrigger value="monthly" className="flex-1">
              월간
            </TabsTrigger>
            <TabsTrigger value="all" className="flex-1">
              전체
            </TabsTrigger>
          </TabsList>

          <TabsContent value={period} className="mt-6 space-y-3">
            {entries.map((entry) => (
              <div
                key={entry.user_id}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border transition-colors",
                  getRankBg(entry.rank),
                  entry.user_id === currentUserId && "ring-2 ring-primary",
                )}
              >
                <div className="flex items-center justify-center w-12">{getRankIcon(entry.rank)}</div>

                <Avatar className="h-12 w-12">
                  <AvatarImage src={entry.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {entry.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2">
                    {entry.username}
                    {entry.user_id === currentUserId && (
                      <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">나</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{entry.exp.toLocaleString()} XP</div>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
