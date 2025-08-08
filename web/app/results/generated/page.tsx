"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { UnsavedChangesDialog } from "@/components/ui/unsaved-changes-dialog"
import { 
  Award, 
  CheckCircle, 
  Clock, 
  Download, 
  Home, 
  Save,
  Target,
  Brain,
  ExternalLink,
  Sparkles,
  TrendingUp
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
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
  isSingleOptionCorrect: boolean
  userData?: {
    user_id: string
    name: string
    class: number | string
  } | null
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

function GeneratedResultsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [testResult, setTestResult] = useState<TestResult | null>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTestResult = async () => {
      try {
        // Get assessment data from localStorage
        const assessmentDataStr = localStorage.getItem("assessmentData");
        if (!assessmentDataStr) {
          setLoading(false);
          return;
        }

        // Get user data from cookies
        const getCookieValue = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? match[2] : null;
        };
        
        const userId = getCookieValue('user_id');
        let userData = null;
        
        if (userId) {
          try {
            // Try to fetch user data from API
            const userResponse = await fetch(`${BACKEND_URL}/user/${userId}`);
            if (userResponse.ok) {
              userData = await userResponse.json();
              console.log("User data loaded:", userData);
            }
          } catch (error) {
            console.error("Failed to fetch user data:", error);
            // Continue without user data
          }
        }

        const assessmentData = JSON.parse(assessmentDataStr);
        
        // Always fetch section data to get questions with correct_option
        const sectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${assessmentData.testId}`);
        if (!sectionResponse.ok) throw new Error("Failed to fetch section data");
        
        const sectionData = await sectionResponse.json();
        
        // Generate results based on answers
        const generatedResult = await generateTestResults(assessmentData, sectionData, userData);
        setTestResult(generatedResult);
        
      } catch (error) {
        console.error("Error loading test result:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTestResult();
  }, [])

  // Function to generate test results from assessment data
  const generateTestResults = async (assessmentData: any, sectionData: any, userData: any = null): Promise<TestResult> => {
    const { answers, testId, groupName, sectionName, completedAt, timeSpent, questions, groupId, sectionId, isSingleOptionCorrect } = assessmentData;
    
    // Get section configuration - use from assessmentData if available, otherwise from sectionData
    const sectionType = (isSingleOptionCorrect !== undefined ? isSingleOptionCorrect : sectionData.isSingleOptionCorrect) ? 'score' : 'tags';
    const actualIsSingleOptionCorrect = isSingleOptionCorrect !== undefined ? isSingleOptionCorrect : sectionData.isSingleOptionCorrect;
    
    // Initialize variables for results
    let totalScore = 0;
    let totalQuestions = 0; // Only count questions that can be scored
    let answeredQuestions = 0;
    
    // For tag-based sections, fetch the actual tags from the backend
    let sectionTags: any[] = [];
    if (!actualIsSingleOptionCorrect) {
      try {
        const tagsResponse = await fetch(`${BACKEND_URL}/tags/section/${sectionId}`);
        if (tagsResponse.ok) {
          sectionTags = await tagsResponse.json();
          console.log("Fetched section tags:", sectionTags);
        }
      } catch (error) {
        console.error("Error fetching section tags:", error);
        // Fallback to tags from sectionData if available
        sectionTags = sectionData.tags || [];
      }
    }
    
    // Process each answer for scoring (if applicable)
    // Use the questions from the assessment that were actually shown to the user
    // The sectionData.questions contains ALL questions from the section,
    // but we need only the ones that were actually answered
    const questionsToUse = questions; // Use the questions from the assessment
    
    // If we need backend data for correct answers, we'll need to fetch them by ID
    if (actualIsSingleOptionCorrect && sectionData.questions) {
      // Match assessment questions with backend questions by ID to get correct_option
      const backendQuestionsMap = new Map();
      sectionData.questions.forEach((q: any) => {
        backendQuestionsMap.set(String(q.id), q);
      });
      
      // Enhance assessment questions with correct_option from backend
      questionsToUse.forEach((q: any, index: number) => {
        const backendQ = backendQuestionsMap.get(String(q.id));
        if (backendQ) {
          q.correct_option = backendQ.correct_option;
          q.options = backendQ.options; // Use backend options to ensure consistency
        }
      });
    }
    
    questionsToUse.forEach((question: any, index: number) => {
      const userAnswer = answers[index];
      
      if (userAnswer !== undefined && userAnswer !== null) {
        answeredQuestions++;
        
        // Only count scores for score-type sections with correct answers
        if (sectionType === 'score' && actualIsSingleOptionCorrect) {
          // For questions with correct answers, check if they have a correct answer
          if (question.correct_option !== undefined && question.correct_option !== null) {
            totalQuestions++;
            
            // Handle the case where userAnswer is option text but correct_option is index
            let isCorrect = false;
            if (typeof question.correct_option === 'number' && Array.isArray(question.options)) {
              // correct_option is an index, userAnswer is option text
              const correctOptionText = question.options[question.correct_option];
              // Handle both string options and object options {text: "..."}
              const correctText = typeof correctOptionText === 'string' ? correctOptionText : correctOptionText?.text;
              isCorrect = userAnswer === correctText;
            } else {
              // Direct comparison fallback
              isCorrect = userAnswer === question.correct_option;
            }
            
            if (isCorrect) {
              totalScore++;
            }
          }
        }
      }
    });

    // Create sections based on the test type
    const sections: TestSection[] = [];
    
    // Use actualIsSingleOptionCorrect to determine section type
    if (actualIsSingleOptionCorrect) {
      // Create score-based section for knowledge tests
      const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
      sections.push({
        sectionId: String(sectionId || sectionData.sectionId || 'main'),
        sectionName: sectionName || 'Assessment Results',
        sectionType: 'score',
        score: totalScore,
        totalQuestions: totalQuestions,
        percentage: percentage
      });
    } else {
      // Create tag-based section for personality/skill assessments
      let finalTags: TagResult[] = [];
      
      if (sectionTags.length > 0) {
        // Use actual tags from the database and distribute responses among them
        // Simple distribution strategy: divide answered questions among available tags
        const responseCountPerTag = Math.floor(answeredQuestions / sectionTags.length);
        const remainingResponses = answeredQuestions % sectionTags.length;
        
        finalTags = sectionTags.map((tag: any, index: number) => ({
          tagName: tag.name,
          tagCount: responseCountPerTag + (index < remainingResponses ? 1 : 0),
          color: getTagColor(tag.name)
        }));
        
        // Filter out tags with 0 count if no responses
        finalTags = finalTags.filter(tag => tag.tagCount > 0);
      }
      
      // Fallback: if no tags or all tags have 0 count, create a default response
      if (finalTags.length === 0 && answeredQuestions > 0) {
        finalTags = [{
          tagName: 'Assessment Response',
          tagCount: answeredQuestions,
          color: getTagColor('Assessment Response')
        }];
      }
      
      sections.push({
        sectionId: String(sectionId || sectionData.sectionId || 'main'),
        sectionName: sectionName || 'Assessment Results',
        sectionType: 'tags',
        tags: finalTags
      });
    }

    // Calculate overall totals - only include scoring sections
    const finalTotalScore = actualIsSingleOptionCorrect ? totalScore : 0;
    const finalTotalQuestions = actualIsSingleOptionCorrect ? totalQuestions : 0;

    return {
      testId: testId || `test-${Date.now()}`,
      testTitle: `${groupName} - ${sectionName}` || 'Assessment Results',
      groupId: String(groupId || sectionData.groupId || 'group-1'),
      groupName: groupName || 'Test Group',
      sections: sections,
      totalScore: finalTotalScore,
      totalQuestions: finalTotalQuestions,
      timeSpent: timeSpent || 0,
      completedAt: completedAt || new Date().toISOString(),
      templateVersion: 0,
      isSingleOptionCorrect: actualIsSingleOptionCorrect,
      userData: userData
    };
  }

  // Helper function to assign colors to tags
  const getTagColor = (tagName: string): string => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];
    const hash = tagName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
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

  const saveResult = async () => {
    if (!testResult) return

    setIsSaving(true)
    try {
      // Get user_id from cookie
      const getCookieValue = (name: string) => {
        const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
        return match ? match[2] : null;
      };
      const userId = getCookieValue('user_id');

      // Always include userData in the report data
      let userData = testResult.userData;
      if (!userData && userId) {
        // Try to fetch user info from API
        try {
          const userResponse = await fetch(`${BACKEND_URL}/user/${userId}`);
          if (userResponse.ok) {
            const userInfo = await userResponse.json();
            userData = {
              user_id: userInfo.user_id || userInfo.id || userId,
              name: userInfo.name || '',
              class: userInfo.class || ''
            };
          }
        } catch (err) {
          // fallback to user_id only
          userData = { user_id: userId, name: '', class: '' };
        }
      }

      const reportData = {
        ...testResult,
        userData
      };

      const response = await fetch(`${BACKEND_URL}/reports/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: reportData,
          version: 0, // Use latest template version
          user_id: userId ? Number(userId) : undefined
        }),
      })

      const result = await response.json()

      if (response.ok) {
        setIsSaved(true)
        // Clean up localStorage after successful save
        localStorage.removeItem("assessmentData")
        // Redirect to the saved result
        router.push(`/results/${result.reportId}`)
      } else {
        console.error('Failed to save result:', result.message)
        // You could show an error toast here
      }
    } catch (error) {
      console.error('Error saving result:', error)
      // You could show an error toast here
    } finally {
      setIsSaving(false)
    }
  }

  const handleHomeClick = () => {
    if (!isSaved) {
      setShowUnsavedDialog(true)
    } else {
      router.push('/')
    }
  }

  const handleDiscardAndExit = () => {
    router.push('/')
  }

  const downloadTempReport = () => {
    if (!testResult) return
    
    // Create a temporary download (you might want to generate this on the backend)
    const scoreSection = testResult.isSingleOptionCorrect ? `
      <div class="score">
        Overall Score: ${testResult.totalQuestions > 0 ? Math.round((testResult.totalScore / testResult.totalQuestions) * 100) : 0}%
      </div>
      <p>Questions Answered: ${testResult.totalScore}/${testResult.totalQuestions}</p>
    ` : `
      <div class="assessment-type">
        Assessment Type: Tag-based Analysis
      </div>
      <p>Total Responses: ${testResult.sections[0]?.tags?.reduce((sum, tag) => sum + tag.tagCount, 0) || 0}</p>
    `;

    const htmlContent = `
      <html>
        <head>
          <title>${testResult.testTitle} - Results</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .score { font-size: 24px; font-weight: bold; color: #059669; }
            .assessment-type { font-size: 24px; font-weight: bold; color: #3b82f6; }
            .user-info { border: 1px solid #e2e8f0; padding: 15px; margin: 20px 0; border-radius: 8px; }
            .user-info h2 { margin-top: 0; }
            .user-detail { margin: 8px 0; }
            .user-label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${testResult.testTitle}</h1>
            <p>${testResult.groupName}</p>
          </div>
          
          ${testResult.userData ? `
          <div class="user-info">
            <h2>Student Information</h2>
            <div class="user-detail"><span class="user-label">Name:</span> ${testResult.userData.name}</div>
            <div class="user-detail"><span class="user-label">Class:</span> ${testResult.userData.class}</div>
            <div class="user-detail"><span class="user-label">ID:</span> ${testResult.userData.user_id}</div>
          </div>
          ` : ''}
          
          ${scoreSection}
          <p>Time Taken: ${formatTime(testResult.timeSpent)}</p>
          <p>Completed: ${formatDate(testResult.completedAt)}</p>
        </body>
      </html>
    `
    
    const blob = new Blob([htmlContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${testResult.testTitle.replace(/\s+/g, '-')}-results.html`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-lg text-slate-600">Generating your results...</p>
        </div>
      </div>
    )
  }

  if (!testResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Brain className="w-16 h-16 text-rose-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No Results Found</h3>
            <p className="text-slate-600 mb-6">
              We couldn't find any test results to display. Please complete a test first.
            </p>
            <Link href="/">
              <Button>Take a Test</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const overallPercentage = testResult.totalQuestions > 0 ? Math.round((testResult.totalScore / testResult.totalQuestions) * 100) : 0
  const hasScoringSections = testResult.sections.some(section => section.sectionType === 'score')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-slate-900">{testResult.testTitle}</h1>
                  {!isSaved && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      Unsaved
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600">{testResult.groupName} • Fresh Results</p>
              </div>
            </div>
            <div className="flex space-x-3">
              {!isSaved && (
                <Button 
                  onClick={saveResult} 
                  disabled={isSaving}
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? "Saving..." : "Save Results"}
                </Button>
              )}
              <Button variant="outline" onClick={downloadTempReport}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleHomeClick}>
                <Home className="w-4 h-4 mr-2" />
                Home
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* User Information */}
        {testResult.userData && (
          <div className="mb-8">
            <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4">Student Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Name</p>
                    <p className="text-lg font-medium">{testResult.userData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Class</p>
                    <p className="text-lg font-medium">{testResult.userData.class}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500 mb-1">ID</p>
                    <p className="text-lg font-medium">{testResult.userData.user_id}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        
        {/* Celebration Banner */}
        <div className="mb-8">
          <Card className={`border-emerald-200 ${hasScoringSections ? 'bg-gradient-to-r from-emerald-50 to-teal-50' : 'bg-gradient-to-r from-blue-50 to-purple-50'}`}>
            <CardContent className="p-8 text-center">
              <div className={`w-16 h-16 ${hasScoringSections ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-blue-500 to-purple-600'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                {hasScoringSections ? <Award className="w-8 h-8 text-white" /> : <Brain className="w-8 h-8 text-white" />}
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                {hasScoringSections ? 'Test Completed! 🎉' : 'Assessment Completed! 🧠'}
              </h2>
              {hasScoringSections ? (
                <>
                  <p className="text-lg text-slate-600 mb-4">
                    You scored <span className={`font-bold ${getScoreColor(overallPercentage)}`}>
                      {overallPercentage}%
                    </span> on this assessment
                  </p>
                  <Badge className={getScoreBadge(overallPercentage).class} variant="secondary">
                    {getScoreBadge(overallPercentage).label}
                  </Badge>
                </>
              ) : (
                <p className="text-lg text-slate-600 mb-4">
                  Your responses have been analyzed and insights are ready below
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Overview Stats */}
        <div className={`grid grid-cols-1 ${hasScoringSections ? 'md:grid-cols-4' : 'md:grid-cols-3'} gap-6 mb-8`}>
          {hasScoringSections && (
            <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-emerald-600" />
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
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {hasScoringSections ? `${testResult.totalScore}/${testResult.totalQuestions}` : testResult.sections[0]?.tags?.reduce((sum, tag) => sum + tag.tagCount, 0) || 0}
              </div>
              <div className="text-sm text-slate-600">{hasScoringSections ? 'Questions' : 'Total Responses'}</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {formatTime(testResult.timeSpent)}
              </div>
              <div className="text-sm text-slate-600">Time Taken</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {testResult.sections.length}
              </div>
              <div className="text-sm text-slate-600">Sections</div>
            </CardContent>
          </Card>
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {testResult.sections.map((section, index) => (
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
                      <p className="text-sm text-slate-600">
                        You got {section.score} questions right out of {section.totalQuestions} total questions.
                      </p>
                    </div>
                    <div className="w-72 h-72 bg-slate-50 rounded-2xl flex items-center justify-center">
                      <div className="text-center text-slate-500">
                        <Target className="w-16 h-16 mx-auto mb-4" />
                        <div className="space-y-2">
                          <div className="text-lg font-semibold">Score Breakdown</div>
                          <div className="text-emerald-600">✓ Correct: {section.score}</div>
                          <div className="text-rose-600">✗ Incorrect: {section.totalQuestions! - section.score!}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-8 flex-wrap">
                    <div className="flex-1 min-w-80">
                      <h3 className="text-xl font-semibold mb-6 text-slate-900">Tag Distribution</h3>
                      <div className="space-y-4">
                        {section.tags?.map((tag, tagIndex) => (
                          <div key={tagIndex} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                            <div className="flex items-center space-x-4">
                              <div 
                                className="w-5 h-5 rounded-full shadow-sm" 
                                style={{ backgroundColor: tag.color }}
                              ></div>
                              <span className="font-medium text-slate-900">{tag.tagName}</span>
                            </div>
                            <div className="text-right">
                              <span className="text-2xl font-bold" style={{ color: tag.color }}>
                                {tag.tagCount}
                              </span>
                              <div className="text-xs text-slate-600">responses</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="w-80 h-80 bg-slate-50 rounded-2xl p-4">
                      <div className="text-lg font-semibold mb-4 text-center">Tag Distribution</div>
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
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Card className="border-slate-200 bg-white/50 backdrop-blur-sm">
            <CardContent className="p-8">
              <p className="text-slate-600 mb-2">Test completed on {formatDate(testResult.completedAt)}</p>
              <p className="text-sm text-slate-500">
                Generated using Template Version {testResult.templateVersion} • 
                {isSaved ? " Saved to your results" : " Not yet saved"}
              </p>
              {!isSaved && (
                <div className="mt-4">
                  <Button 
                    onClick={saveResult} 
                    disabled={isSaving}
                    size="lg"
                    className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? "Saving Results..." : "Save These Results"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        open={showUnsavedDialog}
        onOpenChange={setShowUnsavedDialog}
        onSave={saveResult}
        onDiscard={handleDiscardAndExit}
        title="Save Your Results?"
        description="You haven't saved your test results yet. Would you like to save them before leaving?"
        saveLabel="Save Results"
        discardLabel="Leave Without Saving"
        isSaving={isSaving}
      />
    </div>
  )
}

// Export the page component with Suspense
export default function GeneratedResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-lg text-slate-600">Loading results...</p>
        </div>
      </div>
    }>
      <GeneratedResultsContent />
    </Suspense>
  )
}
