"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Lock, Check } from "lucide-react"
import type { Badge } from "@/lib/types"
import { cn } from "@/lib/utils"

interface BadgeCardProps {
  badge: Badge
}

export function BadgeCard({ badge }: BadgeCardProps) {
  const rarityColors = {
    common: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    rare: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    epic: "bg-purple-500/10 text-purple-500 border-purple-500/20",
  }

  const rarityLabels = {
    common: "일반",
    rare: "레어",
    epic: "에픽",
  }

  return (
    <Card
      className={cn(
        "relative transition-all hover:scale-105",
        badge.earned ? "border-primary/50" : "opacity-60 grayscale",
      )}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-4xl">{badge.icon}</span>
              {badge.earned && <Check className="h-5 w-5 text-green-500" />}
              {!badge.earned && <Lock className="h-5 w-5 text-muted-foreground" />}
            </div>
            <CardTitle className="text-lg">{badge.name}</CardTitle>
            <CardDescription className="text-sm mt-1">{badge.description}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <BadgeUI className={rarityColors[badge.rarity]}>{rarityLabels[badge.rarity]}</BadgeUI>
          {badge.earned && badge.earnedAt && (
            <span className="text-xs text-muted-foreground">
              {new Date(badge.earnedAt).toLocaleDateString("ko-KR")}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
