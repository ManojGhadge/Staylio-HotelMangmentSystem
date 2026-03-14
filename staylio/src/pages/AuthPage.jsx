import React from 'react';
import { Link } from 'react-router-dom';

const AuthPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#060010] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 text-center">
                <div>
                    <h2 className="mt-6 text-3xl font-extrabold text-white">
                        Welcome to Staylio
                    </h2>
                    <p className="mt-2 text-sm text-gray-300">
                        Sign in to your account or create a new one
                    </p>
                </div>
                <div className="mt-8 space-y-4">
                    <Link
                        to="/login"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg shadow-[#a855f7]/20 text-sm font-medium text-white bg-[#8400ff] hover:bg-[#7000d6] hover:scale-105 transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8400ff]"
                    >
                        Sign In
                    </Link>
                    <Link
                        to="/register"
                        className="w-full flex justify-center py-3 px-4 border border-white/10 rounded-xl shadow-sm text-sm font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#8400ff]"
                    >
                        Create Account
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;

