"use client"

import { DiffEditor } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeftRight, Maximize2, Minimize2 } from "lucide-react"

interface DiffViewerProps {
  original: string
  modified: string
  language: string
  height?: string
  fileName?: string
  additions?: number
  deletions?: number
}

export function DiffViewer({
  original,
  modified,
  language,
  height = "600px",
  fileName,
  additions = 0,
  deletions = 0,
}: DiffViewerProps) {
  const { theme } = useTheme()
  const [editorTheme, setEditorTheme] = useState("vs-dark")
  const [sideBySide, setSideBySide] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setEditorTheme(theme === "light" ? "light" : "vs-dark")
  }, [theme])

  const toggleViewMode = () => {
    setSideBySide(!sideBySide)
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  return (
    <div className={`border rounded-lg overflow-hidden ${isFullscreen ? "fixed inset-0 z-50 bg-background" : ""}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-3">
          {fileName && <span className="font-mono text-sm font-medium">{fileName}</span>}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
              +{additions}
            </Badge>
            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
              -{deletions}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={toggleViewMode} className="gap-2">
            <ArrowLeftRight className="w-4 h-4" />
            {sideBySide ? "Inline" : "Side by Side"}
          </Button>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Diff Editor */}
      <DiffEditor
        height={isFullscreen ? "calc(100vh - 60px)" : height}
        language={language}
        original={original}
        modified={modified}
        theme={editorTheme}
        options={{
          readOnly: true,
          renderSideBySide: sideBySide,
          minimap: { enabled: false },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          diffWordWrap: "on",
          enableSplitViewResizing: true,
          renderOverviewRuler: true,
        }}
        loading={<div className="flex items-center justify-center h-full">Loading diff viewer...</div>}
      />
    </div>
  )
}
