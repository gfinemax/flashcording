"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Code, GitCommit, BookOpen, Award } from "lucide-react"

interface StatsGridProps {
  stats: {
    totalCommits: number
    totalQuizzes: number
    totalCode: number
    totalBadges: number
  }
}

export function StatsGrid({ stats }: StatsGridProps) {
  const items = [
    {
      icon: GitCommit,
      label: "총 커밋",
      value: stats.totalCommits,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      icon: BookOpen,
      label: "완료한 퀴즈",
      value: stats.totalQuizzes,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    {
      icon: Code,
      label: "생성한 코드",
      value: stats.totalCode,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
    {
      icon: Award,
      label: "획득 배지",
      value: stats.totalBadges,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className={`${item.borderColor}`}>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-2">
              <div className={`p-3 rounded-full ${item.bgColor}`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <div className="text-3xl font-bold">{item.value}</div>
              <p className="text-sm text-muted-foreground">{item.label}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
