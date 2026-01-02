import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TreeDeciduous, ArrowRight, GraduationCap, BookOpen, Award, BarChart } from "lucide-react";

export default function StudentWelcome() {
    const [, setLocation] = useLocation();
    const { user } = useAuth();

    const features = [
        {
            icon: BookOpen,
            title: "View Grades",
            description: "Check your grades across all subjects",
            color: "text-blue-600 dark:text-blue-400",
            bgColor: "bg-blue-50 dark:bg-blue-950",
        },
        {
            icon: BarChart,
            title: "Track Progress",
            description: "Monitor your academic performance",
            color: "text-emerald-600 dark:text-emerald-400",
            bgColor: "bg-emerald-50 dark:bg-emerald-950",
        },
        {
            icon: Award,
            title: "Assessment Details",
            description: "Review detailed assessment breakdowns",
            color: "text-amber-600 dark:text-amber-400",
            bgColor: "bg-amber-50 dark:bg-amber-950",
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
                            <GraduationCap className="w-4 h-4" />
                            <span className="uppercase tracking-wide font-medium">Student Portal</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tight">
                            Welcome, {user?.name?.split(' ')[0] || 'Student'}!
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                            You're now logged into your GradeTree student portal. View your grades, track your progress, and stay on top of your academic journey.
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
                                <p className="text-sm font-medium text-muted-foreground">Ready to check your grades?</p>
                                <p className="text-base">
                                    Access your dashboard to view all your subjects, grades, and academic performance.
                                </p>
                            </div>
                            <Button
                                size="lg"
                                onClick={() => setLocation("/student")}
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
                        GradeTree - Your Academic Performance Hub
                    </p>
                </div>
            </div>
        </div>
    );
}
