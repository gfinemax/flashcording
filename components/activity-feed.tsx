"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trophy, BookOpen, Code, GitCommit, Star } from "lucide-react"
import type { Activity } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"
import { ko } from "date-fns/locale"

interface ActivityFeedProps {
  activities: Activity[]
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (event: string) => {
    switch (event) {
      case "quiz_completed":
        return <BookOpen className="h-5 w-5 text-green-500" />
      case "badge_earned":
        return <Trophy className="h-5 w-5 text-orange-500" />
      case "code_generated":
        return <Code className="h-5 w-5 text-blue-500" />
      case "commit_made":
        return <GitCommit className="h-5 w-5 text-purple-500" />
      default:
        return <Star className="h-5 w-5 text-yellow-500" />
    }
  }

  const getActivityBg = (event: string) => {
    switch (event) {
      case "quiz_completed":
        return "bg-green-500/10"
      case "badge_earned":
        return "bg-orange-500/10"
      case "code_generated":
        return "bg-blue-500/10"
      case "commit_made":
        return "bg-purple-500/10"
      default:
        return "bg-yellow-500/10"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">최근 활동</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${getActivityBg(activity.event)}`}>
                  {getActivityIcon(activity.event)}
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: ko,
                      })}
                    </span>
                    {activity.exp_gained > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-green-500 font-medium">+{activity.exp_gained} XP</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
