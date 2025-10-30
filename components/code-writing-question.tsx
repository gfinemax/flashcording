"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { QuizQuestion } from "@/lib/types"
import { useState } from "react"
import { CheckCircle2, XCircle, Play } from "lucide-react"
import dynamic from "next/dynamic"

const CodeEditor = dynamic(() => import("@/components/code-editor").then((mod) => mod.CodeEditor), {
  ssr: false,
  loading: () => (
    <div className="h-[500px] w-full bg-muted animate-pulse rounded-lg flex items-center justify-center">
      <p className="text-muted-foreground">에디터 로딩 중...</p>
    </div>
  ),
})

interface CodeWritingQuestionProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function CodeWritingQuestion({
  question,
  questionNumber,
  totalQuestions,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: CodeWritingQuestionProps) {
  const [code, setCode] = useState(question.code_template || "")
  const [testResults, setTestResults] = useState<{ passed: boolean; message: string }[]>([])
  const [isRunning, setIsRunning] = useState(false)

  const runTests = () => {
    setIsRunning(true)

    // Simulate test execution
    setTimeout(() => {
      const results =
        question.test_cases?.map((testCase) => {
          // Simple mock validation - in real app, this would execute code
          const passed = Math.random() > 0.3
          return {
            passed,
            message: passed
              ? `✓ ${testCase.input} → ${testCase.expected_output}`
              : `✗ ${testCase.input} → Expected ${testCase.expected_output}`,
          }
        }) || []

      setTestResults(results)
      setIsRunning(false)
    }, 1000)
  }

  const allTestsPassed = testResults.length > 0 && testResults.every((r) => r.passed)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            문제 {questionNumber} / {totalQuestions}
          </span>
          <span className="text-sm font-medium text-primary">코드 작성형</span>
        </div>
        <CardTitle className="text-xl">{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-lg overflow-hidden">
          <CodeEditor
            value={code}
            language={question.language || "python"}
            onChange={(value) => setCode(value || "")}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={runTests} disabled={isRunning} className="gap-2">
            <Play className="h-4 w-4" />
            {isRunning ? "실행 중..." : "테스트 실행"}
          </Button>
          {allTestsPassed && (
            <span className="text-sm text-green-600 flex items-center gap-1">
              <CheckCircle2 className="h-4 w-4" />
              모든 테스트 통과!
            </span>
          )}
        </div>

        {testResults.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">테스트 결과:</h4>
            <div className="space-y-1">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-2 p-2 rounded text-sm font-mono ${
                    result.passed ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {result.passed ? (
                    <CheckCircle2 className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{result.message}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
            이전
          </Button>
          <Button onClick={onNext} disabled={!allTestsPassed}>
            {isLast ? "완료" : "다음"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
