"use client"

import type React from "react"

import { AppSidebar } from "@/components/app-sidebar"
import { AgentHeader } from "@/components/agent-header"

interface AppLayoutProps {
  children: React.ReactNode
  showSidebar?: boolean
  showHeader?: boolean
}

export function AppLayout({ children, showSidebar = true, showHeader = true }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      {showSidebar && <AppSidebar />}
      <div className="flex flex-1 flex-col overflow-hidden">
        {showHeader && <AgentHeader />}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
