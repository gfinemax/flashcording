"use client"

import { useState } from "react"
import { BadgeCard } from "@/components/badge-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Badge } from "@/lib/types"

interface BadgeGalleryProps {
  badges: Badge[]
}

export function BadgeGallery({ badges }: BadgeGalleryProps) {
  const [filter, setFilter] = useState<"all" | "earned" | "locked">("all")

  const filteredBadges = badges.filter((badge) => {
    if (filter === "earned") return badge.earned
    if (filter === "locked") return !badge.earned
    return true
  })

  const earnedCount = badges.filter((b) => b.earned).length
  const totalCount = badges.length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">배지 컬렉션</h2>
          <p className="text-muted-foreground">
            {earnedCount} / {totalCount} 획득
          </p>
        </div>
      </div>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
        <TabsList>
          <TabsTrigger value="all">전체 ({totalCount})</TabsTrigger>
          <TabsTrigger value="earned">획득 ({earnedCount})</TabsTrigger>
          <TabsTrigger value="locked">잠김 ({totalCount - earnedCount})</TabsTrigger>
        </TabsList>

        <TabsContent value={filter} className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBadges.map((badge) => (
              <BadgeCard key={badge.id} badge={badge} />
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
