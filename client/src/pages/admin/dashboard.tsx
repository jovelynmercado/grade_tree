import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, BookOpen, ClipboardList, GraduationCap, TrendingUp, Award } from "lucide-react";
import type { Student, Subject, Assessment, Grade } from "@shared/schema";

interface DashboardStats {
  totalStudents: number;
  totalSubjects: number;
  totalAssessments: number;
  totalGradesRecorded: number;
  recentActivity: { action: string; description: string; time: string }[];
}

export default function AdminDashboard() {
  const { data: students, isLoading: loadingStudents } = useQuery<Student[]>({
    queryKey: ["/api/students"],
  });

  const { data: subjects, isLoading: loadingSubjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const { data: assessments, isLoading: loadingAssessments } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const { data: grades, isLoading: loadingGrades } = useQuery<Grade[]>({
    queryKey: ["/api/grades"],
  });

  const isLoading = loadingStudents || loadingSubjects || loadingAssessments || loadingGrades;

  const stats = [
    {
      title: "Total Students",
      value: students?.length || 0,
      icon: Users,
      description: "Enrolled students",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      title: "Total Subjects",
      value: subjects?.length || 0,
      icon: BookOpen,
      description: "Active subjects",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      title: "Assessments",
      value: assessments?.length || 0,
      icon: ClipboardList,
      description: "Created assessments",
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
    {
      title: "Grades Recorded",
      value: grades?.length || 0,
      icon: GraduationCap,
      description: "Total grade entries",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-dashboard-title">
          Dashboard
        </h1>
        <p className="text-muted-foreground mt-1">
          Welcome to GradeTree - BST-Based Student Grade Management System
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={stat.title} data-testid={`card-stat-${index}`}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-9 w-20" />
              ) : (
                <div className="text-3xl font-bold" data-testid={`text-stat-${index}`}>
                  {stat.value}
                </div>
              )}
              <p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              Quick Actions
            </CardTitle>
            <CardDescription>Commonly used features</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              <QuickAction
                title="Add New Student"
                description="Register a new student in the system"
                href="/admin/students"
              />
              <QuickAction
                title="Create Subject"
                description="Add a new subject to the curriculum"
                href="/admin/subjects"
              />
              <QuickAction
                title="Record Grades"
                description="Enter or update student grades"
                href="/admin/grades"
              />
              <QuickAction
                title="View BST Visualizer"
                description="Explore binary search tree operations"
                href="/admin/bst"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-muted-foreground" />
              System Overview
            </CardTitle>
            <CardDescription>Grade management at a glance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">BST Operations</p>
                  <p className="text-sm text-muted-foreground">
                    Search, insert, and traverse students/grades
                  </p>
                </div>
                <div className="text-2xl font-bold text-primary">Ready</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Grade Computation</p>
                  <p className="text-sm text-muted-foreground">
                    Automatic weighted grade calculation
                  </p>
                </div>
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">Active</div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-muted-foreground">
                    Grade distribution and statistics
                  </p>
                </div>
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                  {subjects?.length || 0} Subjects
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center justify-between p-3 rounded-lg border hover-elevate active-elevate-2 transition-colors"
      data-testid={`link-${title.toLowerCase().replace(/\s+/g, "-")}`}
    >
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </div>
    </a>
  );
}
