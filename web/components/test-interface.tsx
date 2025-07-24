"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, CheckCircle, X, Flag } from "lucide-react"

interface TestInterfaceProps {
  groupId: string
  sectionId: string
  onTestComplete: (results: any) => void
  onItemSelect: (item: any) => void
}

export function TestInterface({ groupId, sectionId, onTestComplete, onItemSelect }: TestInterfaceProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [selectedAnswer, setSelectedAnswer] = useState<string>("")
  const [showFeedback, setShowFeedback] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [testStarted, setTestStarted] = useState(false)
  const [buttonsDisabled, setButtonsDisabled] = useState(false)

  // Sample questions data - in real app this would come from props or API
  const questions = [
    {
      id: 1,
      type: "mcq",
      question: "Which word is most similar in meaning to 'Happy'?",
      options: ["Sad", "Joyful", "Angry", "Tired"],
      correctAnswer: "Joyful",
      section: "Verbal Reasoning",
    },
    {
      id: 2,
      type: "mcq",
      question: "What comes next in this pattern: 2, 4, 6, 8, ?",
      options: ["9", "10", "11", "12"],
      correctAnswer: "10",
      section: "Number Patterns",
    },
    {
      id: 3,
      type: "mcq",
      question: "Choose the word that doesn't belong:",
      options: ["Cat", "Dog", "Bird", "Car"],
      correctAnswer: "Car",
      section: "Verbal Reasoning",
    },
    {
      id: 4,
      type: "mcq",
      question: "If you have 5 apples and eat 2, how many are left?",
      options: ["2", "3", "4", "5"],
      correctAnswer: "3",
      section: "Mathematics",
    },
    {
      id: 5,
      type: "mcq",
      question: "Which number is bigger?",
      options: ["15", "12", "18", "14"],
      correctAnswer: "18",
      section: "Mathematics",
    },
  ]

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100
  const totalDuration = questions.length * 60 // 1 minute per question

  // Initialize timer when test starts
  useEffect(() => {
    if (testStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto submit test
            handleTestComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [testStarted, timeRemaining])

  const startTest = () => {
    setTestStarted(true)
    setTimeRemaining(totalDuration)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerSelect = (value: string) => {
    if (buttonsDisabled) return

    setSelectedAnswer(value)
    setButtonsDisabled(true)

    // Check if answer is correct
    const correct = value === currentQ.correctAnswer
    setIsCorrect(correct)
    setShowFeedback(true)

    // Store the answer
    setAnswers({ ...answers, [currentQuestion]: { answer: value, correct } })

    // Auto advance after 2 seconds
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        // Move to next question
        setCurrentQuestion(currentQuestion + 1)
        setSelectedAnswer("")
        setShowFeedback(false)
        setButtonsDisabled(false)
      } else {
        // Test completed
        handleTestComplete()
      }
    }, 2000)
  }

  const handleTestComplete = () => {
    const totalQuestions = questions.length
    const correctAnswers = Object.values(answers).filter((a: any) => a.correct).length
    const score = Math.round((correctAnswers / totalQuestions) * 100)

    const results = {
      groupId,
      sectionId,
      totalQuestions,
      correctAnswers,
      score,
      timeSpent: totalDuration - timeRemaining,
      answers,
      questions,
    }

    onTestComplete(results)
    onItemSelect({ type: "results", data: results })
  }

  if (!testStarted) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl mb-4">Ready to Start Your Test?</CardTitle>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{questions.length}</div>
                    <div className="text-gray-600">Questions</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatTime(totalDuration)}</div>
                    <div className="text-gray-600">Total Time</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">1 min</div>
                    <div className="text-gray-600">Per Question</div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="text-center">
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Test Instructions:</h3>
                <ul className="text-sm text-gray-600 space-y-1 text-left max-w-md mx-auto">
                  <li>• Each question has a 1-minute time limit</li>
                  <li>• Click on your answer choice</li>
                  <li>• You'll see if your answer is correct or wrong</li>
                  <li>• The test will automatically move to the next question</li>
                  <li>• You cannot go back to previous questions</li>
                </ul>
              </div>
              <Button size="lg" onClick={startTest} className="bg-gradient-to-r from-blue-500 to-purple-500">
                Start Test
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header with Timer */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Assessment Test</h1>
              <p className="text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div
                className={`flex items-center text-lg font-semibold ${
                  timeRemaining < 60 ? "text-red-600" : "text-gray-700"
                }`}
              >
                <Clock className="w-5 h-5 mr-2" />
                {formatTime(timeRemaining)}
              </div>
              <Button variant="outline" size="sm">
                <Flag className="w-4 h-4 mr-1" />
                Flag
              </Button>
            </div>
          </div>
          <Progress value={progress} className="h-3" />
        </div>

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="outline">{currentQ.section}</Badge>
              <Badge variant="secondary">Multiple Choice</Badge>
            </div>
            <CardTitle className="text-xl leading-relaxed">{currentQ.question}</CardTitle>
          </CardHeader>
          <CardContent>
            <RadioGroup value={selectedAnswer} onValueChange={handleAnswerSelect} className="space-y-3">
              {currentQ.options?.map((option, index) => {
                let buttonClass = "flex items-center space-x-3 p-4 rounded-lg border transition-all duration-200"

                if (showFeedback && selectedAnswer === option) {
                  if (isCorrect) {
                    buttonClass += " bg-green-50 border-green-500 text-green-800"
                  } else {
                    buttonClass += " bg-red-50 border-red-500 text-red-800"
                  }
                } else if (showFeedback && option === currentQ.correctAnswer) {
                  buttonClass += " bg-green-50 border-green-500 text-green-800"
                } else if (buttonsDisabled) {
                  buttonClass += " opacity-50 cursor-not-allowed"
                } else {
                  buttonClass += " hover:bg-gray-50 cursor-pointer"
                }

                return (
                  <div key={index} className={buttonClass}>
                    <RadioGroupItem
                      value={option}
                      id={`option-${index}`}
                      disabled={buttonsDisabled}
                      className={showFeedback && option === currentQ.correctAnswer ? "border-green-500" : ""}
                    />
                    <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer font-medium">
                      {option}
                    </Label>
                    {showFeedback && selectedAnswer === option && (
                      <div className="ml-auto">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <X className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                    )}
                    {showFeedback && option === currentQ.correctAnswer && selectedAnswer !== option && (
                      <div className="ml-auto">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                  </div>
                )
              })}
            </RadioGroup>

            {/* Feedback Message */}
            {showFeedback && (
              <div
                className={`mt-4 p-3 rounded-lg ${isCorrect ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
              >
                <div className="flex items-center">
                  {isCorrect ? <CheckCircle className="w-5 h-5 mr-2" /> : <X className="w-5 h-5 mr-2" />}
                  <span className="font-medium">
                    {isCorrect ? "Correct!" : `Incorrect. The correct answer is: ${currentQ.correctAnswer}`}
                  </span>
                </div>
                {!isCorrect && <div className="mt-2 text-sm opacity-90">Moving to next question...</div>}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question Navigation */}
        <div className="flex justify-center">
          <div className="flex space-x-2">
            {questions.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full text-sm font-medium flex items-center justify-center ${
                  index === currentQuestion
                    ? "bg-blue-500 text-white"
                    : answers[index]
                      ? answers[index].correct
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-red-100 text-red-800 border border-red-300"
                      : "bg-gray-100 text-gray-600 border border-gray-300"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
