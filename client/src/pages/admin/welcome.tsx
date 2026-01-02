import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TreeDeciduous, ArrowRight, Shield, BarChart3, Users, BookOpen } from "lucide-react";

export default function AdminWelcome() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  const features = [
    {
      icon: Users,
      title: "Student Management",
      description: "Manage student records and enrollment",
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      icon: BookOpen,
      title: "Subject & Assessment",
      description: "Create subjects and assessments",
      color: "text-emerald-600 dark:text-emerald-400",
      bgColor: "bg-emerald-50 dark:bg-emerald-950",
    },
    {
      icon: BarChart3,
      title: "Grade Analytics",
      description: "View performance insights and trends",
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-50 dark:bg-purple-950",
    },
  ];

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8 animate-in fade-in duration-500">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center shadow-lg">
              <TreeDeciduous className="w-12 h-12 text-primary-foreground" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="uppercase tracking-wide font-medium">Administrator Access</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              You're now logged into GradeTree's administrative dashboard. Manage students, subjects, and grades with powerful BST-based operations.
            </p>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-4 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card 
              key={feature.title} 
              className="border-2 hover-elevate transition-all duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${feature.bgColor} flex items-center justify-center mb-3`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription className="text-sm">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <Card className="border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">Ready to get started?</p>
                <p className="text-base">
                  Access your dashboard to view system statistics, manage records, and visualize data structures.
                </p>
              </div>
              <Button 
                size="lg" 
                onClick={() => setLocation("/admin")}
                className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
                data-testid="button-continue-dashboard"
              >
                Continue to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer Info */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            GradeTree - BST-Based Student Grade Management System
          </p>
        </div>
      </div>
    </div>
  );
}
