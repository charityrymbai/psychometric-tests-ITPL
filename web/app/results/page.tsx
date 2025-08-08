"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  CheckCircle, 
  Clock,  
  Home, 
  RefreshCw, 
  TrendingUp,
  FileText,
  Target,
  Brain,
  ExternalLink
} from "lucide-react"
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3002'

// Types
interface TestResult {
  testId: string
  testTitle: string
  groupId: string
  groupName: string
  sections: TestSection[]
  totalScore: number
  totalQuestions: number
  timeSpent: number
  completedAt: string
  templateVersion: number
}

interface TestSection {
  sectionId: string
  sectionName: string
  sectionType: 'score' | 'tags'
  score?: number
  totalQuestions?: number
  percentage?: number
  tags?: TagResult[]
}

interface TagResult {
  tagName: string
  tagCount: number
  color: string
}

interface ReportData {
  id: number
  data: TestResult
  version: number
  createdAt: string
}

interface ReportSummary {
  id: number
  testTitle: string
  groupName: string
  completedAt: string
  totalScore: number
  totalQuestions: number
  version: number
  created_at: string
  isSingleOptionCorrect?: boolean | null
}

export default function ResultsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch all reports on component mount
  useEffect(() => {
    fetchReports()
  }, [])

  const getCookieValue = (name: string) => {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  };

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)

      const userId = getCookieValue('user_id');
      if (!userId) {
        setReports([]);
        setError('No user ID found. Please log in.');
        setLoading(false);
        return;
      }

      const response = await fetch(`${BACKEND_URL}/reports/user/${userId}`)
      const result = await response.json()

      if (response.ok) {
        setReports(result.reports || [])
      } else {
        setError(result.message || 'Failed to fetch reports')
      }
    } catch (err) {
      setError('Failed to connect to the server')
      console.error('Error fetching reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchReportDetails = async (reportId: number) => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/reports/${reportId}`)
      const result = await response.json()
      
      if (response.ok) {
        setSelectedReport(result.report)
      } else {
        setError(result.message || 'Failed to fetch report details')
      }
    } catch (err) {
      setError('Failed to connect to the server')
      console.error('Error fetching report details:', err)
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-green-600"
    if (percentage >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { class: "bg-green-100 text-green-800", label: "Excellent" }
    if (percentage >= 60) return { class: "bg-yellow-100 text-yellow-800", label: "Good" }
    return { class: "bg-red-100 text-red-800", label: "Needs Improvement" }
  }

  const viewReport = (reportId: number, testTitle: string) => {
    // Open the render endpoint in a new window
    window.open(`${BACKEND_URL}/reports/${reportId}/render`, '_blank')
  }

  if (loading && !selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
          <span className="text-lg text-gray-600">Loading reports...</span>
        </div>
      </div>
    )
  }

  if (error && !selectedReport) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-6 text-center">
            <div className="text-red-500 mb-4">
              <FileText className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Reports</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={fetchReports} className="w-full">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (selectedReport) {
    const result = selectedReport.data
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Button 
                  variant="ghost" 
                  onClick={() => setSelectedReport(null)}
                  className="mr-2"
                >
                  ← Back to Results
                </Button>
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">{result.testTitle}</h1>
                  <p className="text-sm text-gray-600">{result.groupName}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  onClick={() => viewReport(selectedReport.id, result.testTitle)}
                  className="flex items-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View Full Report</span>
                </Button>
                <Link href="/">
                  <Button variant="outline">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Results Detail */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {Math.round((result.totalScore / result.totalQuestions) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Overall Score</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {result.totalScore}/{result.totalQuestions}
                </div>
                <div className="text-sm text-gray-600">Questions</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <Clock className="w-8 h-8 text-purple-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {formatTime(result.timeSpent)}
                </div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 text-center">
                <FileText className="w-8 h-8 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">
                  {result.sections.length}
                </div>
                <div className="text-sm text-gray-600">Sections</div>
              </CardContent>
            </Card>
          </div>

          {/* Sections */}
          <div className="space-y-6">
            {result.sections.map((section, index) => (
              <Card key={section.sectionId} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-xl">{section.sectionName}</CardTitle>
                      <CardDescription>
                        {section.sectionType === 'score' ? 'Score-based Assessment' : 'Tag-based Assessment'}
                      </CardDescription>
                    </div>
                    {section.sectionType === 'score' && section.percentage && (
                      <Badge className={getScoreBadge(section.percentage).class}>
                        {getScoreBadge(section.percentage).label}
                      </Badge>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="p-6">
                  {section.sectionType === 'score' ? (
                    <div className="flex items-center justify-between flex-wrap gap-6">
                      <div className="flex-1 min-w-64">
                        <div className={`text-4xl font-bold mb-2 ${getScoreColor(section.percentage!)}`}>
                          {section.score}/{section.totalQuestions}
                        </div>
                        <div className="text-lg text-gray-600 mb-4">
                          {section.percentage}% Correct
                        </div>
                        <Progress value={section.percentage} className="h-3" />
                      </div>
                      <div className="w-64 h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Target className="w-16 h-16 mx-auto mb-2" />
                          <p>Correct: {section.score}</p>
                          <p>Incorrect: {section.totalQuestions! - section.score!}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-8 flex-wrap">
                      <div className="flex-1 min-w-80">
                        <h3 className="text-lg font-semibold mb-4 text-gray-900">Tag Distribution</h3>
                        <div className="space-y-3">
                          {section.tags?.map((tag, tagIndex) => (
                            <div key={tagIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: tag.color }}
                                ></div>
                                <span className="font-medium">{tag.tagName}</span>
                              </div>
                              <span className="font-bold text-lg" style={{ color: tag.color }}>
                                {tag.tagCount}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="w-80 h-80 bg-gray-50 rounded-lg flex items-center justify-center">
                        <div className="text-center text-gray-500">
                          <Brain className="w-16 h-16 mx-auto mb-2" />
                          <p>Tag Distribution</p>
                          <p>Chart Visualization</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-500">
            <p>Test completed on {formatDate(result.completedAt)}</p>
            <p className="text-sm">Report generated using Template Version {result.templateVersion}</p>
          </div>
        </div>
      </div>
    )
  }

  // Results List View
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Test Results</h1>
                <p className="text-sm text-gray-600">View your assessment reports and performance</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={fetchReports} variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {reports.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Results Yet</h3>
              <p className="text-gray-600 mb-4">Complete a test to see your results here</p>
              <Link href="/">
                <Button>
                  Take a Test
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
              const overallPercentage = Math.round((Number(report.totalScore) / Number(report.totalQuestions)) * 100)
              const scoreBadge = getScoreBadge(overallPercentage)
              
              return (
                <Card key={report.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => fetchReportDetails(report.id)}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-1">{String(report.testTitle)}</CardTitle>
                        <CardDescription className="text-sm">{String(report.groupName)}</CardDescription>
                      </div>
                      <Badge className={scoreBadge.class}>
                        {scoreBadge.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {
                        report.isSingleOptionCorrect? 
                          (
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-600">Score:</span>
                              <span className={`font-bold ${getScoreColor(overallPercentage)}`}>
                                {overallPercentage}%
                              </span>
                            </div>
                          ) : <></>
                      }
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Questions:</span>
                        <span className="font-medium">
                          {String(report.totalScore)}/{String(report.totalQuestions)}
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Completed:</span>
                        <span className="text-sm">
                          {formatDate(String(report.completedAt))}
                        </span>
                      </div>
                      
                      <Progress value={overallPercentage} className="h-2" />
                      
                      <div className="flex space-x-2 pt-2">
                        <Link href={`/results/${report.id}`} passHref legacyBehavior>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={e => e.stopPropagation()}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
