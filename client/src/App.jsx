import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/Layout/DashboardLayout';

// Lazy load all pages to prevent module-level crash from killing the entire app
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LessonsPage = lazy(() => import('./pages/LessonsPage'));
const SimulationsPage = lazy(() => import('./pages/SimulationsPage'));
const EmergencySupportPage = lazy(() => import('./pages/EmergencySupportPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const UsersManagementPage = lazy(() => import('./pages/UsersManagementPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));

function LoadingSpinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
      <div style={{
        width: 48, height: 48, border: '4px solid #6366f1',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#0f172a'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48, height: 48, border: '4px solid #6366f1',
            borderTopColor: 'transparent', borderRadius: '50%',
            animation: 'spin 1s linear infinite', margin: '0 auto 16px'
          }} />
          <p style={{ color: '#94a3b8' }}>Loading Campus Safety Hub...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
        <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />

        {/* Protected routes inside DashboardLayout */}
        <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/lessons" element={<LessonsPage />} />
          <Route path="/simulations" element={<SimulationsPage />} />
          <Route path="/emergency" element={<EmergencySupportPage />} />
          <Route path="/reports" element={
            <ProtectedRoute roles={['admin', 'staff', 'officer']}>
              <ReportsPage />
            </ProtectedRoute>
          } />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/users" element={
            <ProtectedRoute roles={['admin']}>
              <UsersManagementPage />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1e293b',
              color: '#f1f5f9',
              border: '1px solid #334155',
              borderRadius: '12px',
              fontSize: '14px',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: '#1e293b' }
            },
            error: {
              iconTheme: { primary: '#ef4444', secondary: '#1e293b' }
            }
          }}
        />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
