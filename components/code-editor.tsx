"use client"

import Editor, { Monaco } from "@monaco-editor/react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import * as monaco from "monaco-editor"

interface CodeEditorProps {
  value: string
  language: string
  onChange?: (value: string | undefined) => void
  readOnly?: boolean
  height?: string
  showLineNumbers?: boolean
  minimap?: boolean
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => void
}

export function CodeEditor({
  value,
  language,
  onChange,
  readOnly = false,
  height = "500px",
  showLineNumbers = true,
  minimap = false,
  onMount,
}: CodeEditorProps) {
  const { theme } = useTheme()
  const [editorTheme, setEditorTheme] = useState("vs-dark")

  useEffect(() => {
    setEditorTheme(theme === "light" ? "light" : "vs-dark")
  }, [theme])

  const handleEditorMount = (editor: monaco.editor.IStandaloneCodeEditor, monaco: Monaco) => {
    // Configure editor for better coding experience
    editor.updateOptions({
      suggestOnTriggerCharacters: true,
      quickSuggestions: true,
      wordBasedSuggestions: "off",
    })

    // Add custom keybindings
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      // Save handler (can be customized)
      console.log("Save triggered")
    })

    if (onMount) {
      onMount(editor, monaco)
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Editor
        height={height}
        language={language}
        value={value}
        onChange={onChange}
        theme={editorTheme}
        onMount={handleEditorMount}
        options={{
          readOnly,
          minimap: { enabled: minimap },
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
          lineNumbers: showLineNumbers ? "on" : "off",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          wordWrap: "on",
          padding: { top: 16, bottom: 16 },
          smoothScrolling: true,
          cursorBlinking: "smooth",
          cursorSmoothCaretAnimation: "on",
          renderLineHighlight: "all",
          bracketPairColorization: { enabled: true },
          guides: {
            bracketPairs: true,
            indentation: true,
          },
          suggest: {
            snippetsPreventQuickSuggestions: false,
          },
          quickSuggestions: {
            other: true,
            comments: false,
            strings: false,
          },
        }}
        loading={<div className="flex items-center justify-center h-full">Loading editor...</div>}
      />
    </div>
  )
}
