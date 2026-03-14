import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in - check both old and new storage keys
    const storedUser = localStorage.getItem('adminData') || localStorage.getItem('adminUser');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error('Error parsing stored user:', e);
        localStorage.removeItem('adminData');
        localStorage.removeItem('adminUser');
      }
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // This is called from LoginPage after successful backend authentication
    // The LoginPage already stores adminData in localStorage
    // So we just need to update the state
    const storedUser = localStorage.getItem('adminData');
    if (storedUser) {
      try {
        const adminUser = JSON.parse(storedUser);
        setUser(adminUser);
        return { success: true };
      } catch (e) {
        console.error('Error parsing admin data:', e);
        return { success: false, error: 'Invalid user data' };
      }
    }
    
    // Fallback for old authentication (backward compatibility)
    if (email === 'admin@staylio.com' && password === 'admin123') {
      const adminUser = {
        id: 1,
        name: 'Admin User',
        email: 'admin@staylio.com',
        role: 'admin'
      };
      setUser(adminUser);
      localStorage.setItem('adminData', JSON.stringify(adminUser));
      return { success: true };
    }
    
    return { success: false, error: 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('adminData');
    localStorage.removeItem('adminUser'); // Remove old key too
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
