import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { XCircle, Home, RefreshCw, Phone, Mail } from 'lucide-react';

const PaymentFailedPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const error = location.state?.error || 'Payment failed. Please try again.';
  const bookingId = location.state?.bookingId;

  const handleRetry = () => {
    // Go back to previous page (booking page)
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#060010] flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-[#0f172a]/50 backdrop-blur-md rounded-2xl shadow-2xl overflow-hidden border border-white/10">
        {/* Error Header */}
        <div className="bg-gradient-to-r from-red-500 to-orange-600 p-8 text-white text-center">
          <div className="w-24 h-24 bg-[#0f172a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Payment Failed
          </h1>
          <p className="text-red-100 text-lg">
            We couldn't process your payment
          </p>
        </div>

        {/* Content */}
        <div className="p-8">
          {/* Error Message */}
          <div className="bg-red-500/10 border-2 border-red-500/30 rounded-xl p-6 mb-6">
            <h2 className="font-semibold text-red-500 mb-2 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              What went wrong?
            </h2>
            <p className="text-red-400">{error}</p>
          </div>

          {/* Common Reasons */}
          <div className="bg-[#0f172a]/30 rounded-xl p-6 mb-6 border border-white/10">
            <h3 className="font-semibold text-white mb-4">Common reasons for payment failure:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Insufficient balance in your account</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Incorrect card details or CVV</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Card expired or blocked by bank</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Network connectivity issues</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-red-500 mt-1">•</span>
                <span>Transaction limit exceeded</span>
              </li>
            </ul>
          </div>

          {/* What to do next */}
          <div className="bg-[#0f172a]/30 border border-white/10 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-white mb-3">What you can do:</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-[#a855f7] mt-1">✓</span>
                <span>Check your card details and try again</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a855f7] mt-1">✓</span>
                <span>Try using a different payment method</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a855f7] mt-1">✓</span>
                <span>Contact your bank if the issue persists</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#a855f7] mt-1">✓</span>
                <span>Reach out to our support team for assistance</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white rounded-xl hover:scale-105 transition-all font-semibold shadow-md hover:shadow-lg"
            >
              <RefreshCw className="w-5 h-5" />
              Try Again
            </button>
            <button
              onClick={handleGoHome}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#0f172a] text-white rounded-xl hover:bg-[#1e293b] transition-colors font-semibold border border-white/10"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>

          {/* Support Section */}
          <div className="mt-8 pt-6 border-t border-white/10">
            <h3 className="font-semibold text-white mb-4 text-center">Need Help?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 bg-[#0f172a]/30 rounded-lg border border-white/10">
                <div className="w-10 h-10 bg-[#8400ff]/10 rounded-full flex items-center justify-center">
                  <Phone className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Call Us</p>
                  <p className="font-semibold text-white">+91 1800-123-4567</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 bg-[#0f172a]/30 rounded-lg border border-white/10">
                <div className="w-10 h-10 bg-[#8400ff]/10 rounded-full flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#a855f7]" />
                </div>
                <div>
                  <p className="text-xs text-gray-300">Email Us</p>
                  <p className="font-semibold text-white">support@staylio.com</p>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-300 mt-4">
              Our support team is available 24/7 to assist you
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;

