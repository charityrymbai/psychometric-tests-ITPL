"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Button,
} from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  AlertCircle,
  ArrowLeft,
  Home,
  FileText,
  Award,
  Brain,
  Calendar,
  Clock,
  Target,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;

if (!BACKEND_URL) {
  throw new Error("NEXT_PUBLIC_BACKEND_BASE_URL is not defined");
}

console.log("Using backend URL:", BACKEND_URL);

interface Tag {
  tag: string;
  count: number;
  percentage: number;
}

interface TagResult {
  tagName: string;
  tagCount: number;
  color: string;
}

interface Section {
  sectionId: string;
  sectionName: string;
  sectionType: 'score' | 'tags';
  score?: number;
  totalQuestions?: number;
  percentage?: number;
  tags?: TagResult[];
}

interface Report {
  filename?: string;
  processing_time?: number;
  report_generated_at?: string;
  total_score?: number;
  sections?: Section[];
  recommendations?: string[];
  overall_summary?: string;
  createdAt?: string;
  version?: string;
  id?: number;
  data?: {
    testTitle?: string;
    groupName?: string;
    sections?: Section[];
    totalScore?: number;
    totalQuestions?: number;
    timeSpent?: number;
    completedAt?: string;
    isSingleOptionCorrect?: boolean;
    templateVersion?: number;
  };
}

export default function ResultDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [report, setReport] = useState<Report | null>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchReport() {
      try {
        const res = await fetch(`${BACKEND_URL}/reports/${id}`);
        if (!res.ok) throw new Error("Failed to fetch report");
        const data = await res.json();
        setReport(data.report);
      } catch (err) {
        console.error(err);
        setError("Failed to load report");
      } finally {
        setLoading(false);
      }
    }

    async function fetchUserInfo() {
      try {
        // Get user_id from cookie
        const getCookieValue = (name: string) => {
          const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
          return match ? match[2] : null;
        };
        
        const userId = getCookieValue('user_id');
        if (userId) {
          const userRes = await fetch(`${BACKEND_URL}/user/${userId}`);
          if (userRes.ok) {
            const userData = await userRes.json();
            setUserInfo(userData);
          }
        }
      } catch (userErr) {
        console.error("Failed to fetch user info:", userErr);
      }
    }

    fetchReport();
    fetchUserInfo();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p>Loading report...</p>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="container mx-auto py-8">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Report not found"}</p>
            <Button
              onClick={() => router.push("/")}
              className="mt-4"
              variant="outline"
            >
              <Home className="mr-2 h-4 w-4" /> Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
  ];

  const enhanceTagData = (sectionData: Section) => {
    if (!sectionData.tags) return [];
    const totalTags = sectionData.tags.reduce((sum, t) => sum + t.tagCount, 0);
    return sectionData.tags.map((t) => ({
      name: t.tagName,
      value: t.tagCount,
      percentage: totalTags > 0 ? ((t.tagCount / totalTags) * 100).toFixed(1) : 0,
    }));
  };

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

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  // Prepare sections JSX
  let sectionsContent: React.ReactNode[] = [];
  if (report.data && Array.isArray(report.data.sections) && report.data.sections.length > 0) {
    sectionsContent = report.data.sections.map((section: Section, idx: number) => (
      <Card key={idx} className="border-slate-200 bg-white/70 backdrop-blur-sm">
        <CardHeader className="bg-slate-50/70">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                {section.sectionName}
              </CardTitle>
              <CardDescription>
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
    ));
  } else {
    sectionsContent = [
      <div className="col-span-full text-center text-gray-500" key="no-sections">
        No sections available
      </div>
    ];
  }

  return (
    <div className="container mx-auto py-8 px-4 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{report.filename}</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Calendar className="h-4 w-4" />
            {report.createdAt ? new Date(report.createdAt).toLocaleString() : '-'}
            <Clock className="h-4 w-4 ml-4" />
            {report.data && typeof report.data.timeSpent === 'number' ? formatTime(report.data.timeSpent) : '-'}
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Results
          </Link>
        </Button>
      </div>

      {/* Student Information */}
      {userInfo && (
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Student Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Name</p>
                <p className="text-lg font-medium">{userInfo.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">Class</p>
                <p className="text-lg font-medium">{userInfo.class}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">ID</p>
                <p className="text-lg font-medium">{userInfo.user_id}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-500" /> 
            {report.data && report.data.isSingleOptionCorrect === false ? 'Assessment Summary' : 'Overall Score'}
          </CardTitle>
          <CardDescription>
            {report.data && report.data.isSingleOptionCorrect === false ? 'Assessment Analysis' : 'Student\'s Test Score'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {report.data && report.data.isSingleOptionCorrect === false ? (
            <div className="flex items-center gap-6">
              <div className="text-5xl font-bold text-primary">
                {report.data.sections?.[0]?.tags?.reduce((sum, tag) => sum + tag.tagCount, 0) || 0}
              </div>
              <div className="flex-1">
                <div className="text-xl text-slate-600 mb-2">Total Responses</div>
                <p className="text-sm text-slate-500">
                  Assessment completed with tag-based analysis
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <div className="text-5xl font-bold text-primary">
                {report.data && typeof report.data.totalScore === 'number' && typeof report.data.totalQuestions === 'number' && report.data.totalQuestions > 0 
                  ? Math.round((report.data.totalScore / report.data.totalQuestions) * 100).toFixed(1) 
                  : '-'}%
              </div>
              <Progress value={
                report.data && typeof report.data.totalScore === 'number' && typeof report.data.totalQuestions === 'number' && report.data.totalQuestions > 0 
                  ? Math.round((report.data.totalScore / report.data.totalQuestions) * 100)
                  : 0
              } className="w-2/3" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Overall Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>{report.data && report.data.testTitle ? report.data.testTitle : '-'}</p>
        </CardContent>
      </Card>

      {/* Sections */}
      <div className="space-y-6">
        {sectionsContent}
      </div>
    </div>
  );
}
