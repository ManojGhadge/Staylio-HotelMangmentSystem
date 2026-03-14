import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Home,
    Users,
    Building2,
    Hotel,
    ClipboardList,
    Settings,
    LogOut,
    Shield,
    Search,
    Wallet,
    ChevronRight,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

// ...

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { path: '/dashboard', label: 'Dashboard', icon: Home },
        { path: '/hosts', label: 'Host Management', icon: Building2 },
        { path: '/users', label: 'User Management', icon: Users },
        { path: '/hotels', label: 'Hotels', icon: Hotel },
        { path: '/hotel-claims', label: 'Claims', icon: ClipboardList },
        { path: '/wallet', label: 'Wallet & Escrow', icon: Wallet },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <motion.div
            animate={{ width: collapsed ? 80 : 280 }}
            className="h-screen sticky top-0 flex flex-col bg-[#0f172a]/90 backdrop-blur-xl border-r border-white/10 shadow-2xl z-50 text-white transition-all duration-300"
        >
            {/* Logo Area */}
            <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 ring-1 ring-white/10">
                        <Shield className="w-6 h-6 text-white" />
                    </div>
                    {!collapsed && (
                        <motion.div
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex flex-col"
                        >
                            <span className="font-bold text-lg tracking-tight">StayLio</span>
                            <span className="text-[10px] text-blue-200/60 uppercase tracking-wider font-semibold">Admin Panel</span>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-6 px-3 space-y-2 custom-scrollbar">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={`w-full group relative flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-300 ${isActive
                                ? 'bg-blue-600/10 text-white shadow-[0_0_20px_rgba(37,99,235,0.15)] ring-1 ring-blue-500/20'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeSideNav"
                                    className="absolute left-0 w-1 h-8 bg-blue-500 rounded-r-full"
                                />
                            )}

                            <div className={`relative flex items-center justify-center w-6 h-6 ${isActive ? 'text-blue-400' : 'text-current'}`}>
                                <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                            </div>

                            {!collapsed && (
                                <span className={`text-sm font-medium ${isActive ? 'text-blue-100' : ''}`}>
                                    {item.label}
                                </span>
                            )}

                            {/* Hover Tooltip for Collapsed */}
                            {collapsed && (
                                <div className="absolute left-full ml-4 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none border border-white/10">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Logout / User Config */}
            <div className="p-4 border-t border-white/5 bg-black/10">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all group"
                >
                    <LogOut size={20} className="group-hover:scale-110 transition-transform" />
                    {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
                </button>
            </div>

            {/* Collapse Toggle */}
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="absolute -right-3 top-20 w-6 h-6 bg-[#1e293b] border border-white/10 rounded-full flex items-center justify-center text-gray-400 hover:text-white shadow-lg cursor-pointer z-50 hover:scale-110 transition-all"
            >
                <ChevronRight size={14} className={`transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
            </button>
        </motion.div>
    );
};

export default Sidebar;
