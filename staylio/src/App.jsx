import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import HotelsPage from './pages/HotelsPage'
import HotelDetailPage from './pages/HotelDetailPage'
import BookingPage from './pages/BookingPage'
import AuthPage from './pages/AuthPage'
import RegistrationPage from './pages/RegistrationPage'
import LoginPage from './pages/LoginPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import DashboardPage from './pages/DashboardPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import PaymentSuccessPage from './pages/PaymentSuccessPage'
import PaymentFailedPage from './pages/PaymentFailedPage'
import HotelUnclaimedPage from './pages/HotelUnclaimedPage'
import WalletPage from './pages/WalletPage'
import NotFound from './pages/NotFound'
import { useState } from 'react'
import ChatbotIcon from './components/chatbot/ChatbotIcon'
import ChatbotWindow from './components/chatbot/ChatbotWindow'
import './App.css'

import ScrollToTop from './components/ScrollToTop'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="App">
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/hotels" element={<HotelsPage />} />
            <Route path="/hotels/:id" element={<HotelDetailPage />} />
            <Route path="/hotels/:id/book" element={<BookingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            {/* Auth Routes - Redirect to dashboard if already logged in */}
            <Route path="/auth" element={
              <ProtectedRoute requireAuth={false}>
                <AuthPage />
              </ProtectedRoute>
            } />
            <Route path="/register" element={
              <ProtectedRoute requireAuth={false}>
                <RegistrationPage />
              </ProtectedRoute>
            } />
            <Route path="/login" element={
              <ProtectedRoute requireAuth={false}>
                <LoginPage />
              </ProtectedRoute>
            } />
            <Route path="/forgot-password" element={
              <ProtectedRoute requireAuth={false}>
                <ForgotPasswordPage />
              </ProtectedRoute>
            } />

            {/* Protected Routes - Require authentication */}
            <Route path="/dashboard" element={
              <ProtectedRoute requireAuth={true}>
                <DashboardPage />
              </ProtectedRoute>
            } />
            <Route path="/wallet" element={
              <ProtectedRoute requireAuth={true}>
                <WalletPage />
              </ProtectedRoute>
            } />

            {/* Payment Routes */}
            <Route path="/payment/success" element={<PaymentSuccessPage />} />
            <Route path="/payment/failed" element={<PaymentFailedPage />} />

            {/* Hotel Unclaimed Route */}
            <Route path="/hotel-unclaimed" element={<HotelUnclaimedPage />} />

            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>

          {/* Global Chatbot */}
          <ChatbotIcon onClick={() => setIsChatOpen(prev => !prev)} isOpen={isChatOpen} />
          <ChatbotWindow isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App