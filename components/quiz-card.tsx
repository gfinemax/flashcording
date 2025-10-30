"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { QuizPool } from "@/lib/types"

interface QuizCardProps {
  pool: QuizPool
  onStart: (poolId: number) => void
}

export function QuizCard({ pool, onStart }: QuizCardProps) {
  const difficultyColors = {
    easy: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    hard: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  const categoryIcons: Record<string, string> = {
    python: "🐍",
    git: "📦",
    react: "⚛️",
    typescript: "📘",
  }

  return (
    <Card className="hover:border-primary transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{categoryIcons[pool.category] || "📚"}</span>
            <div>
              <CardTitle className="text-lg">{pool.title}</CardTitle>
              <CardDescription className="capitalize">{pool.category}</CardDescription>
            </div>
          </div>
          <Badge className={difficultyColors[pool.difficulty]}>
            {pool.difficulty === "easy" ? "초급" : pool.difficulty === "medium" ? "중급" : "고급"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{pool.question_count}개 문제</span>
          <Button onClick={() => onStart(pool.id)} size="sm">
            시작하기
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
