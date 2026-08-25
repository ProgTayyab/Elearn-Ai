import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import { AuthBootstrap } from './components/auth/AuthBootstrap';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { GuestRoute } from './components/auth/GuestRoute';
import { Layout } from './components/layout/Layout';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { HomeScreen } from './screens/HomeScreen';
import { CoursesScreen } from './screens/CoursesScreen';
import { GenerateCourseScreen } from './screens/GenerateCourseScreen';
import { CourseOverviewScreen } from './screens/CourseOverviewScreen';
import { ModuleScreen } from './screens/ModuleScreen';
import { ModuleSummaryScreen } from './screens/ModuleSummaryScreen';
import { QuizScreen } from './screens/QuizScreen';
import { AssignmentScreen } from './screens/AssignmentScreen';
import { AITutorScreen } from './screens/AITutorScreen';
import { AnalyticsScreen } from './screens/AnalyticsScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function CatchAllRedirect() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  return <Navigate to={isAuthenticated ? '/' : '/onboarding'} replace />;
}

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthBootstrap>
        <BrowserRouter>
          <Routes>
            <Route
              path="/onboarding"
              element={
                <GuestRoute>
                  <OnboardingScreen />
                </GuestRoute>
              }
            />
            <Route
              path="/login"
              element={
                <GuestRoute>
                  <LoginScreen />
                </GuestRoute>
              }
            />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout>
                    <HomeScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CoursesScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/generate-course"
              element={
                <ProtectedRoute>
                  <Layout>
                    <GenerateCourseScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <CourseOverviewScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules/:id"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ModuleScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules/:id/summary"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ModuleSummaryScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules/:id/quiz"
              element={
                <ProtectedRoute>
                  <Layout>
                    <QuizScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/courses/:courseId/modules/:id/assignment"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AssignmentScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tutor"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AITutorScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/analytics"
              element={
                <ProtectedRoute>
                  <Layout>
                    <AnalyticsScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ProfileScreen />
                  </Layout>
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<CatchAllRedirect />} />
          </Routes>
        </BrowserRouter>
      </AuthBootstrap>
    </QueryClientProvider>
  );
};

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
