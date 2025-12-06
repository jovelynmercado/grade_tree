import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Student, Subject, Assessment, Grade } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ClipboardList, Save, Loader2, CheckCircle } from "lucide-react";

export default function GradesPage() {
  const { toast } = useToast();
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [gradeInputs, setGradeInputs] = useState<Record<string, Record<string, string>>>({});
  const [savingGrades, setSavingGrades] = useState<Set<string>>(new Set());

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

  const saveGradeMutation = useMutation({
    mutationFn: async (data: { studentId: string; assessmentId: string; subjectId: string; score: number }) => {
      const existingGrade = grades?.find(
        (g) => g.studentId === data.studentId && g.assessmentId === data.assessmentId
      );
      if (existingGrade) {
        return await apiRequest("PATCH", `/api/grades/${existingGrade.id}`, { score: data.score });
      }
      return await apiRequest("POST", "/api/grades", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grades"] });
    },
    onError: (error: Error) => {
      toast({ title: "Error saving grade", description: error.message, variant: "destructive" });
    },
  });

  const isLoading = loadingStudents || loadingSubjects || loadingAssessments || loadingGrades;

  const subjectAssessments = assessments?.filter((a) => a.subjectId === selectedSubject) || [];

  const enrolledStudents = students?.filter((student) =>
    student.enrolledSubjects?.includes(selectedSubject)
  ) || [];

  const getExistingGrade = (studentId: string, assessmentId: string): number | null => {
    const grade = grades?.find(
      (g) => g.studentId === studentId && g.assessmentId === assessmentId
    );
    return grade ? grade.score : null;
  };

  const getInputValue = (studentId: string, assessmentId: string): string => {
    const customValue = gradeInputs[studentId]?.[assessmentId];
    if (customValue !== undefined) return customValue;
    const existing = getExistingGrade(studentId, assessmentId);
    return existing !== null ? existing.toString() : "";
  };

  const handleGradeChange = (studentId: string, assessmentId: string, value: string) => {
    setGradeInputs((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [assessmentId]: value,
      },
    }));
  };

  const handleSaveGrade = async (studentId: string, assessmentId: string, maxScore: number) => {
    const value = gradeInputs[studentId]?.[assessmentId];
    if (value === undefined || value === "") return;

    const score = parseFloat(value);
    if (isNaN(score) || score < 0 || score > maxScore) {
      toast({
        title: "Invalid score",
        description: `Score must be between 0 and ${maxScore}`,
        variant: "destructive",
      });
      return;
    }

    const key = `${studentId}-${assessmentId}`;
    setSavingGrades((prev) => new Set([...prev, key]));

    try {
      await saveGradeMutation.mutateAsync({
        studentId,
        assessmentId,
        subjectId: selectedSubject,
        score,
      });
      toast({ title: "Grade saved" });
    } finally {
      setSavingGrades((prev) => {
        const newSet = new Set(prev);
        newSet.delete(key);
        return newSet;
      });
    }
  };

  const calculateFinalGrade = (studentId: string): number | null => {
    if (subjectAssessments.length === 0) return null;

    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const assessment of subjectAssessments) {
      const score = getExistingGrade(studentId, assessment.id);
      if (score !== null) {
        const percentage = (score / assessment.maxScore) * 100;
        totalWeightedScore += percentage * (assessment.weight / 100);
        totalWeight += assessment.weight;
      }
    }

    if (totalWeight === 0) return null;
    return Math.round((totalWeightedScore / totalWeight) * 100 * 100) / 100;
  };

  const getGradeColor = (grade: number): string => {
    if (grade >= 90) return "text-emerald-600 dark:text-emerald-400";
    if (grade >= 80) return "text-blue-600 dark:text-blue-400";
    if (grade >= 70) return "text-amber-600 dark:text-amber-400";
    return "text-red-600 dark:text-red-400";
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-grades-title">
          Grade Entry
        </h1>
        <p className="text-muted-foreground mt-1">
          Record and manage student grades
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Grade Sheet
              </CardTitle>
              <CardDescription>
                Select a subject to view and enter grades
              </CardDescription>
            </div>
            <Select value={selectedSubject} onValueChange={setSelectedSubject}>
              <SelectTrigger className="w-full sm:w-72" data-testid="select-subject-filter">
                <SelectValue placeholder="Select a subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects?.map((subject) => (
                  <SelectItem key={subject.id} value={subject.id}>
                    {subject.code} - {subject.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : !selectedSubject ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">Select a Subject</h3>
              <p className="text-muted-foreground mt-1">
                Choose a subject from the dropdown to view and enter grades
              </p>
            </div>
          ) : subjectAssessments.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Assessments</h3>
              <p className="text-muted-foreground mt-1">
                Create assessments for this subject first
              </p>
              <Button className="mt-4" asChild>
                <a href="/admin/assessments">Create Assessment</a>
              </Button>
            </div>
          ) : enrolledStudents.length === 0 ? (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No Enrolled Students</h3>
              <p className="text-muted-foreground mt-1">
                Enroll students in this subject first
              </p>
              <Button className="mt-4" asChild>
                <a href="/admin/students">Manage Students</a>
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="sticky left-0 bg-background z-10 min-w-[150px]">
                      Student
                    </TableHead>
                    {subjectAssessments.map((assessment) => (
                      <TableHead key={assessment.id} className="text-center min-w-[140px]">
                        <div className="space-y-1">
                          <div className="font-medium">{assessment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {assessment.weight}% | Max: {assessment.maxScore}
                          </div>
                        </div>
                      </TableHead>
                    ))}
                    <TableHead className="text-center min-w-[100px]">Final Grade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrolledStudents.map((student) => {
                    const finalGrade = calculateFinalGrade(student.id);
                    return (
                      <TableRow key={student.id} data-testid={`row-grade-${student.id}`}>
                        <TableCell className="sticky left-0 bg-background z-10">
                          <div>
                            <div className="font-medium">{student.name}</div>
                            <div className="text-xs text-muted-foreground font-mono">
                              {student.studentId}
                            </div>
                          </div>
                        </TableCell>
                        {subjectAssessments.map((assessment) => {
                          const key = `${student.id}-${assessment.id}`;
                          const isSaving = savingGrades.has(key);
                          const existingGrade = getExistingGrade(student.id, assessment.id);
                          const hasExisting = existingGrade !== null;

                          return (
                            <TableCell key={assessment.id} className="text-center">
                              <div className="flex items-center gap-1 justify-center">
                                <div className="relative">
                                  <Input
                                    type="number"
                                    min={0}
                                    max={assessment.maxScore}
                                    step="0.01"
                                    value={getInputValue(student.id, assessment.id)}
                                    onChange={(e) =>
                                      handleGradeChange(student.id, assessment.id, e.target.value)
                                    }
                                    onBlur={() =>
                                      handleSaveGrade(student.id, assessment.id, assessment.maxScore)
                                    }
                                    className="w-20 text-center"
                                    placeholder="—"
                                    data-testid={`input-grade-${student.id}-${assessment.id}`}
                                  />
                                  {hasExisting && !isSaving && (
                                    <CheckCircle className="absolute -right-1 -top-1 w-3.5 h-3.5 text-emerald-500" />
                                  )}
                                </div>
                                {isSaving && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                              </div>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-center">
                          {finalGrade !== null ? (
                            <Badge
                              variant="secondary"
                              className={`font-mono text-sm ${getGradeColor(finalGrade)}`}
                            >
                              {finalGrade}%
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedSubject && subjectAssessments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Weight Summary</CardTitle>
            <CardDescription>Assessment weight distribution for this subject</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {subjectAssessments.map((assessment) => (
                <div
                  key={assessment.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                >
                  <div>
                    <p className="font-medium text-sm">{assessment.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{assessment.category}</p>
                  </div>
                  <Badge variant="outline">{assessment.weight}%</Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex items-center justify-between">
              <span className="font-medium">Total Weight</span>
              <Badge
                variant={
                  subjectAssessments.reduce((sum, a) => sum + a.weight, 0) === 100
                    ? "default"
                    : "destructive"
                }
              >
                {subjectAssessments.reduce((sum, a) => sum + a.weight, 0)}%
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
