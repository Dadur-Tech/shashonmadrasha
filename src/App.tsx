import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { RequireAuth, RequireAdmin } from "@/components/auth/RequireAuth";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/Login";
import ResultsPage from "./pages/Results";
import StudentProfile from "./pages/StudentProfile";
import PublicStudentsPage from "./pages/Students";
import AlumniPage from "./pages/Alumni";
import PublicClassesPage from "./pages/Classes";
import CoursesPage from "./pages/Courses";
import CourseDetailPage from "./pages/CourseDetail";
import LessonDetailPage from "./pages/LessonDetail";
import LillahStudentsPage from "./pages/LillahStudents";

// Admin Pages
import AdminDashboard from "./pages/admin";
import AdminStudentsPage from "./pages/admin/Students";
import TeachersPage from "./pages/admin/Teachers";
import ClassesPage from "./pages/admin/Classes";
import LillahPage from "./pages/admin/Lillah";
import FeesPage from "./pages/admin/Fees";
import ExpensesPage from "./pages/admin/Expenses";
import SalariesPage from "./pages/admin/Salaries";
import AttendancePage from "./pages/admin/Attendance";
import ExamsPage from "./pages/admin/Exams";
import ReportsPage from "./pages/admin/Reports";
import OnlineClassesPage from "./pages/admin/OnlineClasses";
import DonationsPage from "./pages/admin/Donations";
import PaymentGatewaysPage from "./pages/admin/PaymentGateways";
import InstitutionPage from "./pages/admin/Institution";
import SettingsPage from "./pages/admin/Settings";
import HelpPage from "./pages/admin/Help";
import AlumniManagement from "./pages/admin/AlumniManagement";
import JamiyatManagement from "./pages/admin/JamiyatManagement";
import BootstrapAdminPage from "./pages/admin/BootstrapAdmin";
import UserManagementPage from "./pages/admin/UserManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/results" element={<ResultsPage />} />
            <Route path="/students" element={<PublicStudentsPage />} />
            <Route path="/student/:studentId" element={<StudentProfile />} />
            <Route path="/alumni" element={<AlumniPage />} />
            <Route path="/classes" element={<PublicClassesPage />} />
            <Route path="/courses" element={<CoursesPage />} />
            <Route path="/course/:courseId" element={<CourseDetailPage />} />
            <Route path="/lesson/:lessonId" element={<LessonDetailPage />} />
            <Route path="/lillah-students" element={<LillahStudentsPage />} />
            
            {/* Bootstrap Admin - requires auth but not admin role (for initial setup) */}
            <Route element={<RequireAuth />}>
              <Route path="/admin/bootstrap-admin" element={<BootstrapAdminPage />} />
            </Route>
            
            {/* Admin Routes - requires admin role */}
            <Route element={<RequireAdmin />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/students" element={<AdminStudentsPage />} />
              <Route path="/admin/teachers" element={<TeachersPage />} />
              <Route path="/admin/classes" element={<ClassesPage />} />
              <Route path="/admin/attendance" element={<AttendancePage />} />
              <Route path="/admin/fees" element={<FeesPage />} />
              <Route path="/admin/lillah" element={<LillahPage />} />
              <Route path="/admin/exams" element={<ExamsPage />} />
              <Route path="/admin/reports" element={<ReportsPage />} />
              <Route path="/admin/online-classes" element={<OnlineClassesPage />} />
              <Route path="/admin/donations" element={<DonationsPage />} />
              <Route path="/admin/expenses" element={<ExpensesPage />} />
              <Route path="/admin/salaries" element={<SalariesPage />} />
              <Route path="/admin/payment-gateways" element={<PaymentGatewaysPage />} />
              <Route path="/admin/institution" element={<InstitutionPage />} />
              <Route path="/admin/settings" element={<SettingsPage />} />
              <Route path="/admin/help" element={<HelpPage />} />
              <Route path="/admin/alumni" element={<AlumniManagement />} />
              <Route path="/admin/jamiyat" element={<JamiyatManagement />} />
              <Route path="/admin/users" element={<UserManagementPage />} />
            </Route>
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
