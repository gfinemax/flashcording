"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FolderGit2, History, Settings, Plus, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  path: string
}

interface AgentSidebarProps {
  onProjectSelect?: (project: Project) => void
}

export function AgentSidebar({ onProjectSelect }: AgentSidebarProps) {
  const [activeTab, setActiveTab] = useState<"projects" | "history" | "settings">("projects")
  const [selectedProject, setSelectedProject] = useState<string | null>(null)

  // Mock projects
  const projects: Project[] = [
    { id: "1", name: "flash-backend", path: "/Users/dev/flash-backend" },
    { id: "2", name: "flash-frontend", path: "/Users/dev/flash-frontend" },
    { id: "3", name: "my-app", path: "/Users/dev/my-app" },
  ]

  // Mock history
  const history = [
    { id: "1", prompt: "Create login page", timestamp: "2 hours ago" },
    { id: "2", prompt: "Add user authentication", timestamp: "5 hours ago" },
    { id: "3", prompt: "Fix navbar styling", timestamp: "1 day ago" },
  ]

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project.id)
    onProjectSelect?.(project)
  }

  return (
    <div className="w-64 border-r bg-card flex flex-col h-full">
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold">Flash Agent</h2>
      </div>

      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("projects")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "projects"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Projects
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "history"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          History
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={cn(
            "flex-1 px-4 py-2 text-sm font-medium transition-colors",
            activeTab === "settings"
              ? "bg-primary/10 text-primary border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          Settings
        </button>
      </div>

      <ScrollArea className="flex-1">
        {activeTab === "projects" && (
          <div className="p-4 space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start gap-2 bg-transparent">
              <Plus className="h-4 w-4" />
              Add Project
            </Button>
            <Separator className="my-2" />
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => handleProjectClick(project)}
                className={cn(
                  "w-full text-left p-3 rounded-lg transition-colors hover:bg-accent",
                  selectedProject === project.id && "bg-accent",
                )}
              >
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{project.path}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "history" && (
          <div className="p-4 space-y-2">
            {history.map((item) => (
              <button key={item.id} className="w-full text-left p-3 rounded-lg transition-colors hover:bg-accent">
                <div className="flex items-start gap-2">
                  <History className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm truncate">{item.prompt}</p>
                    <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {activeTab === "settings" && (
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Settings
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>API Key: ••••••••</p>
                <p>Model: GPT-4</p>
                <p>Temperature: 0.7</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              Configure
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
