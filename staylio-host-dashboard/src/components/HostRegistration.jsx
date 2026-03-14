import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Building,
  MapPin,
  Upload,
  CreditCard,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import DotBackground from './DotBackground';

const HostRegistration = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    companyName: '',
    businessAddress: '',
    kycDocumentUrl: '',
    payoutDetails: ''
  });

  const [validationErrors, setValidationErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.ownerName.trim()) {
      errors.ownerName = 'Owner name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }

    if (!formData.businessAddress.trim()) {
      errors.businessAddress = 'Business address is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create host registration data with password
      const hostData = {
        ownerName: formData.ownerName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        companyName: formData.companyName,
        businessAddress: formData.businessAddress,
        kycDocumentUrl: formData.kycDocumentUrl || null,
        payoutDetails: formData.payoutDetails || null
      };

      // Submit registration using new auth API
      const response = await axios.post('http://localhost:8080/api/auth/signup-host', hostData);

      if (!response.data.success) {
        setError(response.data.message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      // Reset form
      setFormData({
        ownerName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        companyName: '',
        businessAddress: '',
        kycDocumentUrl: '',
        payoutDetails: ''
      });
    } catch (err) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('Registration failed. Please try again.');
      }
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <DotBackground>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bento-card p-8 text-center border border-white/10">
            <div className="mx-auto h-16 w-16 bg-green-500/20 rounded-full flex items-center justify-center mb-6 border border-green-500/30">
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Registration Successful!
            </h2>
            <p className="text-gray-400 mb-6">
              Your host registration has been submitted successfully. Your account is now pending approval from our admin team.
            </p>
            <p className="text-sm text-gray-500 mb-8">
              You will receive an email notification once your account has been reviewed and approved.
            </p>
            <div className="space-y-3">
              <Link
                to="/login"
                className="w-full btn-magic block text-center text-white py-2 rounded-lg"
              >
                Go to Login
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setFormData({
                    ownerName: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                    companyName: '',
                    businessAddress: '',
                    kycDocumentUrl: '',
                    payoutDetails: ''
                  });
                }}
                className="w-full bg-white/5 text-gray-300 py-2 rounded-lg hover:bg-white/10 border border-white/10 transition-colors"
              >
                Register Another Host
              </button>
            </div>
          </div>
        </div>
      </DotBackground>
    );
  }

  return (
    <DotBackground>
      <div className="min-h-screen py-8 px-4">
        <div className="max-w-2xl mx-auto relative z-10">
          {/* Header */}
          <div className="text-center mb-8">
            <Link
              to="/login"
              className="inline-flex items-center text-[#a855f7] hover:text-[#c084fc] mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Link>
            <div className="mx-auto h-12 w-12 bg-[#8400ff] rounded-lg flex items-center justify-center mb-4 shadow-lg shadow-[#8400ff]/20">
              <Building className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Host Registration
            </h1>
            <p className="text-gray-400">
              Join Staylio as a host and start managing your properties
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="bento-card p-8 border border-white/10">
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center space-x-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <span className="text-sm text-red-300">{error}</span>
              </div>
            )}

            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Owner Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        name="ownerName"
                        value={formData.ownerName}
                        onChange={handleInputChange}
                        className={`input-magic w-full pl-10 py-2 rounded-lg ${validationErrors.ownerName ? 'border-red-500/50' : ''}`}
                        placeholder="Enter your full name"
                      />
                    </div>
                    {validationErrors.ownerName && (
                      <p className="text-sm text-red-400 mt-1">{validationErrors.ownerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`input-magic w-full pl-10 py-2 rounded-lg ${validationErrors.email ? 'border-red-500/50' : ''}`}
                        placeholder="Enter your email"
                      />
                    </div>
                    {validationErrors.email && (
                      <p className="text-sm text-red-400 mt-1">{validationErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className={`input-magic w-full pl-10 py-2 rounded-lg ${validationErrors.phone ? 'border-red-500/50' : ''}`}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    {validationErrors.phone && (
                      <p className="text-sm text-red-400 mt-1">{validationErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`input-magic w-full pr-10 py-2 rounded-lg ${validationErrors.password ? 'border-red-500/50' : ''}`}
                        placeholder="Create a password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-500 hover:text-gray-300" />
                        )}
                      </button>
                    </div>
                    {validationErrors.password && (
                      <p className="text-sm text-red-400 mt-1">{validationErrors.password}</p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`input-magic w-full py-2 rounded-lg ${validationErrors.confirmPassword ? 'border-red-500/50' : ''}`}
                      placeholder="Confirm your password"
                    />
                    {validationErrors.confirmPassword && (
                      <p className="text-sm text-red-400 mt-1">{validationErrors.confirmPassword}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Business Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Business Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Company Name *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className={`input-magic w-full pl-10 py-2 rounded-lg ${validationErrors.companyName ? 'border-red-500/50' : ''}`}
                        placeholder="Enter your company name"
                      />
                    </div>
                    {validationErrors.companyName && (
                      <p className="text-sm text-red-400 mt-1">{validationErrors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Business Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <textarea
                        name="businessAddress"
                        value={formData.businessAddress}
                        onChange={handleInputChange}
                        rows={3}
                        className={`input-magic w-full pl-10 py-2 rounded-lg resize-none ${validationErrors.businessAddress ? 'border-red-500/50' : ''}`}
                        placeholder="Enter your complete business address"
                      />
                    </div>
                    {validationErrors.businessAddress && (
                      <p className="text-sm text-red-400 mt-1">{validationErrors.businessAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Optional Information */}
              <div>
                <h3 className="text-lg font-semibold text-white mb-4">Additional Information (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      KYC Document URL
                    </label>
                    <div className="relative">
                      <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                      <input
                        type="url"
                        name="kycDocumentUrl"
                        value={formData.kycDocumentUrl}
                        onChange={handleInputChange}
                        className="input-magic w-full pl-10 py-2 rounded-lg"
                        placeholder="https://example.com/kyc-document.pdf"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload your KYC documents to a cloud service and provide the URL
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Payout Details
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
                      <textarea
                        name="payoutDetails"
                        value={formData.payoutDetails}
                        onChange={handleInputChange}
                        rows={3}
                        className="input-magic w-full pl-10 py-2 rounded-lg resize-none"
                        placeholder="Enter your bank account details or preferred payout method"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-magic text-white py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Registering...</span>
                  </div>
                ) : (
                  'Register as Host'
                )}
              </button>

              <p className="text-center text-sm text-gray-400 mt-4">
                Already have an account?{' '}
                <Link to="/login" className="text-[#a855f7] hover:text-[#c084fc] font-medium transition-colors">
                  Sign in here
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </DotBackground>
  );
};

export default HostRegistration;