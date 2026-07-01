
import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";


const LandingPage = lazy(() => import("./pages/LandingPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const UsersPage = lazy(() => import("./pages/UsersPage"));
const TasksPage = lazy(() => import("./pages/Taskspage"));
const CalendarPage = lazy(() => import("./pages/CalendarPage"));
const ChatPage = lazy(() => import("./pages/ChatPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const OwnerDashboardPage = lazy(() => import("./pages/OwnerDashboardPage"));
const CompaniesPage = lazy(() => import("./pages/CompaniesPage"));
const CreateCompanyPage = lazy(() => import("./pages/CreateCompanyPage"));
const RegisterCompanyPage = lazy(() => import("./pages/RegisterCompanyPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const CompanyDetailsPage = lazy(() => import("./pages/CompanyDetails"));
const OwnerSettingsPage = lazy(() => import("./pages/OwnerSettingsPage"));
const TermsPage=lazy(()=> import("./pages/TermsPage"));
const PrivacyPage=lazy(()=> import("./pages/PrivacyPage"));

function App() {
  return (

    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >

      <Routes>

        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/owner-dashboard" element={<OwnerDashboardPage />} />
        <Route path="/companies" element={<CompaniesPage />} />
        <Route path="/create-company" element={<CreateCompanyPage />} />
        <Route path="/register-company" element={<RegisterCompanyPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/company/:id" element={<CompanyDetailsPage />} />
        <Route path="/owner-settings" element={<OwnerSettingsPage />} />
        <Route path="/terms" element={<TermsPage/>}/>
        <Route path="/privacy" element={<PrivacyPage/>}/>

      </Routes>

    </Suspense>

  );
}

export default App