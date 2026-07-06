import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Sidebar from './components/layout/Sidebar';
import Login from './pages/Login';
import Register from './pages/Register';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Accounts = lazy(() => import('./pages/Accounts'));
const AccountDetail = lazy(() => import('./pages/AccountDetail'));
const Campaigns = lazy(() => import('./pages/Campaigns'));
const PerformancePage = lazy(() => import('./pages/PerformancePage'));
const Reports = lazy(() => import('./pages/Reports'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const PageLoader = () => (
  <div className="loading"><div className="spinner" /></div>
);

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <PageLoader />;
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => (
  <div className="app-container">
    <Sidebar />
    <div className="main-content">
      <Suspense fallback={<PageLoader />}>
        {children}
      </Suspense>
    </div>
  </div>
);

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />
      <Route path="/" element={<PrivateRoute><AppLayout><Dashboard /></AppLayout></PrivateRoute>} />
      <Route path="/accounts" element={<PrivateRoute><AppLayout><Accounts /></AppLayout></PrivateRoute>} />
      <Route path="/accounts/:id" element={<PrivateRoute><AppLayout><AccountDetail /></AppLayout></PrivateRoute>} />
      <Route path="/campaigns" element={<PrivateRoute><AppLayout><Campaigns /></AppLayout></PrivateRoute>} />
      <Route path="/performance" element={<PrivateRoute><AppLayout><PerformancePage /></AppLayout></PrivateRoute>} />
      <Route path="/reports" element={<PrivateRoute><AppLayout><Reports /></AppLayout></PrivateRoute>} />
      <Route path="/profile" element={<PrivateRoute><AppLayout><Profile /></AppLayout></PrivateRoute>} />
      <Route path="/settings" element={<PrivateRoute><AppLayout><Settings /></AppLayout></PrivateRoute>} />
      <Route path="*" element={<PrivateRoute><AppLayout><NotFound /></AppLayout></PrivateRoute>} />
    </Routes>
  );
};

const App = () => (
  <AuthProvider>
    <ErrorBoundary>
      <Router>
        <AppRoutes />
        <ToastContainer position="top-right" autoClose={3000} />
      </Router>
    </ErrorBoundary>
  </AuthProvider>
);

export default App;
