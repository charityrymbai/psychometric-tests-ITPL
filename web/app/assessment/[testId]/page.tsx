"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Clock } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function AssessmentPage() {
  const router = useRouter()
  const params = useParams()

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, any>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [questions, setQuestions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [groupName, setGroupName] = useState<string>("")
  const [sectionName, setSectionName] = useState<string>("")
  const [groupId, setGroupId] = useState<string>("")
  const [sectionId, setSectionId] = useState<string>("")
  const [testConfig, setTestConfig] = useState<any>({})
  const [isSingleOptionCorrect, setIsSingleOptionCorrect] = useState<boolean>(false)

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch questions with maximum of 15 questions randomly selected
        const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${params.testId}?maxQuestions=15`, {
          headers: { "Content-Type": "application/json" }
        })
        if (!res.ok) throw new Error("Failed to fetch questions")
        const data = await res.json()

        const mappedQuestions = (data.questions || []).map((q: any) => ({
          ...q,
          question: q.text,
          options: q.options ? q.options.map((opt: any) => opt.text) : [],
          type: q.type || "mcq",
          scale: q.scale || ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
          minValue: q.minValue || 1,
          maxValue: q.maxValue || 5,
        }))

        setQuestions(mappedQuestions)
        setGroupName(data.groupName || "")
        setGroupId(String(data.groupId || params?.groupId || ""))
        setSectionId(String(data.sectionId || ""))
        setSectionName(data.sectionName || "")
        setIsSingleOptionCorrect(data.isSingleOptionCorrect || false)

        // Calculate test duration: 1 minute per question
        const testDuration = mappedQuestions.length * 60 // 1 minute per question in seconds
        const config = {
          duration: testDuration,
          allowReview: data.allowReview !== false,
          showProgress: data.showProgress !== false,
        }
        setTestConfig(config)
        setTimeRemaining(testDuration)
      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchQuestions()
  }, [params.testId, params?.groupId])

  useEffect(() => {
    if (timeRemaining > 0 && !loading) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            handleAutoSubmit()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(timer)
    }
  }, [timeRemaining, loading, answers])

  const handleAutoSubmit = () => {
    if (typeof window !== "undefined") {
      const assessmentData = {
        answers,
        testId: params.testId,
        groupName,
        sectionName,
        completedAt: new Date().toISOString(),
        timeSpent: testConfig.duration || 0,
        groupId,
        sectionId,
        isSingleOptionCorrect,
        questions: questions.map((q) => ({
          id: q.id?.toString?.() ?? String(q.id),
          question: q.question,
          type: q.type,
          sectionId,
        })),
        autoSubmitted: true,
      }
      localStorage.setItem("assessmentData", JSON.stringify(assessmentData))
      setTimeout(() => router.push("/results/generated"), 200)
    }
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleAnswer = useCallback((value: any) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion]: value }))
  }, [currentQuestion])

  const nextQuestion = useCallback(() => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }, [currentQuestion, questions.length])

  const prevQuestion = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }, [currentQuestion])

  const handleSubmit = () => {
    if (typeof window !== "undefined") {
      const assessmentData = {
        answers,
        testId: params.testId,
        groupName,
        sectionName,
        completedAt: new Date().toISOString(),
        timeSpent: (testConfig.duration || 0) - timeRemaining,
        groupId,
        sectionId,
        isSingleOptionCorrect,
        questions: questions.map(q => ({
          id: q.id?.toString?.() ?? String(q.id),
          question: q.question,
          type: q.type,
          sectionId
        }))
      }
      localStorage.setItem("assessmentData", JSON.stringify(assessmentData))
      router.push("/results/generated")
    }
  }

  const renderQuestion = () => {
    if (!currentQ) return null

    switch (currentQ.type) {
      case "mcq":
        return (
          <RadioGroup value={answers[currentQuestion]} onValueChange={handleAnswer} className="space-y-3">
            {currentQ.options?.map((option: string, index: number) => (
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
        const min = currentQ.minValue || 1
        const max = currentQ.maxValue || 5
        const defaultValue = Math.ceil((min + max) / 2)
        return (
          <div className="space-y-4">
            <div className="px-4">
              <Slider
                value={[Math.min(max, Math.max(min, answers[currentQuestion] || defaultValue))]}
                onValueChange={(value) => handleAnswer(value[0])}
                max={max}
                min={min}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-2">
              {currentQ.scale?.map((label: string, index: number) => (
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
            {currentQ.options?.map((option: string, index: number) => (
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
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
              <Button variant="ghost" size="sm" onClick={() => router.push(`/groups/${groupId}`)}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Exit Test
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900 break-words">{groupName || "Untitled"}</h1>
                <p className="text-sm text-gray-600">Section: {sectionName || "-"}</p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-600 mt-2 sm:mt-0">
              <Clock className="w-4 h-4 mr-1" />
              {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center py-16 text-lg text-gray-500">Loading questions...</div>
        ) : error ? (
          <div className="text-center py-16 text-red-500">{error}</div>
        ) : questions.length === 0 ? (
          <div className="text-center py-16 text-gray-500">No questions available.</div>
        ) : (
          <>
            {testConfig.showProgress && (
              <div className="mb-8">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-2 gap-1">
                  <span className="text-sm font-medium text-gray-700">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            )}

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-lg leading-relaxed">{currentQ?.question}</CardTitle>
              </CardHeader>
              <CardContent>{renderQuestion()}</CardContent>
            </Card>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <Button variant="outline" onClick={prevQuestion} disabled={currentQuestion === 0} className="w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              <div className="flex flex-wrap justify-center gap-2 max-w-full overflow-x-auto py-2">
                {testConfig.allowReview && questions.length > 0 && (
                  <>
                    {/* Show first page button */}
                    {currentQuestion > 3 && (
                      <button
                        onClick={() => setCurrentQuestion(0)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          0 === currentQuestion
                            ? "bg-blue-500 text-white"
                            : answers[0] !== undefined
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-600 border border-gray-300"
                        }`}
                      >
                        1
                      </button>
                    )}
                    
                    {/* Ellipsis if needed */}
                    {currentQuestion > 4 && (
                      <span className="flex items-center justify-center w-8">...</span>
                    )}
                    
                    {/* Show a window of pages around current page */}
                    {questions.map((_, index) => {
                      // Show current page and 1 page before and after on mobile, 2 on larger screens
                      const windowSize = 2;
                      const shouldShow = 
                        index >= Math.max(0, currentQuestion - windowSize) && 
                        index <= Math.min(questions.length - 1, currentQuestion + windowSize);
                        
                      if (!shouldShow) return null;
                      
                      return (
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
                      );
                    })}
                    
                    {/* Ellipsis if needed */}
                    {currentQuestion < questions.length - 5 && (
                      <span className="flex items-center justify-center w-8">...</span>
                    )}
                    
                    {/* Show last page button */}
                    {currentQuestion < questions.length - 4 && (
                      <button
                        onClick={() => setCurrentQuestion(questions.length - 1)}
                        className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                          questions.length - 1 === currentQuestion
                            ? "bg-blue-500 text-white"
                            : answers[questions.length - 1] !== undefined
                            ? "bg-green-100 text-green-800 border border-green-300"
                            : "bg-gray-100 text-gray-600 border border-gray-300"
                        }`}
                      >
                        {questions.length}
                      </button>
                    )}
                  </>
                )}
              </div>

              {currentQuestion === questions.length - 1 ? (
                <Button onClick={handleSubmit} className="w-full sm:w-auto">
                  Submit Test
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button onClick={nextQuestion} className="w-full sm:w-auto">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
