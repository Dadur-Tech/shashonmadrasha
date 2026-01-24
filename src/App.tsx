import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/auth/Login";
import ResultsPage from "./pages/Results";

// Admin Pages
import AdminDashboard from "./pages/admin";
import StudentsPage from "./pages/admin/Students";
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
            
            {/* Admin Routes */}
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/students" element={<StudentsPage />} />
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
            
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
