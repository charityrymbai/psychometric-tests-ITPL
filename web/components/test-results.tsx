"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import { CheckCircle, X, Clock, Award, Target, TrendingUp, Home, RotateCcw } from "lucide-react"

interface TestResultsProps {
  results: {
    groupId: string
    sectionId: string
    totalQuestions: number
    correctAnswers: number
    score: number
    timeSpent: number
    answers: Record<number, any>
    questions: any[]
  }
  onItemSelect: (item: any) => void
}

export function TestResults({ results, onItemSelect }: TestResultsProps) {
  const { totalQuestions, correctAnswers, score, timeSpent, answers, questions } = results
  const incorrectAnswers = totalQuestions - correctAnswers
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (score: number) => {
    if (score >= 80) return { class: "bg-green-100 text-green-800", label: "Excellent" }
    if (score >= 60) return { class: "bg-yellow-100 text-yellow-800", label: "Good" }
    return { class: "bg-red-100 text-red-800", label: "Needs Improvement" }
  }

  const pieData = [
    { name: "Correct", value: correctAnswers, color: "#10b981" },
    { name: "Incorrect", value: incorrectAnswers, color: "#ef4444" },
  ]

  const questionAnalysis = questions.map((q, index) => ({
    question: `Q${index + 1}`,
    correct: answers[index]?.correct ? 1 : 0,
    time: 60, // Assuming 1 minute per question for now
  }))

  const scoreBadge = getScoreBadge(score)

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-4">
            <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-2 ${getScoreColor(score)}`}>{score}%</div>
            <Badge className={scoreBadge.class} variant="secondary">
              {scoreBadge.label}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Test Completed!</h1>
          <p className="text-gray-600">Here's how you performed on your assessment</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8">
          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <Award className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{score}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Overall Score</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">
                {correctAnswers}/{totalQuestions}
              </div>
              <div className="text-xs sm:text-sm text-gray-600">Correct Answers</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{formatTime(timeSpent)}</div>
              <div className="text-xs sm:text-sm text-gray-600">Time Spent</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 md:p-6 text-center">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-orange-500 mx-auto mb-2 sm:mb-3" />
              <div className="text-xl sm:text-2xl font-bold text-gray-900">{accuracy}%</div>
              <div className="text-xs sm:text-sm text-gray-600">Accuracy</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* Performance Breakdown */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Performance Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Correct Answers</span>
                    <span className="text-sm text-green-600 font-semibold">{correctAnswers}</span>
                  </div>
                  <Progress value={(correctAnswers / totalQuestions) * 100} className="h-2 bg-gray-200">
                    <div className="h-full bg-green-500 rounded-full transition-all duration-500" />
                  </Progress>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Incorrect Answers</span>
                    <span className="text-sm text-red-600 font-semibold">{incorrectAnswers}</span>
                  </div>
                  <Progress value={(incorrectAnswers / totalQuestions) * 100} className="h-2 bg-gray-200">
                    <div className="h-full bg-red-500 rounded-full transition-all duration-500" />
                  </Progress>
                </div>

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={60}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Question by Question Analysis */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Question Analysis</CardTitle>
              <CardDescription>Your performance on each question</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={questionAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="question" />
                  <YAxis domain={[0, 1]} />
                  <Tooltip formatter={(value) => [value === 1 ? "Correct" : "Incorrect", "Result"]} />
                  <Bar dataKey="correct" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Question Review */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Question Review</CardTitle>
            <CardDescription>Review your answers and see the correct solutions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4">
              {questions.map((question, index) => {
                const userAnswer = answers[index]
                const isCorrect = userAnswer?.correct

                return (
                  <div
                    key={index}
                    className={`p-3 sm:p-4 rounded-lg border ${
                      isCorrect ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">Q{index + 1}</Badge>
                        {isCorrect ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <X className="w-4 h-4 text-red-600" />
                        )}
                      </div>
                      <Badge className={isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                        {isCorrect ? "Correct" : "Incorrect"}
                      </Badge>
                    </div>

                    <h4 className="font-medium mb-3">{question.question}</h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600">Your Answer: </span>
                        <span className={isCorrect ? "text-green-700 font-medium" : "text-red-700 font-medium"}>
                          {userAnswer?.answer || "No answer"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600">Correct Answer: </span>
                        <span className="text-green-700 font-medium">{question.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="mb-6 sm:mb-8">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xl">Recommendations</CardTitle>
            <CardDescription>Based on your performance, here are some suggestions</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
            <div className="space-y-4">
              {score >= 80 && (
                <div className="bg-green-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Excellent Performance! 🎉</h4>
                  <p className="text-green-800 text-sm sm:text-base">
                    You've demonstrated strong understanding in this area. Consider taking more advanced assessments or
                    exploring related topics to further develop your skills.
                  </p>
                </div>
              )}

              {score >= 60 && score < 80 && (
                <div className="bg-yellow-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-yellow-900 mb-2">Good Work! 👍</h4>
                  <p className="text-yellow-800 text-sm sm:text-base">
                    You have a solid foundation. Review the questions you missed and practice similar problems to
                    improve your performance further.
                  </p>
                </div>
              )}

              {score < 60 && (
                <div className="bg-blue-50 p-3 sm:p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Keep Learning! 📚</h4>
                  <p className="text-blue-800 text-sm sm:text-base">
                    This is a great learning opportunity. Review the concepts covered in this test and consider
                    additional practice before retaking the assessment.
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Button 
            variant="outline" 
            className="w-full sm:w-auto text-base py-6 px-4" 
            onClick={() => onItemSelect({ type: "home" })}
          >
            <Home className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <Button
            className="w-full sm:w-auto text-base py-6 px-4"
            onClick={() =>
              onItemSelect({
                type: "test",
                id: results.sectionId,
                groupId: results.groupId,
                sectionId: results.sectionId,
              })
            }
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Retake Test
          </Button>
        </div>
      </div>
    </div>
  )
}
