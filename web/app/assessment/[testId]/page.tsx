"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Clock, Flag } from "lucide-react"
import Link from "next/link"

export default function AssessmentPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(15 * 60) // 15 minutes in seconds

  const questions = [
    {
      id: 1,
      type: "mcq",
      question: "Which word is most similar in meaning to 'Happy'?",
      options: ["Sad", "Joyful", "Angry", "Tired"],
      section: "Word Recognition",
    },
    {
      id: 2,
      type: "likert",
      question: "I enjoy working in groups with other students",
      scale: ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
      section: "Social Preferences",
    },
    {
      id: 3,
      type: "mcq",
      question: "What comes next in this pattern: 2, 4, 6, 8, ?",
      options: ["9", "10", "11", "12"],
      section: "Number Patterns",
    },
    {
      id: 4,
      type: "scenario",
      question: "Your friend is upset because they failed a test. What would you most likely do?",
      options: [
        "Tell them it's not a big deal",
        "Listen to how they're feeling and offer support",
        "Suggest they study harder next time",
        "Change the subject to something happier",
      ],
      section: "Emotional Responses",
    },
  ]

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = (value: any) => {
    setAnswers({ ...answers, [currentQuestion]: value })
  }

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const renderQuestion = () => {
    switch (currentQ.type) {
      case "mcq":
        return (
          <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer} className="space-y-3">
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      case "likert":
        return (
          <div className="space-y-4">
            <div className="px-4">
              <Slider
                value={[answers[currentQuestion] || 3]}
                onValueChange={(value) => handleAnswer(value[0])}
                max={5}
                min={1}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-2">
              {currentQ.scale?.map((label, index) => (
                <span key={index} className="text-center max-w-20">
                  {label}
                </span>
              ))}
            </div>
          </div>
        )

      case "scenario":
        return (
          <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer} className="space-y-3">
            {currentQ.options?.map((option, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50">
                <RadioGroupItem value={option} id={`scenario-${index}`} className="mt-1" />
                <Label htmlFor={`scenario-${index}`} className="flex-1 cursor-pointer leading-relaxed">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/tests/primary">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Exit Test
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Verbal Reasoning Assessment</h1>
                <p className="text-sm text-gray-600">Section: {currentQ.section}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600">
                <Clock className="w-4 h-4 mr-1" />
                {formatTime(timeRemaining)}
              </div>
              <Button variant="outline" size="sm">
                <Flag className="w-4 h-4 mr-1" />
                Flag
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>{renderQuestion()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>

          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestion(index)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  index === currentQuestion
                    ? "bg-blue-500 text-white"
                    : answers[index] !== undefined
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>

          {currentQuestion === questions.length - 1 ? (
            <Link href="/results">
              <Button>
                Submit Test
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button onClick={nextQuestion}>
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
