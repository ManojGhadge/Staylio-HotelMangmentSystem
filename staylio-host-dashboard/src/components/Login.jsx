import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, AlertCircle } from 'lucide-react';
import DotBackground from './DotBackground';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoCredentials = () => {
    setEmail('host@staylio.com');
    setPassword('host123');
  };

  return (
    <DotBackground>
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8 relative z-10">
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-[#8400ff] rounded-lg flex items-center justify-center shadow-lg shadow-[#8400ff]/20">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-bold text-white">
              Staylio Host Dashboard
            </h2>
            <p className="mt-2 text-sm text-gray-400">
              Sign in to manage your properties
            </p>
          </div>

          {/* Demo Credentials */}
          {/* <div className="bento-card p-4 border border-white/10">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Demo Host Credentials:</h3>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials()}
                className="w-full text-left p-2 rounded-lg bg-[#8400ff]/10 hover:bg-[#8400ff]/20 border border-[#8400ff]/20 transition-colors group"
              >
                <div className="text-sm font-medium text-[#a855f7] group-hover:text-white transition-colors">Host Login</div>
                <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">host@staylio.com / host123</div>
              </button>
            </div>
          </div> */}

          {/* Login Form */}
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="bento-card p-8 border border-white/10">
              {error && (
                <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <span className="text-sm text-red-300">{error}</span>
                </div>
              )}

              <div className="space-y-4">
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="input-magic w-full pl-10 py-2 rounded-lg"
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-magic w-full pl-10 pr-10 py-2 rounded-lg"
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-magic text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Signing in...</span>
                    </div>
                  ) : (
                    'Sign In'
                  )}
                </button>
              </div>
            </div>
          </form>

          {/* Registration Link */}
          <div className="text-center mt-6">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="text-[#a855f7] hover:text-[#c084fc] font-medium transition-colors">
                Register as Host
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-xs text-gray-600">
              © 2025 Staylio. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </DotBackground>
  );
};

export default Login;