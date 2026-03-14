import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './components/Login';
import HostRegistrationPage from './pages/HostRegistrationPage';
import AuthTestPage from './pages/AuthTestPage';
import Dashboard from './pages/Dashboard';
import ClaimHotelPage from './pages/ClaimHotelPage';
import MyClaimsPage from './pages/MyClaimsPage';
import MyHotelsPage from './pages/MyHotelsPage';
import BookingsPage from './pages/BookingsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import WalletPage from './pages/WalletPage';

import ScrollToTop from './components/ScrollToTop';

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<HostRegistrationPage />} />
            <Route path="/auth-test" element={<AuthTestPage />} />

            {/* Protected Routes - Host Dashboard */}
            <Route path="/dashboard" element={
              <ProtectedRoute requiredRole="host">
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />

            {/* Host Routes */}
            <Route path="/my-hotels" element={
              <ProtectedRoute requiredRole="host">
                <Layout>
                  <MyHotelsPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/claim-hotel" element={
              <ProtectedRoute requiredRole="host">
                <Layout>
                  <ClaimHotelPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/my-claims" element={
              <ProtectedRoute requiredRole="host">
                <Layout>
                  <MyClaimsPage />
                </Layout>
              </ProtectedRoute>
            } />



            <Route path="/bookings" element={
              <ProtectedRoute requiredRole="host">
                <Layout>
                  <BookingsPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/analytics" element={
              <ProtectedRoute requiredRole="host">
                <Layout>
                  <AnalyticsPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/wallet" element={
              <ProtectedRoute requiredRole="host">
                <Layout>
                  <WalletPage />
                </Layout>
              </ProtectedRoute>
            } />

            <Route path="/profile" element={
              <ProtectedRoute>
                <Layout>
                  <ProfilePage />
                </Layout>
              </ProtectedRoute>
            } />


            {/* Default redirect */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* 404 Route */}
            <Route path="*" element={
              <div className="min-h-screen bg-[#060010] flex items-center justify-center p-4">
                <div className="text-center bento-card p-8 max-w-md w-full border border-white/10">
                  <h1 className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8400ff] to-[#a855f7] mb-4">404</h1>
                  <p className="text-white text-xl mb-2">Page Not Found</p>
                  <p className="text-gray-400 mb-6">The page you are looking for doesn't exist or has been moved.</p>
                  <button
                    onClick={() => window.history.back()}
                    className="btn-magic text-white px-6 py-2 rounded-lg"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            } />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
