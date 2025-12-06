import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Assessment, Subject } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Pencil, Trash2, Search, ClipboardList, Loader2 } from "lucide-react";

const assessmentFormSchema = z.object({
  subjectId: z.string().min(1, "Subject is required"),
  name: z.string().min(1, "Assessment name is required"),
  category: z.enum(["quiz", "exam", "project", "assignment"]),
  weight: z.coerce.number().min(0).max(100, "Weight must be between 0 and 100"),
  maxScore: z.coerce.number().min(1, "Max score must be at least 1"),
});

type AssessmentFormData = z.infer<typeof assessmentFormSchema>;

const categoryColors: Record<string, string> = {
  quiz: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  exam: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  project: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  assignment: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
};

export default function AssessmentsPage() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAssessment, setEditingAssessment] = useState<Assessment | null>(null);
  const [deleteAssessment, setDeleteAssessment] = useState<Assessment | null>(null);
  const [filterSubject, setFilterSubject] = useState<string>("all");

  const { data: assessments, isLoading } = useQuery<Assessment[]>({
    queryKey: ["/api/assessments"],
  });

  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ["/api/subjects"],
  });

  const form = useForm<AssessmentFormData>({
    resolver: zodResolver(assessmentFormSchema),
    defaultValues: {
      subjectId: "",
      name: "",
      category: "quiz",
      weight: 10,
      maxScore: 100,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: AssessmentFormData) => {
      return await apiRequest("POST", "/api/assessments", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({ title: "Assessment created successfully" });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error creating assessment", description: error.message, variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AssessmentFormData }) => {
      return await apiRequest("PATCH", `/api/assessments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({ title: "Assessment updated successfully" });
      setIsDialogOpen(false);
      setEditingAssessment(null);
      form.reset();
    },
    onError: (error: Error) => {
      toast({ title: "Error updating assessment", description: error.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/assessments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assessments"] });
      toast({ title: "Assessment deleted successfully" });
      setDeleteAssessment(null);
    },
    onError: (error: Error) => {
      toast({ title: "Error deleting assessment", description: error.message, variant: "destructive" });
    },
  });

  const openEditDialog = (assessment: Assessment) => {
    setEditingAssessment(assessment);
    form.reset({
      subjectId: assessment.subjectId,
      name: assessment.name,
      category: assessment.category as any,
      weight: assessment.weight,
      maxScore: assessment.maxScore,
    });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingAssessment(null);
    form.reset({
      subjectId: "",
      name: "",
      category: "quiz",
      weight: 10,
      maxScore: 100,
    });
    setIsDialogOpen(true);
  };

  const onSubmit = (data: AssessmentFormData) => {
    if (editingAssessment) {
      updateMutation.mutate({ id: editingAssessment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getSubjectName = (subjectId: string) => {
    const subject = subjects?.find((s) => s.id === subjectId);
    return subject ? `${subject.code} - ${subject.title}` : "Unknown";
  };

  const getSubjectCode = (subjectId: string) => {
    return subjects?.find((s) => s.id === subjectId)?.code || "—";
  };

  const filteredAssessments = assessments?.filter((assessment) => {
    const matchesSearch =
      assessment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getSubjectCode(assessment.subjectId).toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = filterSubject === "all" || assessment.subjectId === filterSubject;
    return matchesSearch && matchesSubject;
  });

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight" data-testid="text-assessments-title">
            Assessments
          </h1>
          <p className="text-muted-foreground mt-1">
            Create and manage assessments for each subject
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog} data-testid="button-add-assessment">
              <Plus className="w-4 h-4 mr-2" />
              Add Assessment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingAssessment ? "Edit Assessment" : "Add New Assessment"}</DialogTitle>
              <DialogDescription>
                {editingAssessment
                  ? "Update the assessment details below."
                  : "Create a new assessment for a subject."}
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="subjectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-subject">
                            <SelectValue placeholder="Select a subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {subjects?.map((subject) => (
                            <SelectItem key={subject.id} value={subject.id}>
                              {subject.code} - {subject.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assessment Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Midterm Exam"
                          data-testid="input-assessment-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-category">
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="quiz">Quiz</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="project">Project</SelectItem>
                          <SelectItem value="assignment">Assignment</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Weight (%)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            data-testid="input-weight"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="maxScore"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Score</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            data-testid="input-max-score"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    disabled={isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isPending} data-testid="button-save-assessment">
                    {isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : editingAssessment ? (
                      "Update Assessment"
                    ) : (
                      "Add Assessment"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ClipboardList className="w-5 h-5" />
                Assessment List
              </CardTitle>
              <CardDescription>
                {filteredAssessments?.length || 0} assessments found
              </CardDescription>
            </div>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Select value={filterSubject} onValueChange={setFilterSubject}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects?.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search assessments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                  data-testid="input-search-assessments"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : filteredAssessments && filteredAssessments.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Assessment Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Weight</TableHead>
                    <TableHead>Max Score</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((assessment) => (
                    <TableRow key={assessment.id} data-testid={`row-assessment-${assessment.id}`}>
                      <TableCell className="font-mono text-sm">
                        {getSubjectCode(assessment.subjectId)}
                      </TableCell>
                      <TableCell className="font-medium">{assessment.name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-md capitalize ${categoryColors[assessment.category]}`}
                        >
                          {assessment.category}
                        </span>
                      </TableCell>
                      <TableCell>{assessment.weight}%</TableCell>
                      <TableCell>{assessment.maxScore}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => openEditDialog(assessment)}
                            data-testid={`button-edit-${assessment.id}`}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteAssessment(assessment)}
                            data-testid={`button-delete-${assessment.id}`}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No assessments found</h3>
              <p className="text-muted-foreground mt-1">
                {searchQuery || filterSubject !== "all"
                  ? "Try adjusting your filters"
                  : "Get started by creating your first assessment"}
              </p>
              {!searchQuery && filterSubject === "all" && (
                <Button className="mt-4" onClick={openCreateDialog}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Assessment
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteAssessment} onOpenChange={() => setDeleteAssessment(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Assessment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteAssessment?.name}"? This action cannot be undone
              and will remove all associated grade records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteAssessment && deleteMutation.mutate(deleteAssessment.id)}
              className="bg-destructive text-destructive-foreground"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
