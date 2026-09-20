import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { DriveProvider } from '@/context/DriveContext';
import Login from '@/pages/Login';
import Drive from '@/pages/Drive';
import { ReactNode } from 'react';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">Loading your drive...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-medium text-slate-600">Checking session...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={<Navigate to={user ? '/drive' : '/login'} replace />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/drive"
        element={
          <ProtectedRoute>
            <DriveProvider>
              <Drive />
            </DriveProvider>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to={user ? '/drive' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
