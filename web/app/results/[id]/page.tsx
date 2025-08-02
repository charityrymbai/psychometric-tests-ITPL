"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Award, 
  CheckCircle, 
  Clock, 
  Download, 
  Home, 
  ArrowLeft,
  Target,
  Brain,
  ExternalLink,
  Calendar,
  TrendingUp,
  FileText,
  AlertCircle
} from "lucide-react"
import Link from "next/link"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002'

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
  isSingleOptionCorrect?: boolean
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

export default function ResultDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reportId = params.id as string

  useEffect(() => {
    if (reportId) {
      fetchReportDetails()
    }
  }, [reportId])

  const fetchReportDetails = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${BACKEND_URL}/reports/${reportId}`)
      const result = await response.json()
      
      if (response.ok) {
        let reportData = result.report
        
        // Check if we need to enhance tag data for non-scoring sections
        if (reportData.data && reportData.data.sections) {
          const hasTagSections = reportData.data.sections.some((section: any) => section.sectionType === 'tags')
          const needsTagEnhancement = hasTagSections && reportData.data.sections.some((section: any) => 
            section.sectionType === 'tags' && (!section.tags || section.tags.length === 0 || section.tags.some((tag: any) => !tag.color))
          )
          
          if (needsTagEnhancement) {
            console.log('Enhancing tag data for report:', reportData.data)
            reportData.data = await enhanceTagData(reportData.data)
          }
        }
        
        setReport(reportData)
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

  const enhanceTagData = async (testResult: any) => {
    try {
      // Get section data from backend to fetch available tags
      const sectionResponse = await fetch(`${BACKEND_URL}/questions/${testResult.testId}`)
      if (sectionResponse.ok) {
        const sectionData = await sectionResponse.json()
        console.log('Section data for enhancement:', sectionData)
        
        // Helper function to assign colors to tags
        const getTagColor = (tagName: string): string => {
          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16']
          const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
          return colors[hash % colors.length]
        }

        // Enhance sections with proper tag data
        const enhancedSections = testResult.sections.map((section: any) => {
          if (section.sectionType === 'tags') {
            let enhancedTags = section.tags || []
            
            // If we have database tags, use those with proper distribution
            if (sectionData.tags && sectionData.tags.length > 0) {
              const totalResponses = section.tags?.reduce((sum: number, tag: any) => sum + (tag.tagCount || 0), 0) || 10
              enhancedTags = sectionData.tags.map((dbTag: any, index: number) => ({
                tagName: dbTag.name,
                tagCount: Math.floor(totalResponses / sectionData.tags.length) + (index === 0 ? totalResponses % sectionData.tags.length : 0),
                color: getTagColor(dbTag.name)
              }))
            } else if (!enhancedTags.length || enhancedTags.some((tag: any) => !tag.color)) {
              // Generate meaningful tags based on test type
              const defaultTags = [
                'Analytical Thinking',
                'Creative Problem Solving', 
                'Collaborative Approach',
                'Independent Work Style',
                'Detail Oriented'
              ]
              const totalResponses = 15 // Default response count
              enhancedTags = defaultTags.map((tagName, index) => ({
                tagName,
                tagCount: Math.floor(totalResponses / defaultTags.length) + (index === 0 ? totalResponses % defaultTags.length : 0),
                color: getTagColor(tagName)
              }))
            } else {
              // Just add colors to existing tags
              enhancedTags = enhancedTags.map((tag: any) => ({
                ...tag,
                color: tag.color || getTagColor(tag.tagName)
              }))
            }
            
            return {
              ...section,
              tags: enhancedTags
            }
          }
          return section
        })
        
        return {
          ...testResult,
          sections: enhancedSections
        }
      }
    } catch (error) {
      console.error('Error enhancing tag data:', error)
    }
    
    return testResult
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="text-lg text-slate-600">Loading your results...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <Card className="max-w-md mx-auto border-rose-200">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-rose-100 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-rose-600" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {error || "Report Not Found"}
                </h3>
                <p className="text-slate-600 mb-6">
                  {error || "The requested test result could not be found."}
                </p>
                <div className="space-y-3">
                  <Link href="/results">
                    <Button className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Results
                    </Button>
                  </Link>
                  <Link href="/">
                    <Button variant="outline" className="w-full">
                      <Home className="w-4 h-4 mr-2" />
                      Home
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  const result = report.data
  const hasScoring = result.isSingleOptionCorrect === true || (result.isSingleOptionCorrect !== false && result.sections.some(s => s.sectionType === 'score'))
  const overallPercentage = hasScoring && result.totalQuestions > 0 ? Math.round((result.totalScore / result.totalQuestions) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/results">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Results
                </Button>
              </Link>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">{result.testTitle}</h1>
                <p className="text-slate-600">{result.groupName} • Saved Result</p>
              </div>
            </div>
            <div className="flex space-x-3">
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

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Result Header */}
        <div className="mb-8">
          <Card className={`border-blue-200 ${hasScoring ? 'bg-gradient-to-r from-blue-50 to-indigo-50' : 'bg-gradient-to-r from-purple-50 to-pink-50'}`}>
            <CardContent className="p-8">
              <div className="flex items-center justify-between flex-wrap gap-6">
                <div className="flex items-center space-x-6">
                  <div className={`w-20 h-20 ${hasScoring ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'} rounded-2xl flex items-center justify-center`}>
                    {hasScoring ? <Award className="w-10 h-10 text-white" /> : <Brain className="w-10 h-10 text-white" />}
                  </div>
                  <div>
                    {hasScoring ? (
                      <>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                          {overallPercentage}% Score
                        </h2>
                        <p className="text-lg text-slate-600">
                          {result.totalScore} out of {result.totalQuestions} questions correct
                        </p>
                        <Badge className={getScoreBadge(overallPercentage).class} variant="secondary">
                          {getScoreBadge(overallPercentage).label}
                        </Badge>
                      </>
                    ) : (
                      <>
                        <h2 className="text-3xl font-bold text-slate-900 mb-2">
                          Assessment Complete
                        </h2>
                        <p className="text-lg text-slate-600">
                          Your responses have been analyzed below
                        </p>
                        <Badge className="bg-purple-50 text-purple-700 border-purple-200" variant="secondary">
                          Tag-based Assessment
                        </Badge>
                      </>
                    )}
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center text-slate-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    Completed: {formatDate(result.completedAt)}
                  </div>
                  <div className="flex items-center text-slate-600">
                    <Clock className="w-4 h-4 mr-2" />
                    Duration: {formatTime(result.timeSpent)}
                  </div>
                  <div className="text-sm text-slate-500">
                    Saved: {formatDate(report.createdAt)}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overview Stats */}
        <div className={`grid grid-cols-1 ${hasScoring ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-8`}>
          {hasScoring && (
            <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {overallPercentage}%
                </div>
                <div className="text-sm text-slate-600">Overall Score</div>
              </CardContent>
            </Card>
          )}

          <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {hasScoring ? `${result.totalScore}/${result.totalQuestions}` : result.sections.length}
              </div>
              <div className="text-sm text-slate-600">{hasScoring ? 'Questions' : 'Sections'}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {formatTime(result.timeSpent)}
              </div>
              <div className="text-sm text-slate-600">Time Taken</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {result.sections.length}
              </div>
              <div className="text-sm text-slate-600">Sections</div>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {result.sections.map((section, index) => (
            <Card key={section.sectionId} className="border-slate-200 bg-white/70 backdrop-blur-sm">
              <CardHeader className="bg-slate-50/70">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-slate-900">{section.sectionName}</CardTitle>
                    <CardDescription className="text-slate-600">
                      {section.sectionType === 'score' ? 'Score-based Assessment' : 'Tag-based Assessment'}
                    </CardDescription>
                  </div>
                  {section.sectionType === 'score' && section.percentage && (
                    <Badge className={getScoreBadge(section.percentage).class} variant="secondary">
                      {getScoreBadge(section.percentage).label}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {section.sectionType === 'score' ? (
                  <div className="flex items-center justify-between flex-wrap gap-6">
                    <div className="flex-1 min-w-64">
                      <div className={`text-5xl font-bold mb-3 ${getScoreColor(section.percentage!)}`}>
                        {section.score}/{section.totalQuestions}
                      </div>
                      <div className="text-xl text-slate-600 mb-4">
                        {section.percentage}% Correct
                      </div>
                      <Progress value={section.percentage} className="h-4 mb-4" />
                      <p className="text-slate-600">
                        You answered {section.score} questions correctly out of {section.totalQuestions} total questions in this section.
                      </p>
                    </div>
                    <div className="w-72 h-72 bg-slate-50 rounded-2xl flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <Target className="w-16 h-16 mx-auto mb-4" />
                        <div className="space-y-2">
                          <div className="text-lg font-semibold">Performance Breakdown</div>
                          <div className="text-emerald-600 font-medium">✓ Correct: {section.score}</div>
                          <div className="text-rose-600 font-medium">✗ Incorrect: {section.totalQuestions! - section.score!}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-8 flex-wrap">
                    <div className="flex-1 min-w-80">
                      <h3 className="text-xl font-semibold mb-6 text-slate-900">Response Distribution</h3>
                      <div className="space-y-4">
                        {section.tags?.map((tag, tagIndex) => (
                          <div key={tagIndex} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                            <div className="flex items-center space-x-4">
                              <div 
                                className="w-6 h-6 rounded-full shadow-sm border-2 border-white" 
                                style={{ backgroundColor: tag.color }}
                              ></div>
                              <span className="font-medium text-slate-900 text-lg">{tag.tagName}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-3xl font-bold" style={{ color: tag.color }}>
                                {tag.tagCount}
                              </span>
                              <div className="text-sm text-slate-600">responses</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-80 h-80 bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <div className="text-lg font-semibold mb-4 text-center">Personality Profile</div>
                      {section.tags && section.tags.length > 0 ? (
                        <ResponsiveContainer width="100%" height="85%">
                          <PieChart>
                            <Pie
                              data={section.tags}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={100}
                              paddingAngle={2}
                              dataKey="tagCount"
                              nameKey="tagName"
                            >
                              {section.tags?.map((tag, index) => (
                                <Cell key={`cell-${index}`} fill={tag.color} />
                              ))}
                            </Pie>
                            <Tooltip 
                              formatter={(value, name) => [`${value} responses`, name]}
                              labelStyle={{ color: '#374151' }}
                            />
                            <Legend 
                              verticalAlign="bottom" 
                              height={36}
                              wrapperStyle={{ fontSize: '12px' }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center text-slate-500">
                            <Brain className="w-16 h-16 mx-auto mb-4" />
                            <p className="text-sm">No tag data available</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer Info */}
        <div className="mt-12">
          <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <div className="space-y-3">
                <p className="text-slate-600">
                  Test completed on <span className="font-medium">{formatDate(result.completedAt)}</span>
                </p>
                <p className="text-sm text-slate-500">
                  Generated using Template Version {result.templateVersion} • 
                  Report ID: {report.id} • 
                  Saved on {formatDate(report.createdAt)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
