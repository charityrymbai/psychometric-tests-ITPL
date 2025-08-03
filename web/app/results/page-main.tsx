"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  TrendingUp,
  Brain,
  Home,
  RefreshCw,
  ExternalLink,
  Download,
  Eye,
  Calendar,
  Clock,
  Target
} from "lucide-react"
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3002'

interface ReportSummary {
  id: number
  testTitle: string
  groupName: string
  completedAt: string
  totalScore: number
  totalQuestions: number
  version: number
  created_at: string
}

export default function ResultsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/reports/getAll`)
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return "text-emerald-600"
    if (percentage >= 60) return "text-amber-600"
    return "text-rose-600"
  }

  const getScoreBadge = (percentage: number) => {
    if (percentage >= 80) return { 
      class: "bg-emerald-50 text-emerald-700 border-emerald-200", 
      label: "Excellent" 
    }
    if (percentage >= 60) return { 
      class: "bg-amber-50 text-amber-700 border-amber-200", 
      label: "Good" 
    }
    return { 
      class: "bg-rose-50 text-rose-700 border-rose-200", 
      label: "Needs Work" 
    }
  }

  const downloadReport = (reportId: number, testTitle: string) => {
    window.open(`${BACKEND_URL}/reports/${reportId}/download`, '_blank')
  }

  const viewReport = (reportId: number, testTitle: string) => {
    window.open(`${BACKEND_URL}/reports/${reportId}/render`, '_blank')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="text-lg text-slate-600">Loading your results...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md mx-auto border-rose-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
                  <Brain className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">Unable to Load Results</h3>
                <p className="text-slate-600 mb-6">{error}</p>
                <Button onClick={fetchReports} className="w-full">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900">Test Results</h1>
                <p className="text-slate-600">View and manage your assessment reports</p>
              </div>
            </div>
            <div className="flex space-x-3">
              <Button onClick={fetchReports} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {reports.length === 0 ? (
          <div className="flex items-center justify-center min-h-[50vh]">
            <Card className="max-w-lg mx-auto text-center border-slate-200">
              <CardContent className="p-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-slate-100 rounded-full flex items-center justify-center">
                  <Brain className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-2xl font-semibold text-slate-900 mb-3">No Results Yet</h3>
                <p className="text-slate-600 mb-8">
                  Take your first assessment to see your results here. 
                  Start building your learning journey today!
                </p>
                <Link href="/">
                  <Button size="lg" className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700">
                    Take Your First Test
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        ) : (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Total Tests</p>
                      <p className="text-3xl font-bold text-slate-900">{reports.length}</p>
                    </div>
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Target className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Average Score</p>
                      <p className="text-3xl font-bold text-slate-900">
                        {Math.round(reports.reduce((acc, report) => 
                          acc + (Number(report.totalScore) / Number(report.totalQuestions) * 100), 0
                        ) / reports.length)}%
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-emerald-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-600">Latest Test</p>
                      <p className="text-lg font-semibold text-slate-900">
                        {formatDate(reports[0]?.created_at || reports[0]?.completedAt)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {reports.map((report) => {
                const overallPercentage = Math.round((Number(report.totalScore) / Number(report.totalQuestions)) * 100)
                const scoreBadge = getScoreBadge(overallPercentage)
                
                return (
                  <Card key={report.id} className="group hover:shadow-xl transition-all duration-300 border-slate-200 bg-white/70 backdrop-blur-sm hover:bg-white/90">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-lg font-semibold text-slate-900 truncate">
                            {String(report.testTitle)}
                          </CardTitle>
                          <CardDescription className="text-slate-600 flex items-center mt-1">
                            <Brain className="w-3 h-3 mr-1" />
                            {String(report.groupName)}
                          </CardDescription>
                        </div>
                        <Badge variant="secondary" className={scoreBadge.class}>
                          {scoreBadge.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {/* Score Display */}
                        <div className="text-center p-4 bg-slate-50 rounded-lg">
                          <div className={`text-3xl font-bold ${getScoreColor(overallPercentage)}`}>
                            {overallPercentage}%
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            {String(report.totalScore)} out of {String(report.totalQuestions)} correct
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm text-slate-600">
                            <span>Progress</span>
                            <span>{overallPercentage}%</span>
                          </div>
                          <Progress value={overallPercentage} className="h-2" />
                        </div>
                        
                        {/* Date */}
                        <div className="flex items-center text-sm text-slate-600">
                          <Clock className="w-4 h-4 mr-2" />
                          Completed on {formatDate(String(report.completedAt))}
                        </div>
                        
                        {/* Actions */}
                        <div className="grid grid-cols-3 gap-2 pt-2">
                          <Link href={`/results/${report.id}`}>
                            <Button size="sm" variant="outline" className="w-full text-xs">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </Link>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              viewReport(report.id, String(report.testTitle))
                            }}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="w-full text-xs"
                            onClick={(e) => {
                              e.stopPropagation()
                              downloadReport(report.id, String(report.testTitle))
                            }}
                          >
                            <Download className="w-3 h-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
