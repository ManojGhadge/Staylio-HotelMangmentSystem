import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import { motion, useMotionValue, useTransform, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    // Get the page user was trying to access before login
    const from = location.state?.from?.pathname || '/dashboard';
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [successMessage, setSuccessMessage] = useState('');

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const newValue = type === 'checkbox' ? checked : value;

        setFormData(prev => ({
            ...prev,
            [name]: newValue
        }));

        // Clear errors when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);
        setErrors({});
        setSuccessMessage('');

        try {
            const response = await authService.login({
                email: formData.email,
                password: formData.password
            });

            if (response.success) {
                setSuccessMessage('Login successful! Redirecting...');

                // If user data is returned, store it
                if (response.user) {
                    login(response.user);
                    setTimeout(() => navigate(from, { replace: true }), 1500);
                } else {
                    // Try to fetch user data manually if not included in response
                    try {
                        const userResponse = await fetch(`http://localhost:8080/api/users/email/${encodeURIComponent(formData.email)}`);
                        if (userResponse.ok) {
                            const userData = await userResponse.json();
                            login(userData);
                            setTimeout(() => navigate(from, { replace: true }), 1500);
                        } else {
                            setErrors({ general: 'Login successful but failed to get user details. Please try again.' });
                        }
                    } catch (fetchError) {
                        setErrors({ general: 'Login successful but failed to get user details. Please try again.' });
                    }
                }
            } else {
                setErrors({ general: 'Login failed. Please try again.' });
            }
        } catch (error) {
            setErrors({ general: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    // Parallax Logic
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const layer1X = useTransform(x, [-100, 100], [-20, 20]);
    const layer1Y = useTransform(y, [-100, 100], [-20, 20]);
    const layer2X = useTransform(x, [-100, 100], [15, -15]);
    const layer2Y = useTransform(y, [-100, 100], [15, -15]);
    const cardX = useTransform(x, [-100, 100], [-5, 5]);
    const cardY = useTransform(y, [-100, 100], [-5, 5]);

    const handleMouseMove = (event) => {
        // Normalize mouse position (-100 to 100)
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

                {/* Background Effects for Left Side */}
                <motion.div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" style={{ x: layer1X, y: layer1Y }}>
                    <div className="absolute top-[-20%] right-[20%] w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[100px] mix-blend-screen animate-pulse"></div>
                    <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[80px] mix-blend-screen"></div>
                </motion.div>

                {/* Form Container */}
                <motion.div
                    className="w-full max-w-md bg-[#13111C]/80 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-2xl p-8 relative overflow-hidden z-10 mt-24 mb-12"
                    style={{ x: cardX, y: cardY }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Inner Shine */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none"></div>

                    <div className="relative z-10">
                        <div className="text-center mb-8">
                            <motion.h1
                                className="text-4xl font-bold text-white mb-2"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                Welcome Back
                            </motion.h1>
                            <motion.p
                                className="text-purple-200/60 font-light"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                Sign in to continue to StayLio
                            </motion.p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
                                <label className="text-sm font-semibold text-gray-400 ml-1">Email</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="name@example.com"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner font-medium"
                                    />
                                </div>
                                {errors.email && <p className="text-red-400 text-xs ml-1">{errors.email}</p>}
                            </motion.div>

                            <motion.div className="space-y-2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}>
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold text-gray-400">Password</label>
                                    <Link to="/forgot-password" className="text-xs text-purple-400 hover:text-purple-300 transition-colors font-medium">Forgot?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-purple-400 transition-colors w-5 h-5" />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-12 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all shadow-inner font-medium"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                {errors.password && <p className="text-red-400 text-xs ml-1">{errors.password}</p>}
                            </motion.div>

                            {errors.general && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 text-red-200 text-sm text-center font-medium">
                                    {errors.general}
                                </motion.div>
                            )}

                            {successMessage && (
                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 text-green-200 text-sm text-center font-medium">
                                    {successMessage}
                                </motion.div>
                            )}

                            <motion.button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#8400ff] hover:bg-[#7000d6] text-white font-bold py-4 rounded-2xl shadow-lg shadow-purple-500/20 transition-all flex items-center justify-center space-x-2 group relative overflow-hidden"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 }}
                            >
                                <span className="relative z-10">{isLoading ? 'Signing In...' : 'Sign In'}</span>
                                {!isLoading && <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />}
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                            </motion.button>

                            <motion.p className="text-center text-gray-400 text-sm mt-8" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
                                Don't have an account?{' '}
                                <Link to="/register" className="text-white font-semibold hover:text-purple-300 transition-colors">
                                    Register
                                </Link>
                            </motion.p>
                        </form>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Image Slideshow Section */}
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

                {/* Floating Content over Image */}
                <div className="absolute bottom-20 left-12 max-w-lg z-20">
                    <motion.h2
                        className="text-5xl font-bold text-white mb-4 leading-tight"
                        key={`text-${currentImageIndex}`}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.8 }}
                    >
                        Experience <br />
                        Extraordinary Stays
                    </motion.h2>
                    <motion.p
                        className="text-lg text-gray-300/90"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        Discover verified hotels and comfortable stays across selected cities with StayLio.                    </motion.p>

                    {/* Slide Indicators */}
                    <div className="flex gap-2 mt-6">
                        {hotelImages.map((_, idx) => (
                            <div
                                key={idx}
                                className={`h-1 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'w-8 bg-purple-500' : 'w-2 bg-white/30'}`}
                            />
                        ))}
                    </div>
                </div>
            </div>

            <style>{`
                .animate-spin-slow {
                    animation: spin 20s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LoginPage;
