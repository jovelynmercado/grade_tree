import { useQuery } from "@tanstack/react-query";
import type { Student, Subject, Assessment, Grade } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart3, TrendingUp, TrendingDown, Users, Award } from "lucide-react";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const GRADE_RANGES = [
  { min: 90, max: 100, label: "A (90-100)", color: "hsl(142, 71%, 45%)" },
  { min: 80, max: 89, label: "B (80-89)", color: "hsl(217, 91%, 60%)" },
  { min: 70, max: 79, label: "C (70-79)", color: "hsl(45, 93%, 47%)" },
  { min: 60, max: 69, label: "D (60-69)", color: "hsl(25, 95%, 53%)" },
  { min: 0, max: 59, label: "F (0-59)", color: "hsl(0, 84%, 60%)" },
];

export default function AnalyticsPage() {
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

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

  const calculateStudentFinalGrade = (studentId: string, subjectId: string): number | null => {
    const subjectAssessments = assessments?.filter((a) => a.subjectId === subjectId) || [];
    if (subjectAssessments.length === 0) return null;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const assessment of subjectAssessments) {
      const grade = grades?.find(
        (g) => g.studentId === studentId && g.assessmentId === assessment.id
      );
      if (grade) {
        const percentage = (grade.score / assessment.maxScore) * 100;
        totalWeightedScore += percentage * (assessment.weight / 100);
        totalWeight += assessment.weight;
      }
    }

    if (totalWeight === 0) return null;
    return (totalWeightedScore / totalWeight) * 100;
  };

  const getSubjectAnalytics = (subjectId: string) => {
    const subject = subjects?.find((s) => s.id === subjectId);
    if (!subject) return null;

    const enrolledStudents = students?.filter((s) =>
      s.enrolledSubjects?.includes(subjectId)
    ) || [];

    const studentGrades: number[] = [];
    enrolledStudents.forEach((student) => {
      const finalGrade = calculateStudentFinalGrade(student.id, subjectId);
      if (finalGrade !== null) {
        studentGrades.push(finalGrade);
      }
    });

    if (studentGrades.length === 0) return null;

    const average = studentGrades.reduce((a, b) => a + b, 0) / studentGrades.length;
    const highest = Math.max(...studentGrades);
    const lowest = Math.min(...studentGrades);

    const distribution = GRADE_RANGES.map((range) => ({
      name: range.label,
      count: studentGrades.filter((g) => g >= range.min && g <= range.max).length,
      color: range.color,
    }));

    return {
      subject,
      average: Math.round(average * 100) / 100,
      highest: Math.round(highest * 100) / 100,
      lowest: Math.round(lowest * 100) / 100,
      totalStudents: enrolledStudents.length,
      gradedStudents: studentGrades.length,
      distribution,
    };
  };

  const getAllSubjectsAnalytics = () => {
    return subjects?.map((s) => getSubjectAnalytics(s.id)).filter(Boolean) || [];
  };

  const getTopPerformers = (subjectId?: string) => {
    const studentPerformance: { student: Student; average: number }[] = [];

    students?.forEach((student) => {
      const relevantSubjects = subjectId
        ? [subjectId]
        : student.enrolledSubjects || [];

      const grades: number[] = [];
      relevantSubjects.forEach((sId) => {
        const grade = calculateStudentFinalGrade(student.id, sId);
        if (grade !== null) grades.push(grade);
      });

      if (grades.length > 0) {
        const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
        studentPerformance.push({ student, average: Math.round(avg * 100) / 100 });
      }
    });

    return studentPerformance.sort((a, b) => b.average - a.average).slice(0, 5);
  };

  const getLowPerformers = (subjectId?: string) => {
    const studentPerformance: { student: Student; average: number }[] = [];

    students?.forEach((student) => {
      const relevantSubjects = subjectId
        ? [subjectId]
        : student.enrolledSubjects || [];

      const grades: number[] = [];
      relevantSubjects.forEach((sId) => {
        const grade = calculateStudentFinalGrade(student.id, sId);
        if (grade !== null) grades.push(grade);
      });

      if (grades.length > 0) {
        const avg = grades.reduce((a, b) => a + b, 0) / grades.length;
        if (avg < 70) {
          studentPerformance.push({ student, average: Math.round(avg * 100) / 100 });
        }
      }
    });

    return studentPerformance.sort((a, b) => a.average - b.average).slice(0, 5);
  };

  const currentAnalytics = selectedSubject !== "all" ? getSubjectAnalytics(selectedSubject) : null;
  const allAnalytics = getAllSubjectsAnalytics();
  const topPerformers = getTopPerformers(selectedSubject !== "all" ? selectedSubject : undefined);
  const lowPerformers = getLowPerformers(selectedSubject !== "all" ? selectedSubject : undefined);

  const subjectComparisonData = allAnalytics.map((a) => ({
    name: a?.subject.code || "",
    average: a?.average || 0,
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-analytics-title">
            Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Grade distribution and performance insights
          </p>
        </div>
        <Select value={selectedSubject} onValueChange={setSelectedSubject}>
          <SelectTrigger className="w-full sm:w-64" data-testid="select-subject-filter">
            <SelectValue placeholder="Filter by subject" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Subjects</SelectItem>
            {subjects?.map((subject) => (
              <SelectItem key={subject.id} value={subject.id}>
                {subject.code} - {subject.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : currentAnalytics ? (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Average Grade
                </CardTitle>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{currentAnalytics.average}%</div>
                <p className="text-sm text-muted-foreground mt-1">
                  Class average for {currentAnalytics.subject.code}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Highest Grade
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                  {currentAnalytics.highest}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Top performer</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lowest Grade
                </CardTitle>
                <TrendingDown className="w-5 h-5 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                  {currentAnalytics.lowest}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Needs attention</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Graded Students
                </CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {currentAnalytics.gradedStudents}/{currentAnalytics.totalStudents}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Students with grades</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Grade Distribution</CardTitle>
                <CardDescription>Number of students in each grade range</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={currentAnalytics.distribution}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grade Breakdown</CardTitle>
                <CardDescription>Distribution by letter grade</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={currentAnalytics.distribution.filter((d) => d.count > 0)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ name, percent }) =>
                        percent > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : ""
                      }
                    >
                      {currentAnalytics.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Students
                </CardTitle>
                <Users className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{students?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Subjects
                </CardTitle>
                <BarChart3 className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{subjects?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Assessments
                </CardTitle>
                <Award className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{assessments?.length || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Grades Recorded
                </CardTitle>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{grades?.length || 0}</div>
              </CardContent>
            </Card>
          </div>

          {subjectComparisonData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Subject Comparison</CardTitle>
                <CardDescription>Average grades across all subjects</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={subjectComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 100]} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        borderColor: "hsl(var(--border))",
                        borderRadius: "6px",
                      }}
                    />
                    <Bar dataKey="average" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" />
              Top Performers
            </CardTitle>
            <CardDescription>Students with highest grades</CardDescription>
          </CardHeader>
          <CardContent>
            {topPerformers.length > 0 ? (
              <div className="space-y-3">
                {topPerformers.map((item, i) => (
                  <div
                    key={item.student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" size="sm" className="w-6 h-6 flex items-center justify-center p-0">
                        {i + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{item.student.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          {item.student.studentId}
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      {item.average}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No grade data available
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="w-5 h-5 text-amber-500" />
              Needs Attention
            </CardTitle>
            <CardDescription>Students with grades below 70%</CardDescription>
          </CardHeader>
          <CardContent>
            {lowPerformers.length > 0 ? (
              <div className="space-y-3">
                {lowPerformers.map((item) => (
                  <div
                    key={item.student.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                  >
                    <div>
                      <p className="font-medium">{item.student.name}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {item.student.studentId}
                      </p>
                    </div>
                    <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                      {item.average}%
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No students below 70%
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
