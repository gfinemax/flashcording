/**
 * AI Agent API Service
 * Handles code generation with FastAPI LLM backend
 */

import { llmClient } from "@/lib/api/client"

export interface CodeGenerationRequest {
  prompt: string
  language: string
  project_context?: {
    files?: string[]
    git_history?: boolean
  }
}

export interface ThinkingStep {
  step: number
  title: string
  status: "pending" | "processing" | "completed"
  details?: string
}

export interface CodeGenerationResponse {
  code: string
  language: string
  explanation: string
  files_changed: Array<{
    path: string
    changes: string
    lines_added: number
    lines_removed: number
  }>
  thinking_steps?: ThinkingStep[]
}

export interface StreamCallback {
  onThinkingStep?: (step: ThinkingStep) => void
  onCodeChunk?: (chunk: string) => void
  onComplete?: (response: CodeGenerationResponse) => void
  onError?: (error: Error) => void
}

/**
 * Generate code using AI agent
 */
export async function generateCode(data: CodeGenerationRequest): Promise<CodeGenerationResponse> {
  const response = await llmClient.post<CodeGenerationResponse>("/api/generate", data)
  return response.data
}

/**
 * Generate code with streaming support
 */
export async function generateCodeStream(
  data: CodeGenerationRequest,
  callbacks: StreamCallback,
): Promise<void> {
  try {
    const response = await fetch(`${llmClient.defaults.baseURL}/api/generate/stream`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const reader = response.body?.getReader()
    const decoder = new TextDecoder()

    if (!reader) {
      throw new Error("Response body is not readable")
    }

    let buffer = ""

    while (true) {
      const { done, value } = await reader.read()

      if (done) break

      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split("\n")

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || ""

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const jsonData = line.slice(6)
          if (jsonData === "[DONE]") continue

          try {
            const parsed = JSON.parse(jsonData)

            if (parsed.type === "thinking_step" && callbacks.onThinkingStep) {
              callbacks.onThinkingStep(parsed.data)
            } else if (parsed.type === "code_chunk" && callbacks.onCodeChunk) {
              callbacks.onCodeChunk(parsed.data)
            } else if (parsed.type === "complete" && callbacks.onComplete) {
              callbacks.onComplete(parsed.data)
            }
          } catch (e) {
            console.error("Error parsing SSE data:", e)
          }
        }
      }
    }
  } catch (error) {
    if (callbacks.onError) {
      callbacks.onError(error as Error)
    }
    throw error
  }
}

/**
 * Analyze project context for code generation
 */
export async function analyzeProjectContext(): Promise<{
  files: string[]
  structure: Record<string, any>
  git_commits: number
}> {
  const response = await llmClient.get("/api/context/analyze")
  return response.data
}

/**
 * Validate generated code
 */
export async function validateCode(code: string, language: string): Promise<{
  valid: boolean
  errors?: string[]
  warnings?: string[]
}> {
  const response = await llmClient.post("/api/validate", { code, language })
  return response.data
}
