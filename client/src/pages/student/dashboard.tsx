import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/lib/auth-context";
import type { Student, Subject, Assessment, Grade, StudentGradeSummary } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  GraduationCap,
  BookOpen,
  Award,
  TrendingUp,
  User,
} from "lucide-react";

export default function StudentDashboard() {
  const { user } = useAuth();

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

  const currentStudent = students?.find(
    (s) => s.email === user?.email || s.studentId === user?.studentId
  );

  const getSubjectGradeSummary = (subjectId: string): StudentGradeSummary | null => {
    if (!currentStudent) return null;

    const subject = subjects?.find((s) => s.id === subjectId);
    if (!subject) return null;

    const subjectAssessments = assessments?.filter((a) => a.subjectId === subjectId) || [];
    const studentGrades = grades?.filter(
      (g) => g.studentId === currentStudent.id && g.subjectId === subjectId
    ) || [];

    let totalWeightedScore = 0;
    let totalWeight = 0;

    const assessmentDetails = subjectAssessments.map((assessment) => {
      const grade = studentGrades.find((g) => g.assessmentId === assessment.id);
      const score = grade?.score || 0;
      const percentage = (score / assessment.maxScore) * 100;
      const weightedScore = percentage * (assessment.weight / 100);

      if (grade) {
        totalWeightedScore += weightedScore;
        totalWeight += assessment.weight;
      }

      return {
        name: assessment.name,
        category: assessment.category,
        score: score,
        maxScore: assessment.maxScore,
        weight: assessment.weight,
        weightedScore: grade ? Math.round(weightedScore * 100) / 100 : 0,
      };
    });

    const finalGrade = totalWeight > 0 ? (totalWeightedScore / totalWeight) * 100 : 0;

    return {
      studentId: currentStudent.id,
      studentName: currentStudent.name,
      subjectId: subject.id,
      subjectCode: subject.code,
      subjectTitle: subject.title,
      assessments: assessmentDetails,
      finalGrade: Math.round(finalGrade * 100) / 100,
    };
  };

  const enrolledSubjects = currentStudent?.enrolledSubjects || [];
  const gradeSummaries = enrolledSubjects
    .map((subjectId) => getSubjectGradeSummary(subjectId))
    .filter(Boolean) as StudentGradeSummary[];

  const overallAverage =
    gradeSummaries.length > 0
      ? gradeSummaries.reduce((sum, s) => sum + s.finalGrade, 0) / gradeSummaries.length
      : 0;

  const getGradeColor = (grade: number): string => {
    if (grade >= 90) return "text-emerald-600 dark:text-emerald-400";
    if (grade >= 80) return "text-blue-600 dark:text-blue-400";
    if (grade >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  const getGradeBg = (grade: number): string => {
    if (grade >= 90) return "bg-emerald-100 dark:bg-emerald-900/30";
    if (grade >= 80) return "bg-blue-100 dark:bg-blue-900/30";
    if (grade >= 70) return "bg-amber-100 dark:bg-amber-900/30";
    return "bg-red-100 dark:bg-red-900/30";
  };

  const getLetterGrade = (grade: number): string => {
    if (grade >= 90) return "A";
    if (grade >= 80) return "B";
    if (grade >= 70) return "C";
    if (grade >= 60) return "D";
    return "F";
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarFallback className="text-2xl bg-primary text-primary-foreground">
                  {currentStudent?.name?.charAt(0) || user?.name?.charAt(0) || "S"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-2xl font-semibold" data-testid="text-student-name">
                  {currentStudent?.name || user?.name || "Student"}
                </h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <User className="w-4 h-4" />
                    {currentStudent?.studentId || user?.studentId || "—"}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-4 h-4" />
                    {enrolledSubjects.length} Subjects
                  </span>
                </div>
              </div>
              {gradeSummaries.length > 0 && (
                <div className="text-center sm:text-right">
                  <p className="text-sm text-muted-foreground">Overall Average</p>
                  <p className={`text-4xl font-bold ${getGradeColor(overallAverage)}`}>
                    {Math.round(overallAverage)}%
                  </p>
                  <Badge className={getGradeBg(overallAverage)}>
                    {getLetterGrade(overallAverage)}
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Enrolled Subjects
              </CardTitle>
              <BookOpen className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{enrolledSubjects.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Grades Received
              </CardTitle>
              <Award className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {grades?.filter((g) => g.studentId === currentStudent?.id).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Overall Grade
              </CardTitle>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${getGradeColor(overallAverage)}`}>
                {gradeSummaries.length > 0 ? `${Math.round(overallAverage)}%` : "—"}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">My Grades</h2>
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          ) : gradeSummaries.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2">
              {gradeSummaries.map((summary) => (
                <Card key={summary.subjectId} data-testid={`card-subject-${summary.subjectId}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          {summary.subjectCode}
                        </CardTitle>
                        <CardDescription>{summary.subjectTitle}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p
                          className={`text-3xl font-bold ${getGradeColor(summary.finalGrade)}`}
                          data-testid={`text-grade-${summary.subjectId}`}
                        >
                          {summary.finalGrade}%
                        </p>
                        <Badge className={`mt-1 ${getGradeBg(summary.finalGrade)}`}>
                          {getLetterGrade(summary.finalGrade)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {summary.assessments.map((assessment, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{assessment.name}</span>
                            <span className="text-muted-foreground">
                              {assessment.score}/{assessment.maxScore}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Progress
                              value={(assessment.score / assessment.maxScore) * 100}
                              className="h-2 flex-1"
                            />
                            <span className="text-xs text-muted-foreground w-12 text-right">
                              {assessment.weight}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span className="capitalize">{assessment.category}</span>
                            <span>Weighted: {assessment.weightedScore}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No Grades Yet</h3>
                <p className="text-muted-foreground mt-1">
                  {enrolledSubjects.length > 0
                    ? "Your grades will appear here once they are recorded."
                    : "You are not enrolled in any subjects yet."}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
