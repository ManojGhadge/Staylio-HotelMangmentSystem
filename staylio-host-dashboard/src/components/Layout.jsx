import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DotBackground } from './DotBackground';
import Dock from './Dock';
import {
    LayoutDashboard,
    Building2,
    CalendarCheck,
    BarChart3,
    User,
    LogOut,
    Search,
    ClipboardList,
    ChevronDown,
    ChevronUp,
    Wallet
} from 'lucide-react';

const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const [isDockVisible, setIsDockVisible] = useState(true);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/my-hotels', label: 'My Hotels', icon: Building2 },
        { path: '/bookings', label: 'Bookings', icon: CalendarCheck },
        { path: '/wallet', label: 'Wallet & Earnings', icon: Wallet },
        { path: '/claim-hotel', label: 'Claim Hotel', icon: Search },
        { path: '/my-claims', label: 'My Claims', icon: ClipboardList },
        { path: '/analytics', label: 'Analytics', icon: BarChart3 },
        { path: '/profile', label: 'Profile', icon: User },
    ];

    const dockItems = [
        ...navItems.map(item => {
            if (item.label === 'Profile') {
                return {
                    icon: (
                        <lord-icon
                            src="https://cdn.lordicon.com/kdduutaw.json"
                            trigger="hover"
                            colors={`primary:${location.pathname === item.path ? '#a855f7' : '#9ca3af'},secondary:${location.pathname === item.path ? '#a855f7' : '#9ca3af'}`}
                            style={{ width: '24px', height: '24px' }}
                        ></lord-icon>
                    ),
                    label: item.label,
                    onClick: () => navigate(item.path)
                };
            }
            return {
                icon: <item.icon size={20} className={location.pathname === item.path ? "text-[#a855f7]" : "text-gray-400"} />,
                label: item.label,
                onClick: () => navigate(item.path)
            };
        }),
        {
            icon: <LogOut size={20} className="text-red-400" />,
            label: 'Logout',
            onClick: handleLogout
        }
    ];

    return (
        <DotBackground>
            <div className="flex min-h-screen flex-col relative">
                {/* Main Content */}
                <div className="flex-1 flex flex-col min-w-0 overflow-hidden pb-24">
                    {/* Header with Logo */}
                    <header className="bg-transparent p-6 flex justify-between items-center">
                        <div className="flex items-center">
                            <span className="text-2xl font-bold text-[#8400ff]">StayLio</span>
                            <span className="ml-2 text-xs font-medium text-gray-400 bg-white/5 px-2 py-1 rounded border border-white/10">HOST</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">
                                    {user?.name || 'Host'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user?.email}
                                </p>
                            </div>
                            <div className="h-10 w-10 rounded-full bg-[#8400ff]/20 flex items-center justify-center text-[#a855f7] font-bold border border-[#8400ff]/30">
                                {user?.name?.[0] || 'H'}
                            </div>
                        </div>
                    </header>

                    {/* Page Content */}
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>

                {/* Dock Visibility Toggle */}
                <button
                    onClick={() => setIsDockVisible(!isDockVisible)}
                    className="fixed bottom-6 right-6 z-50 p-3 rounded-full bg-[#1e293b] text-gray-400 hover:text-white border border-white/10 shadow-lg transition-all hover:bg-[#8400ff]/20 hover:border-[#8400ff]/30 backdrop-blur-sm group"
                    title={isDockVisible ? "Hide Navigation" : "Show Navigation"}
                >
                    {isDockVisible ? (
                        <ChevronDown size={20} className="group-hover:text-[#a855f7] transition-colors" />
                    ) : (
                        <ChevronUp size={20} className="group-hover:text-[#a855f7] transition-colors" />
                    )}
                </button>

                {/* Dock Navigation */}
                <div className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none transition-all duration-300 transform ${isDockVisible ? 'translate-y-0 opacity-100' : 'translate-y-[150%] opacity-0'
                    }`}>
                    <div className="pointer-events-auto">
                        <Dock
                            items={dockItems}
                            panelHeight={68}
                            baseItemSize={50}
                            magnification={70}
                        />
                    </div>
                </div>
            </div>
        </DotBackground>
    );
};

export default Layout;
