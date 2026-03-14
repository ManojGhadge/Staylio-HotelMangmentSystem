import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    // Form States
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const hotelImages = [
        "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1618773928121-c32242e63f39?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80",
        "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?ixlib=rb-4.0.3&auto=format&fit=crop&w=2049&q=80",
        "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80"
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % hotelImages.length);
        }, 5000);
        return () => clearInterval(timer);
    }, []);

    // Step 1: Request OTP
    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await authService.forgotPassword(email);
            if (res.success) {
                setSuccess('OTP sent successfully!');
                setTimeout(() => {
                    setSuccess('');
                    setStep(2);
                }, 1000);
            } else {
                setError(res.message || 'Failed to send OTP.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await authService.verifyOtp(email, otp);
            if (res.success) {
                setSuccess('OTP Verified!');
                setTimeout(() => {
                    setSuccess('');
                    setStep(3);
                }, 1000);
            } else {
                setError(res.message || 'Invalid OTP.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');

        if (newPassword !== confirmPassword) {
            setError("Passwords don't match");
            return;
        }

        setIsLoading(true);
        try {
            const res = await authService.resetPassword(email, otp, newPassword);
            if (res.success) {
                setSuccess('Password reset successfully! Redirecting...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(res.message || 'Failed to reset password.');
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // Parallax Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const layer1X = useTransform(x, [-100, 100], [-20, 20]);
    const layer1Y = useTransform(y, [-100, 100], [-20, 20]);
    const cardX = useTransform(x, [-100, 100], [-5, 5]);
    const cardY = useTransform(y, [-100, 100], [-5, 5]);

    const handleMouseMove = (event) => {
        x.set((event.clientX / window.innerWidth - 0.5) * 200);
        y.set((event.clientY / window.innerHeight - 0.5) * 200);
    };

    return (
        <div
            className="min-h-screen w-full flex bg-[#030014] overflow-hidden"
            onMouseMove={handleMouseMove}
        >
            {/* Left Side - Form Section */}
            <div className="w-full lg:w-1/2 relative flex items-center justify-center p-4 lg:p-12 z-20 h-screen overflow-y-auto custom-scrollbar">

                {/* Background Effects */}
                <motion.div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ x: layer1X, y: layer1Y }}>
                    <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[80px] mix-blend-screen"></div>
                </motion.div>

                {/* Form Card */}
                <motion.div
                    className="w-full max-w-md bg-[#13111C]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-8 relative overflow-hidden z-10 my-auto"
                    style={{ x: cardX, y: cardY }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    {/* Inner Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <motion.h1
                                className="text-3xl font-bold text-white mb-2"
                                key={step}
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                            >
                                {step === 1 ? 'Forgot Password?' : step === 2 ? 'Verify OTP' : 'Reset Password'}
                            </motion.h1>
                            <motion.p
                                className="text-purple-200/60 font-light text-sm"
                                key={`sub-${step}`}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                {step === 1
                                    ? 'Enter your email to receive a verification code'
                                    : step === 2
                                        ? `Enter the code sent to ${email}`
                                        : 'Create a new secure password'
                                }
                            </motion.p>
                        </div>

                        {/* Steps */}
                        <AnimatePresence mode="wait">
                            {step === 1 && (
                                <motion.form
                                    key="step1"
                                    onSubmit={handleRequestOtp}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium ml-1">Email Address</label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                            <input
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="name@example.com"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner font-medium"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <FormActions
                                        isLoading={isLoading}
                                        error={error}
                                        success={success}
                                        buttonText="Send Code"
                                        backLink="/login"
                                        backText="Back to Login"
                                    />
                                </motion.form>
                            )}

                            {step === 2 && (
                                <motion.form
                                    key="step2"
                                    onSubmit={handleVerifyOtp}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-2">
                                        <label className="text-sm text-gray-400 font-medium ml-1">Verification Code</label>
                                        <div className="relative group">
                                            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                                placeholder="Enter 6-digit OTP"
                                                maxLength={6}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner tracking-widest text-lg font-mono"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <FormActions
                                        isLoading={isLoading}
                                        error={error}
                                        success={success}
                                        buttonText="Verify Code"
                                        onBack={() => setStep(1)}
                                        backText="Change Email"
                                    />
                                </motion.form>
                            )}

                            {step === 3 && (
                                <motion.form
                                    key="step3"
                                    onSubmit={handleResetPassword}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="space-y-6"
                                >
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-medium ml-1">New Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                                <input
                                                    type="password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    placeholder="Minimum 6 characters"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm text-gray-400 font-medium ml-1">Confirm Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                                <input
                                                    type="password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    placeholder="Repeat new password"
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner font-medium"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <FormActions
                                        isLoading={isLoading}
                                        error={error}
                                        success={success}
                                        buttonText="Reset Password"
                                        backLink="/login"
                                        backText="Cancel"
                                    />
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Slideshow */}
            <div className="hidden lg:block w-1/2 relative overflow-hidden z-10 h-screen">
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentImageIndex}
                        className="absolute inset-0 w-full h-full"
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                    >
                        <img
                            src={hotelImages[currentImageIndex]}
                            alt="Luxury Hotel"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#030014]/40 to-[#030014]"></div>
                    </motion.div>
                </AnimatePresence>

                <div className="absolute bottom-20 left-12 max-w-lg z-20">
                    <motion.h2 className="text-5xl font-bold text-white mb-4 leading-tight">
                        Secure Your <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Account</span> Access
                    </motion.h2>
                    <div className="flex gap-2 mt-6">
                        {hotelImages.map((_, idx) => (
                            <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-purple-500' : 'w-2 bg-white/30'}`} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const FormActions = ({ isLoading, error, success, buttonText, backLink, backText, onBack }) => (
    <>
        {error && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-200 text-sm text-center font-medium">
                {error}
            </motion.div>
        )}
        {success && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-200 text-sm text-center flex items-center justify-center gap-2 font-medium">
                <CheckCircle className="w-4 h-4" /> {success}
            </motion.div>
        )}

        <motion.button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#8400ff] hover:bg-[#7000d6] text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 group relative overflow-hidden"
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
        >
            <span className="relative z-10">{isLoading ? 'Processing...' : buttonText}</span>
            {!isLoading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
        </motion.button>

        <motion.div className="text-center pt-2">
            {backLink ? (
                <Link to={backLink} className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    {backText}
                </Link>
            ) : (
                <button type="button" onClick={onBack} className="inline-flex items-center text-sm text-gray-400 hover:text-white transition-colors group">
                    <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
                    {backText}
                </button>
            )}
        </motion.div>
    </>
);

export default ForgotPasswordPage;
