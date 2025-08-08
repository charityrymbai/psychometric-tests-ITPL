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
  TrendingUp,
  CheckCircle,
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

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3002";

interface Tag {
  tag: string;
  count: number;
  percentage: number;
}

interface Section {
  section: string;
  text: string;
  summary: string;
  score: number;
  percentage?: number;
  tags?: { tag: string; count: number }[];
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
  data?: any;
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
    const totalTags = sectionData.tags.reduce((sum, t) => sum + t.count, 0);
    return sectionData.tags.map((t) => ({
      name: t.tag,
      value: t.count,
      percentage: totalTags > 0 ? ((t.count / totalTags) * 100).toFixed(1) : 0,
    }));
  };

  // Prepare sections JSX
  let sectionsContent: React.ReactNode[] = [];
  if (report.data && Array.isArray(report.data.sections) && report.data.sections.length > 0) {
    sectionsContent = report.data.sections.map((section: any, idx: number) => (
      <Card key={idx}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            {section.sectionName}
          </CardTitle>
          <CardDescription>AI evaluation and breakdown</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Score */}
          <div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Score</span>
              <span className="text-primary font-bold">
                {typeof section.percentage === 'number'
                  ? section.percentage.toFixed(1)
                  : (typeof section.score === 'number' ? section.score.toFixed(1) : '-')}
                %
              </span>
            </div>
            <Progress
              value={
                section.percentage !== undefined
                  ? section.percentage
                  : section.score
              }
            />
          </div>
          {/* Summary */}
          <div>
            <h4 className="font-medium flex items-center gap-2">
              <FileText className="h-4 w-4" /> Section Summary
            </h4>
            <p>{section.sectionName}</p>
          </div>
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
            {report.data && typeof report.data.timeSpent === 'number' ? report.data.timeSpent.toFixed(2) : '-'}s
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
            <Award className="h-5 w-5 text-yellow-500" /> Overall Score
          </CardTitle>
          <CardDescription>Student's Test Score</CardDescription>
        </CardHeader>
        <CardContent>
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
      <div className="grid md:grid-cols-2 gap-6">
        {sectionsContent}
      </div>
    </div>
  );
}
