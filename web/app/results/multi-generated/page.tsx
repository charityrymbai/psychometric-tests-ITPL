"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
  Sparkles,
  TrendingUp,
  BarChart3
} from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import Link from "next/link"

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL || 'http://localhost:3002'

// Types
interface MultiTestResult {
  type: 'multi-assessment'
  groupId: string
  groupName: string
  sections: SectionResult[]
  completedAt: string
  timeSpent: number
  totalQuestions: number
  answeredQuestions: number
  userData?: {
    user_id: string
    name: string
    class: number | string
  } | null
}

interface SectionResult {
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

export default function MultiGeneratedResultsPage() {
  const router = useRouter()
  const [testResult, setTestResult] = useState<MultiTestResult | null>(null)
  const [processedSections, setProcessedSections] = useState<SectionResult[]>([])
  const [isSaved, setIsSaved] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTestResult = async () => {
      try {
        // Get multi-assessment data from localStorage
        const multiAssessmentDataStr = localStorage.getItem("multiAssessmentData");
        if (!multiAssessmentDataStr) {
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

        const multiAssessmentData = JSON.parse(multiAssessmentDataStr);
        
        // Process each section
        const processedSections = await Promise.all(
          multiAssessmentData.sections.map(async (sectionData: any) => {
            try {
              // Fetch section details for scoring
              const sectionResponse = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/questions/${sectionData.sectionId}`);
              if (!sectionResponse.ok) throw new Error(`Failed to fetch section ${sectionData.sectionId}`);
              
              const backendSectionData = await sectionResponse.json();
              
              // Generate results for this section
              const sectionResult = await generateSectionResults(sectionData, backendSectionData);
              return sectionResult;
            } catch (error) {
              console.error(`Error processing section ${sectionData.sectionId}:`, error);
              return null;
            }
          })
        );

        const validSections = processedSections.filter(section => section !== null);
        setProcessedSections(validSections);
        
        // Add user data to the test result
        const testResultWithUser = {
          ...multiAssessmentData,
          userData: userData
        };
        
        setTestResult(testResultWithUser);
        
      } catch (error) {
        console.error("Error loading multi-test result:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTestResult();
  }, [])

  // Function to generate results for a single section
  const generateSectionResults = async (sectionData: any, backendSectionData: any): Promise<SectionResult> => {
    const { answers, sectionId, sectionName, isSingleOptionCorrect, questions } = sectionData;
    
    // Determine section type
    const actualIsSingleOptionCorrect = isSingleOptionCorrect !== undefined ? isSingleOptionCorrect : backendSectionData.isSingleOptionCorrect;
    const sectionType = actualIsSingleOptionCorrect ? 'score' : 'tags';
    
    // Initialize variables
    let totalScore = 0;
    let totalQuestions = 0;
    let answeredQuestions = 0;
    
    // Use questions from backend for scoring (they have correct_option)
    // But only use the questions that were actually shown in the assessment
    const questionsToUse = questions; // Use the questions from the assessment
    
    // If we need backend data for correct answers, enhance assessment questions
    if (actualIsSingleOptionCorrect && backendSectionData.questions) {
      // Match assessment questions with backend questions by ID to get correct_option
      const backendQuestionsMap = new Map();
      backendSectionData.questions.forEach((q: any) => {
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
    
    // Process answers for scoring
    questionsToUse.forEach((question: any, index: number) => {
      const userAnswer = answers[index];
      
      if (userAnswer !== undefined && userAnswer !== null) {
        answeredQuestions++;
        
        if (sectionType === 'score' && actualIsSingleOptionCorrect) {
          if (question.correct_option !== undefined && question.correct_option !== null) {
            totalQuestions++;
            
            // Handle option text vs index comparison
            let isCorrect = false;
            if (typeof question.correct_option === 'number' && Array.isArray(question.options)) {
              const correctOptionText = question.options[question.correct_option];
              const correctText = typeof correctOptionText === 'string' ? correctOptionText : correctOptionText?.text;
              isCorrect = userAnswer === correctText;
            } else {
              isCorrect = userAnswer === question.correct_option;
            }
            
            if (isCorrect) {
              totalScore++;
            }
          }
        }
      }
    });

    if (actualIsSingleOptionCorrect) {
      // Score-based section
      const percentage = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0;
      return {
        sectionId,
        sectionName,
        sectionType: 'score',
        score: totalScore,
        totalQuestions: totalQuestions,
        percentage: percentage
      };
    } else {
      // Tag-based section
      let sectionTags: any[] = [];
      try {
        const tagsResponse = await fetch(`${BACKEND_URL}/tags/section/${sectionId}`);
        if (tagsResponse.ok) {
          sectionTags = await tagsResponse.json();
        }
      } catch (error) {
        sectionTags = backendSectionData.tags || [];
      }

      let finalTags: TagResult[] = [];
      
      if (sectionTags.length > 0) {
        const responseCountPerTag = Math.floor(answeredQuestions / sectionTags.length);
        const remainingResponses = answeredQuestions % sectionTags.length;
        
        finalTags = sectionTags.map((tag: any, index: number) => ({
          tagName: tag.name,
          tagCount: responseCountPerTag + (index < remainingResponses ? 1 : 0),
          color: getTagColor(tag.name)
        }));
        
        finalTags = finalTags.filter(tag => tag.tagCount > 0);
      }
      
      if (finalTags.length === 0 && answeredQuestions > 0) {
        finalTags = [{
          tagName: 'Assessment Response',
          tagCount: answeredQuestions,
          color: getTagColor('Assessment Response')
        }];
      }
      
      return {
        sectionId,
        sectionName,
        sectionType: 'tags',
        tags: finalTags
      };
    }
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
    if (!testResult || !processedSections) return

    setIsSaving(true)
    try {
      // Create individual result for each section
      const savePromises = processedSections.map(async (section, index) => {
        // Create the data structure that matches the backend schema
        const sectionResult = {
          testId: String(section.sectionId),
          testTitle: `Multi-Section Assessment: ${testResult.groupName} (${section.sectionName})`,
          groupId: String(testResult.groupId),
          groupName: testResult.groupName,
          sections: [{
            ...section,
            sectionId: String(section.sectionId)
          }], // This should match SectionResultSchema
          totalScore: section.score || 0,
          totalQuestions: section.totalQuestions || 0,
          timeSpent: Math.floor(testResult.timeSpent / processedSections.length),
          completedAt: testResult.completedAt,
          templateVersion: 0,
          userData: testResult.userData,
          isSingleOptionCorrect: section.sectionType === 'score'
        }

        console.log(`Saving section ${index + 1}:`, sectionResult)

        // Get user_id from cookie
        const getCookieValue = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? match[2] : null;
        };
        const userId = getCookieValue('user_id');

        const response = await fetch(`${BACKEND_URL}/reports/create`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            data: sectionResult,
            version: 0,
            user_id: userId ? Number(userId) : undefined
          }),
        })

        if (!response.ok) {
          const errorText = await response.text()
          console.error(`Failed to save section ${section.sectionName}:`, response.status, errorText)
          throw new Error(`Failed to save section ${section.sectionName}: ${response.status} ${errorText}`)
        }

        const result = await response.json()
        console.log(`Section ${section.sectionName} saved with ID:`, result.reportId)
        return result
      })

      const results = await Promise.all(savePromises)
      const allSuccessful = results.every(result => result && result.reportId)

      console.log("All save results:", results)

      if (allSuccessful) {
        console.log("All sections saved successfully!")
        setIsSaved(true)
        localStorage.removeItem("multiAssessmentData")
        // Redirect to results page
        router.push("/results")
      } else {
        console.error('Some results failed to save:', results)
        alert('Some results failed to save. Please try again.')
      }
    } catch (error) {
      console.error('Error saving results:', error)
      alert(`Error saving results: ${error instanceof Error ? error.message : 'Unknown error'}`)
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="text-lg text-slate-600">Processing your results...</p>
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

  const scoringSections = processedSections.filter(section => section.sectionType === 'score')
  const tagSections = processedSections.filter(section => section.sectionType === 'tags')
  const overallScore = scoringSections.length > 0 ? 
    Math.round(scoringSections.reduce((sum, section) => sum + (section.percentage || 0), 0) / scoringSections.length) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl font-bold text-slate-900">{testResult.groupName} - Complete Assessment</h1>
                  {!isSaved && (
                    <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                      Unsaved
                    </Badge>
                  )}
                </div>
                <p className="text-slate-600">Multi-Section Assessment Results</p>
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
                  {isSaving ? "Saving..." : "Save All Results"}
                </Button>
              )}
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
        {/* Celebration Banner */}
        <div className="mb-8">
          <Card className="border-emerald-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">
                Complete Assessment Finished! 🎉
              </h2>
              <p className="text-lg text-slate-600 mb-4">
                You completed {processedSections.length} sections with {testResult.answeredQuestions} total responses
              </p>
              {scoringSections.length > 0 && (
                <Badge className={getScoreBadge(overallScore).class} variant="secondary">
                  Overall: {getScoreBadge(overallScore).label}
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>

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

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {processedSections.length}
              </div>
              <div className="text-sm text-slate-600">Sections Completed</div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-slate-900 mb-1">
                {testResult.answeredQuestions}
              </div>
              <div className="text-sm text-slate-600">Total Responses</div>
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

          {scoringSections.length > 0 && (
            <Card className="border-slate-200 bg-white/70 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="w-6 h-6 text-amber-600" />
                </div>
                <div className="text-3xl font-bold text-slate-900 mb-1">
                  {overallScore}%
                </div>
                <div className="text-sm text-slate-600">Average Score</div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sections */}
        <div className="space-y-6">
          {processedSections.map((section, index) => (
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
              <p className="text-slate-600 mb-2">Assessment completed on {formatDate(testResult.completedAt)}</p>
              <p className="text-sm text-slate-500">
                Multi-section assessment • {processedSections.length} sections completed •
                {isSaved ? " All results saved" : " Not yet saved"}
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
                    {isSaving ? "Saving All Results..." : "Save All Results"}
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
        description="You haven't saved your multi-assessment results yet. Would you like to save them before leaving?"
        saveLabel="Save All Results"
        discardLabel="Leave Without Saving"
        isSaving={isSaving}
      />
    </div>
  )
}
