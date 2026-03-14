import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Demo users for login
    const demoUsers = {
        admin: {
            id: 1,
            name: 'Admin User',
            email: 'admin@staylio.com',
            role: 'admin',
            phone: '+1234567890'
        },
        host: {
            id: 2,
            name: 'Host Manager',
            email: 'host@staylio.com',
            role: 'host',
            phone: '+1234567891',
            companyName: 'Demo Hotels Ltd',
            status: 'APPROVED',
            hostname: 'demo-host'
        }
    };

    useEffect(() => {
        // Check if user is already logged in (from localStorage)
        const savedUser = localStorage.getItem('staylio_user');
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            // Try demo admin login first
            if (email === 'admin@staylio.com' && password === 'admin123') {
                const userData = demoUsers.admin;
                setUser(userData);
                localStorage.setItem('staylio_user', JSON.stringify(userData));
                return userData;
            }
            
            // Try host login via API
            const response = await fetch('http://localhost:8080/api/auth/login-host', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            
            const result = await response.json();
            
            if (result.success) {
                const userData = {
                    id: result.user.id,
                    name: result.user.name,
                    email: result.user.email,
                    phone: result.user.phone,
                    role: result.user.role,
                    companyName: result.user.companyName,
                    status: result.user.status
                };
                setUser(userData);
                localStorage.setItem('staylio_user', JSON.stringify(userData));
                return userData;
            } else {
                throw new Error(result.message);
            }
        } catch (error) {
            throw new Error(error.message || 'Login failed');
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('staylio_user');
    };

    const value = {
        user,
        login,
        logout,
        loading,
        isAdmin: user?.role === 'admin',
        isHost: user?.role === 'host',
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};