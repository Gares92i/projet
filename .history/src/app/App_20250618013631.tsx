import { Routes, Route } from "react-router-dom";
import Index from "@/pages/Index";
import Projects from "@/features/projects/pages/Projects";
import Clients from "@/features/clients/pages/Clients";
import Team from "@/features/team/pages/Team";
import Tasks from "@/features/tasks/pages/Tasks";
import Calendar from "@/features/calendar/pages/Calendar";
import GanttChart from "@/pages/GanttChart";
import Documents from "@/features/documents/pages/Documents";
import Resources from "@/features/resources/pages/Resources";
import Settings from "@/features/settings/pages/Settings";
import ProjectDetails from "@/features/projects/pages/ProjectDetails";
import EditProject from "@/features/projects/pages/EditProject";
import { Toaster } from "@/ui/sonner";
import NotFound from "@/pages/NotFound";
import SiteVisitReportForm from "@/features/reports/pages/SiteVisitReportForm";
import SiteVisitReportDetail from "@/features/reports/pages/SiteVisitReportDetail";
import ProjectAnnotations from "@/features/annotations/pages/ProjectAnnotations";
import Auth from "@/features/auth/pages/Auth";
import Profile from "@/features/profile/pages/Profile";
import Pricing from "@/pages/Pricing";
import SubscriptionSuccess from "@/pages/SubscriptionSuccess";
import { AuthGuard } from "@features/auth/components/AuthGuard";
import { GuestGuard } from "@features/auth/components/GuestGuard";
import Chat from "@features/chat/pages/Chat";
import { ThemeProvider } from "@contexts/ThemeContext";
import ProjectDescriptif from "@features/descriptif/pages/ProjectDescriptif";

import { useEffect } from 'react';
import { getOrCreateDefaultTeam, initializeDataSync, setUseLocalMode } from './services/teamService';

function App() {


  return (
    <ThemeProvider>
      <Routes>
        {/* Pages publiques */}
        <Route
          path="/auth"
          element={
            <GuestGuard>
              <Auth />
            </GuestGuard>
          }
        />

        {/* Pages protégées par authentification */}
        <Route
          path="/"
          element={
            <AuthGuard>
              <Index />
            </AuthGuard>
          }
        />
        <Route
          path="/projects"
          element={
            <AuthGuard>
              <Projects />
            </AuthGuard>
          }
        />
        <Route
          path="/clients"
          element={
            <AuthGuard>
              <Clients />
            </AuthGuard>
          }
        />
        <Route
          path="/team"
          element={
            <AuthGuard>
              <Team />
            </AuthGuard>
          }
        />
        <Route
          path="/tasks"
          element={
            <AuthGuard>
              <Tasks />
            </AuthGuard>
          }
        />
        <Route
          path="/calendar"
          element={
            <AuthGuard>
              <Calendar />
            </AuthGuard>
          }
        />
        <Route
          path="/gantt"
          element={
            <AuthGuard>
              <GanttChart />
            </AuthGuard>
          }
        />
        <Route
          path="/documents"
          element={
            <AuthGuard>
              <Documents />
            </AuthGuard>
          }
        />
        <Route
          path="/resources"
          element={
            <AuthGuard>
              <Resources />
            </AuthGuard>
          }
        />
        <Route
          path="/settings"
          element={
            <AuthGuard>
              <Settings />
            </AuthGuard>
          }
        />
        <Route
          path="/profile"
          element={
            <AuthGuard>
              <Profile />
            </AuthGuard>
          }
        />
        <Route path="/pricing" element={<Pricing />} />
        <Route
          path="/chat"
          element={
            <AuthGuard>
              <Chat />
            </AuthGuard>
          }
        />
        <Route
          path="/subscription/success"
          element={
            <AuthGuard>
              <SubscriptionSuccess />
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:id"
          element={
            <AuthGuard>
              <ProjectDetails />
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:id/edit"
          element={
            <AuthGuard>
              <EditProject />
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:id/annotations"
          element={
            <AuthGuard>
              <ProjectAnnotations />
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:id/descriptif"
          element={
            <AuthGuard>
              <ProjectDescriptif />
            </AuthGuard>
          }
        />

        {/* Routes pour les rapports de visites */}
        <Route
          path="/projects/:projectId/report/new"
          element={
            <AuthGuard>
              <SiteVisitReportForm />
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:projectId/report/:reportId"
          element={
            <AuthGuard>
              <SiteVisitReportDetail />
            </AuthGuard>
          }
        />
        <Route
          path="/projects/:projectId/report/:reportId/edit"
          element={
            <AuthGuard>
              <SiteVisitReportForm />
            </AuthGuard>
          }
        />

        {/* Anciennes routes (fallbacks) */}
        <Route
          path="/site-visit-reports/new"
          element={
            <AuthGuard>
              <SiteVisitReportForm />
            </AuthGuard>
          }
        />
        <Route
          path="/site-visit-reports/:id"
          element={
            <AuthGuard>
              <SiteVisitReportDetail />
            </AuthGuard>
          }
        />

        {/* Page 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-right" />
    </ThemeProvider>
  );
}

export default App;
