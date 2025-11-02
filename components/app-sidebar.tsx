"use client"

import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { GitCompare, BookOpen, Trophy, Settings, Home, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"
import { useSidebarStore } from "@/lib/store/sidebar-store"
import { FlashLogo } from "@/components/ui/flash-logo"

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
  const { isCollapsed, toggle } = useSidebarStore()

  return (
    <div
      className={cn(
        "flex h-full flex-col border-r bg-card transition-all duration-300 ease-in-out",
        isCollapsed ? "w-16" : "w-48",
      )}
    >
      <div className="flex h-14 items-center border-b px-3 justify-between">
        <div className={cn("flex items-center gap-2 transition-opacity", isCollapsed && "opacity-0 w-0 overflow-hidden")}>
          <FlashLogo className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap">
            Flash
          </span>
        </div>
        {isCollapsed && <FlashLogo className="h-6 w-6 text-primary mx-auto" />}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className={cn("h-8 w-8 shrink-0", isCollapsed && "mx-auto")}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      <ScrollArea className="flex-1 px-3 py-4">
        <TooltipProvider delayDuration={0}>
          <div className="space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full gap-3 transition-all justify-center px-2",
                          isActive && "bg-secondary/80 text-secondary-foreground",
                        )}
                        onClick={() => router.push(item.href)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full gap-3 transition-all justify-start",
                    isActive && "bg-secondary/80 text-secondary-foreground",
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Button>
              )
            })}
          </div>

          <Separator className="my-4" />

          <div className="space-y-1">
            {secondaryNavigation.map((item) => {
              const isActive = pathname === item.href

              if (isCollapsed) {
                return (
                  <Tooltip key={item.href}>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className={cn(
                          "w-full gap-3 transition-all justify-center px-2",
                          isActive && "bg-secondary/80 text-secondary-foreground",
                        )}
                        onClick={() => router.push(item.href)}
                      >
                        <item.icon className="h-4 w-4 shrink-0" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                )
              }

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full gap-3 transition-all justify-start",
                    isActive && "bg-secondary/80 text-secondary-foreground",
                  )}
                  onClick={() => router.push(item.href)}
                >
                  <item.icon className="h-4 w-4 shrink-0" />
                  <span className="whitespace-nowrap">{item.name}</span>
                </Button>
              )
            })}
          </div>
        </TooltipProvider>
      </ScrollArea>

      {!isCollapsed && (
        <div className="border-t p-4">
          <div className="rounded-lg bg-primary/10 p-3 text-sm">
            <p className="font-medium text-primary">Pro Tip</p>
            <p className="mt-1 text-xs text-muted-foreground">퀴즈를 풀고 경험치를 획득하세요!</p>
          </div>
        </div>
      )}
    </div>
  )
}
