import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
    return (
        <div className="min-h-screen bg-[#060010] flex flex-col">
            <Navbar />

            <div className="flex-grow flex flex-col items-center justify-center px-4 text-center">
                <h1 className="text-9xl font-bold text-[#a855f7] mb-4">404</h1>
                <h2 className="text-3xl font-bold text-white mb-4">Page Not Found</h2>
                <p className="text-gray-300 mb-8 max-w-md">
                    The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
                </p>
                <Link
                    to="/"
                    className="px-8 py-3 bg-gradient-to-r from-[#6366f1] via-[#a855f7] to-[#ec4899] text-white rounded-lg font-semibold hover:scale-105 transition-all shadow-lg shadow-[#a855f7]/20"
                >
                    Go Home
                </Link>
            </div>

            <Footer />
        </div>
    );
};

export default NotFound;

