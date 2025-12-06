import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin-sidebar";
import { StudentHeader } from "@/components/student-header";
import { Skeleton } from "@/components/ui/skeleton";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import AdminDashboard from "@/pages/admin/dashboard";
import AdminStudents from "@/pages/admin/students";
import AdminSubjects from "@/pages/admin/subjects";
import AdminAssessments from "@/pages/admin/assessments";
import AdminGrades from "@/pages/admin/grades";
import AdminBST from "@/pages/admin/bst";
import AdminAnalytics from "@/pages/admin/analytics";
import StudentDashboard from "@/pages/student/dashboard";

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="space-y-4 w-full max-w-md px-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-32 w-full" />
      </div>
    </div>
  );
}

function ProtectedRoute({
  children,
  allowedRole,
}: {
  children: JSX.Element;
  allowedRole?: "admin" | "student";
}) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  if (allowedRole && user.role !== allowedRole) {
    if (user.role === "admin") {
      return <Redirect to="/admin" />;
    }
    return <Redirect to="/student" />;
  }

  return children;
}

function AdminLayout({ children }: { children: JSX.Element }) {
  const style = {
    "--sidebar-width": "16rem",
    "--sidebar-width-icon": "3rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <AdminSidebar />
        <div className="flex flex-col flex-1 overflow-hidden">
          <header className="flex items-center h-14 px-4 border-b shrink-0">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

function StudentLayout({ children }: { children: JSX.Element }) {
  return (
    <div className="min-h-screen bg-background">
      <StudentHeader />
      <main>{children}</main>
    </div>
  );
}

function PublicRoute({ children }: { children: JSX.Element }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (user) {
    if (user.role === "admin") {
      return <Redirect to="/admin" />;
    }
    return <Redirect to="/student" />;
  }

  return children;
}

function Router() {
  return (
    <Switch>
      <Route path="/">
        <PublicRoute>
          <LoginPage />
        </PublicRoute>
      </Route>

      <Route path="/admin">
        <ProtectedRoute allowedRole="admin">
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/students">
        <ProtectedRoute allowedRole="admin">
          <AdminLayout>
            <AdminStudents />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/subjects">
        <ProtectedRoute allowedRole="admin">
          <AdminLayout>
            <AdminSubjects />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/assessments">
        <ProtectedRoute allowedRole="admin">
          <AdminLayout>
            <AdminAssessments />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/grades">
        <ProtectedRoute allowedRole="admin">
          <AdminLayout>
            <AdminGrades />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/bst">
        <ProtectedRoute allowedRole="admin">
          <AdminLayout>
            <AdminBST />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/analytics">
        <ProtectedRoute allowedRole="admin">
          <AdminLayout>
            <AdminAnalytics />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/student">
        <ProtectedRoute allowedRole="student">
          <StudentLayout>
            <StudentDashboard />
          </StudentLayout>
        </ProtectedRoute>
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
