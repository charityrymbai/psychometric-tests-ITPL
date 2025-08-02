"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { ArrowLeft, ArrowRight, Clock, CheckCircle, Play } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

interface Section {
  sectionId: string
  sectionName: string
  questions: any[]
  isSingleOptionCorrect: boolean
  tags: any[]
}

export default function MultiAssessmentPage() {
  const router = useRouter()
  const params = useParams()

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [allAnswers, setAllAnswers] = useState<Record<string, Record<number, any>>>({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isStarted, setIsStarted] = useState(false)

  const [groupName, setGroupName] = useState<string>("")
  const [groupId, setGroupId] = useState<string>("")

  useEffect(() => {
    const fetchSections = async () => {
      setLoading(true)
      setError(null)
      try {
        // Fetch all sections for the group
        const sectionsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/sections/${params.groupId}`)
        if (!sectionsRes.ok) throw new Error("Failed to fetch sections")
        const sectionsData = await sectionsRes.json()

        // Fetch questions for each section
        const sectionsWithQuestions = await Promise.all(
          sectionsData.map(async (section: any) => {
            try {
              // Fetch questions with maximum of 5 questions per section randomly selected
              const questionsRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${section.sectionId}?maxQuestions=5`)
              if (!questionsRes.ok) throw new Error(`Failed to fetch questions for section ${section.sectionId}`)
              const questionsData = await questionsRes.json()

              const mappedQuestions = (questionsData.questions || []).map((q: any) => ({
                ...q,
                question: q.text,
                options: q.options ? q.options.map((opt: any) => typeof opt === 'string' ? opt : opt.text) : [],
                type: q.type || "mcq",
                scale: q.scale || ["Strongly Disagree", "Disagree", "Neutral", "Agree", "Strongly Agree"],
                minValue: q.minValue || 1,
                maxValue: q.maxValue || 5,
              }))

              return {
                sectionId: section.sectionId,
                sectionName: section.sectionName || questionsData.sectionName,
                questions: mappedQuestions,
                isSingleOptionCorrect: questionsData.isSingleOptionCorrect || false,
                tags: questionsData.tags || []
              }
            } catch (error) {
              console.error(`Error fetching section ${section.sectionId}:`, error)
              return null
            }
          })
        )

        const validSections = sectionsWithQuestions.filter(section => section !== null && section.questions.length > 0)
        setSections(validSections)
        setGroupName(sectionsData[0]?.groupName || "Test Group")
        setGroupId(String(params.groupId))

        // Initialize answers for all sections
        const initialAnswers: Record<string, Record<number, any>> = {}
        validSections.forEach(section => {
          initialAnswers[section.sectionId] = {}
        })
        setAllAnswers(initialAnswers)

        // Calculate total time: 1 minute per question across all sections
        const totalQuestions = validSections.reduce((sum, section) => sum + section.questions.length, 0)
        const totalTime = totalQuestions * 60 // 1 minute per question in seconds
        setTimeRemaining(totalTime)

      } catch (err: any) {
        setError(err.message || "Unknown error")
      } finally {
        setLoading(false)
      }
    }

    fetchSections()
  }, [params.groupId])

  useEffect(() => {
    if (timeRemaining > 0 && isStarted) {
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
  }, [timeRemaining, isStarted])

  const handleAutoSubmit = () => {
    // Auto-submit all completed answers
    handleFinalSubmit()
  }

  const currentSection = sections[currentSectionIndex]
  const currentQuestion = currentSection?.questions[currentQuestionIndex]
  const currentSectionAnswers = allAnswers[currentSection?.sectionId] || {}

  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
  const answeredQuestions = Object.values(allAnswers).reduce((sum, sectionAnswers) => sum + Object.keys(sectionAnswers).length, 0)
  const progress = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswer = useCallback((value: any) => {
    if (!currentSection) return
    setAllAnswers((prev) => ({
      ...prev,
      [currentSection.sectionId]: {
        ...prev[currentSection.sectionId],
        [currentQuestionIndex]: value
      }
    }))
  }, [currentSection, currentQuestionIndex])

  const nextQuestion = useCallback(() => {
    if (!currentSection) return
    
    if (currentQuestionIndex < currentSection.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else if (currentSectionIndex < sections.length - 1) {
      // Move to next section
      setCurrentSectionIndex(currentSectionIndex + 1)
      setCurrentQuestionIndex(0)
    }
  }, [currentSection, currentQuestionIndex, currentSectionIndex, sections.length])

  const prevQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentSectionIndex > 0) {
      // Move to previous section
      setCurrentSectionIndex(currentSectionIndex - 1)
      const prevSection = sections[currentSectionIndex - 1]
      setCurrentQuestionIndex(prevSection.questions.length - 1)
    }
  }, [currentQuestionIndex, currentSectionIndex, sections])

  const handleFinalSubmit = () => {
    if (typeof window !== "undefined") {
      // Calculate total questions and answered questions
      const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0)
      
      let answeredQuestions = 0
      sections.forEach(section => {
        const sectionAnswers = allAnswers[section.sectionId] || {}
        answeredQuestions += Object.keys(sectionAnswers).length
      })

      // Create combined assessment data
      const multiAssessmentData = {
        type: 'multi-assessment',
        groupId,
        groupName,
        sections: sections.map(section => ({
          sectionId: section.sectionId,
          sectionName: section.sectionName,
          isSingleOptionCorrect: section.isSingleOptionCorrect,
          answers: allAnswers[section.sectionId] || {},
          questions: section.questions.map(q => ({
            id: q.id?.toString?.() ?? String(q.id),
            question: q.question,
            type: q.type,
            sectionId: section.sectionId
          })),
          tags: section.tags
        })),
        completedAt: new Date().toISOString(),
        timeSpent: (totalQuestions * 60) - timeRemaining, // Total allocated time minus remaining time
        totalQuestions,
        answeredQuestions
      }
      localStorage.setItem("multiAssessmentData", JSON.stringify(multiAssessmentData))
      router.push("/results/multi-generated")
    }
  }

  const handleStart = () => {
    setIsStarted(true)
  }

  const renderQuestion = () => {
    if (!currentQuestion) return null

    const userAnswer = currentSectionAnswers[currentQuestionIndex]

    switch (currentQuestion.type) {
      case "mcq":
        return (
          <RadioGroup value={userAnswer} onValueChange={handleAnswer} className="space-y-3">
            {currentQuestion.options?.map((option: string, index: number) => (
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
        const min = currentQuestion.minValue || 1
        const max = currentQuestion.maxValue || 5
        const defaultValue = Math.ceil((min + max) / 2)
        return (
          <div className="space-y-4">
            <div className="px-4">
              <Slider
                value={[Math.min(max, Math.max(min, userAnswer || defaultValue))]}
                onValueChange={(value) => handleAnswer(value[0])}
                max={max}
                min={min}
                step={1}
                className="w-full"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500 px-2">
              {currentQuestion.scale?.map((label: string, index: number) => (
                <span key={index}>{label}</span>
              ))}
            </div>
            <div className="text-center">
              <span className="text-lg font-semibold">{userAnswer || defaultValue}</span>
            </div>
          </div>
        )

      default:
        return <p>Unsupported question type: {currentQuestion.type}</p>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (error || sections.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Tests Available</h3>
            <p className="text-gray-600 mb-6">
              {error || "No sections with questions found for this group."}
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-2xl mx-auto">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-gray-900">Complete Assessment Battery</CardTitle>
            <p className="text-gray-600">{groupName}</p>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-4">Assessment Overview</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{sections.length}</div>
                    <div className="text-sm text-gray-600">Sections</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{totalQuestions}</div>
                    <div className="text-sm text-gray-600">Total Questions</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{Math.ceil(totalQuestions)}m</div>
                    <div className="text-sm text-gray-600">Estimated Time</div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Sections included:</h4>
                {sections.map((section, index) => (
                  <div key={section.sectionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="font-medium">{section.sectionName}</span>
                    <div className="flex items-center space-x-3 text-sm text-gray-600">
                      <span>{section.questions.length} questions</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        section.isSingleOptionCorrect 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'bg-green-100 text-green-700'
                      }`}>
                        {section.isSingleOptionCorrect ? 'Scored' : 'Assessment'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="text-center pt-6">
                <Button 
                  onClick={handleStart}
                  size="lg"
                  className="bg-gradient-to-r from-blue-500 to-purple-500 px-8"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Start Complete Assessment
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const isLastQuestion = currentSectionIndex === sections.length - 1 && currentQuestionIndex === currentSection.questions.length - 1

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">
                {currentSection?.sectionName}
              </h1>
              <p className="text-sm text-gray-600">
                Section {currentSectionIndex + 1} of {sections.length} • Question {currentQuestionIndex + 1} of {currentSection?.questions.length}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>
          <div className="mt-3">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-gray-500 mt-1">
              {answeredQuestions} of {totalQuestions} questions completed
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {currentQuestion?.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderQuestion()}
            
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentSectionIndex === 0 && currentQuestionIndex === 0}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Previous
              </Button>

              {isLastQuestion ? (
                <Button
                  onClick={handleFinalSubmit}
                  className="bg-gradient-to-r from-green-500 to-blue-500"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Complete Assessment
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
