"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Code2, GitCompare, BookOpen, Trophy, Settings, Home, Sparkles } from "lucide-react"

const navigation = [
  {
    name: "홈",
    href: "/",
    icon: Home,
  },
  {
    name: "AI 에이전트",
    href: "/agent",
    icon: Sparkles,
  },
  {
    name: "Diff/Commit",
    href: "/diff",
    icon: GitCompare,
  },
  {
    name: "퀴즈",
    href: "/quiz",
    icon: BookOpen,
  },
  {
    name: "게이미피케이션",
    href: "/gamification",
    icon: Trophy,
  },
]

const secondaryNavigation = [
  {
    name: "설정",
    href: "/settings",
    icon: Settings,
  },
]

export function AppSidebar() {
  const pathname = usePathname()
  const router = useRouter()

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <div className="flex items-center gap-2">
          <Code2 className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Flash
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3", isActive && "bg-secondary/80 text-secondary-foreground")}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            )
          })}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Button
                key={item.href}
                variant={isActive ? "secondary" : "ghost"}
                className={cn("w-full justify-start gap-3", isActive && "bg-secondary/80 text-secondary-foreground")}
                onClick={() => router.push(item.href)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            )
          })}
        </div>
      </ScrollArea>

      <div className="border-t p-4">
        <div className="rounded-lg bg-primary/10 p-3 text-sm">
          <p className="font-medium text-primary">Pro Tip</p>
          <p className="mt-1 text-xs text-muted-foreground">퀴즈를 풀고 경험치를 획득하세요!</p>
        </div>
      </div>
    </div>
  )
}
