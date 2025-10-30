"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import type { QuizQuestion } from "@/lib/types"
import { useState } from "react"

interface QuizQuestionProps {
  question: QuizQuestion
  questionNumber: number
  totalQuestions: number
  selectedOption?: number
  onAnswer: (optionId: number) => void
  onNext: () => void
  onPrevious: () => void
  isFirst: boolean
  isLast: boolean
}

export function QuizQuestionComponent({
  question,
  questionNumber,
  totalQuestions,
  selectedOption,
  onAnswer,
  onNext,
  onPrevious,
  isFirst,
  isLast,
}: QuizQuestionProps) {
  const [selected, setSelected] = useState<string>(selectedOption?.toString() || "")

  const handleSelect = (value: string) => {
    setSelected(value)
    onAnswer(Number.parseInt(value))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            문제 {questionNumber} / {totalQuestions}
          </span>
          <span className="text-sm font-medium text-secondary">객관식</span>
        </div>
        <CardTitle className="text-xl">{question.text}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selected} onValueChange={handleSelect}>
          {question.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-accent transition-colors"
            >
              <RadioGroupItem value={option.id.toString()} id={`option-${option.id}`} />
              <Label htmlFor={`option-${option.id}`} className="flex-1 cursor-pointer">
                {option.text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className="flex items-center justify-between pt-4">
          <Button variant="outline" onClick={onPrevious} disabled={isFirst}>
            이전
          </Button>
          <Button onClick={onNext} disabled={!selected}>
            {isLast ? "완료" : "다음"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
