import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import Layout from './components/Layout';
import Dashboard from './modules/Dashboard/Dashboard';
import Billing from './modules/Billing/Billing';
import HR from './modules/HR/HR';
import Scheduling from './modules/Scheduling/Scheduling';
import Registration from './modules/Registration/Registration';
import AccessDenied from './components/AccessDenied';
import './App.css';

// Protects routes - redirects to login if not authenticated
function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  return user ? children : <Navigate to="/login" />;
}

// Protects module routes based on role permissions
function ModuleRoute({ module, children }) {
  const { canAccess } = useAuth();
  return canAccess(module) ? children : <AccessDenied module={module} />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="billing"      element={<ModuleRoute module="billing">     <Billing />     </ModuleRoute>} />
        <Route path="hr"           element={<ModuleRoute module="hr">          <HR />          </ModuleRoute>} />
        <Route path="scheduling"   element={<ModuleRoute module="scheduling">  <Scheduling />  </ModuleRoute>} />
        <Route path="registration" element={<ModuleRoute module="registration"><Registration /></ModuleRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
