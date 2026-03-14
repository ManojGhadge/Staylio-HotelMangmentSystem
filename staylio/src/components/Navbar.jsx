import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const needsSolidBackground = location.pathname === '/hotels' || location.pathname.startsWith('/hotels/') || location.pathname === '/auth' || location.pathname === '/about' || location.pathname === '/contact';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthRedirect = (mode) => {
    if (mode === 'login') {
      navigate('/login');
    } else {
      navigate('/register');
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    setShowUserMenu(false);
    setIsOpen(false);
    navigate('/');
  };

  const navLinks = [
    { name: 'Home', href: '#hero', route: '/' },
    { name: 'About', href: '#about', route: '/about' },
    { name: 'Hotels', href: '#hotels', route: '/hotels' },
    { name: 'Contact', href: '#contact', route: '/contact' }
  ];

  const handleNavClick = (e, href, linkName, route) => {
    e.preventDefault();

    if (linkName === 'Hotels') {
      navigate('/hotels');
      setIsOpen(false);
      return;
    }

    if (linkName === 'About') {
      navigate('/about');
      setIsOpen(false);
      return;
    }

    if (linkName === 'Contact') {
      navigate('/contact');
      setIsOpen(false);
      return;
    }

    if (linkName === 'Home') {
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      setIsOpen(false);
      return;
    }

    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => {
        const targetId = href.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          const navbarHeight = 72;
          const targetPosition = targetElement.offsetTop - navbarHeight;
          window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
      }, 100);
    } else {
      const targetId = href.substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        const navbarHeight = 72;
        const targetPosition = targetElement.offsetTop - navbarHeight;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    }
    setIsOpen(false);
  };

  return (
    <nav className={`fixed w-full z-50 transition-all duration-500 ease-out ${needsSolidBackground
      ? 'bg-[#060010]/90 backdrop-blur-3xl shadow-2xl border-b border-[#8400ff]/20'
      : isScrolled
        ? 'bg-[#060010]/80 backdrop-blur-3xl shadow-2xl border-b border-[#8400ff]/10'
        : 'bg-[#060010]/60 backdrop-blur-2xl border-b border-[#8400ff]/5'
      }`}>
      {/* Animated Particles Background */}
      {!needsSolidBackground && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(15)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-[#a855f7]/30 rounded-full"
              style={{
                left: `${(i * 7) % 100}%`,
                top: `${(i * 13) % 100}%`,
              }}
              animate={{
                x: [0, Math.random() * 100 - 50, 0],
                y: [0, Math.random() * 50 - 25, 0],
                opacity: [0.2, 0.6, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 5 + Math.random() * 5,
                repeat: Infinity,
                delay: Math.random() * 2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          {/* Enhanced Logo */}
          <Link to="/" className="flex-shrink-0 flex items-center space-x-3 transform hover:scale-110 transition-all duration-500 cursor-pointer group relative font-['Inter']">
            <div className="relative">
              <motion.div
                className="w-12 h-12 bg-gradient-to-br from-[#8400ff] to-[#3b0764] rounded-2xl flex items-center justify-center shadow-2xl group-hover:shadow-[#8400ff]/50 transition-all duration-500"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-white/20 -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <svg className="w-7 h-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </motion.div>
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-[#a855f7] rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>

            <div className="relative">
              <h1 className="text-2xl font-bold transition-all duration-500 text-white group-hover:text-[#a855f7]">
                Staylio
              </h1>
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-[#8400ff] to-[#a855f7] group-hover:w-full transition-all duration-500"></div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-2">
              {navLinks.map((link, index) => (
                <motion.a
                  key={link.name}
                  href={link.href}
                  onClick={(e) => handleNavClick(e, link.href, link.name, link.route)}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -2 }}
                  className="relative px-5 py-3 text-sm font-semibold transition-all duration-300 group rounded-xl cursor-pointer overflow-hidden text-white/90 hover:text-[#a855f7]"
                >
                  <div className="absolute inset-0 rounded-xl transition-all duration-300 transform scale-0 group-hover:scale-100 bg-white/5 backdrop-blur-sm"></div>
                  <span className="relative flex items-center space-x-2">
                    <span>{link.name}</span>
                    <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transform translate-x-0 group-hover:translate-x-1 transition-all duration-300 text-[#a855f7]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-0 h-1 bg-gradient-to-r from-[#8400ff] to-[#a855f7] transition-all duration-300 group-hover:w-8 rounded-full"></div>
                </motion.a>
              ))}
            </div>
          </div>

          {/* Right Side Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <motion.button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-4 py-3 text-sm font-semibold transition-all duration-300 rounded-xl border-2 overflow-hidden text-white border-[#8400ff]/30 hover:border-[#8400ff] flex items-center space-x-3"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-[#8400ff] to-[#a855f7] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
                  </div>
                  <span className="hidden lg:block">Hi, {user?.firstName}</span>
                  <motion.svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    animate={{ rotate: showUserMenu ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </motion.svg>
                </motion.button>

                {showUserMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-64 bg-[#060010] backdrop-blur-xl rounded-xl shadow-2xl border border-[#8400ff]/20 py-2 z-50"
                  >
                    <div className="px-4 py-3 border-b border-[#8400ff]/10">
                      <p className="text-sm font-semibold text-white">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
                      <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={() => {
                          navigate('/dashboard');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#8400ff]/10 hover:text-white flex items-center space-x-3 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span>Dashboard</span>
                      </button>

                      <button
                        onClick={() => {
                          navigate('/wallet');
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-[#8400ff]/10 hover:text-white flex items-center space-x-3 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        <span>My Wallet</span>
                      </button>
                      <div className="border-t border-[#8400ff]/10 mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 flex items-center space-x-3 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign Out</span>
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            ) : (
              <>
                <motion.button
                  onClick={() => handleAuthRedirect('login')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-6 py-3 text-sm font-semibold transition-all duration-300 rounded-xl border-2 overflow-hidden text-[#a855f7] border-[#8400ff] hover:text-white hover:shadow-[0_0_10px_#8400ff]"
                >
                  <span className="relative flex items-center space-x-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Sign In</span>
                  </span>
                </motion.button>

                <motion.button
                  onClick={() => handleAuthRedirect('signup')}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-[#8400ff] hover:bg-[#7000d6] text-white px-7 py-3 rounded-xl font-semibold transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_#a855f7] flex items-center space-x-2 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative flex items-center space-x-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span>Sign Up</span>
                  </div>
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              whileTap={{ scale: 0.95 }}
              className="group relative p-3 rounded-2xl transition-all duration-300 hover:bg-white/10 text-white backdrop-blur-sm"
            >
              <div className="relative w-6 h-6 flex flex-col justify-center items-center">
                <motion.span
                  className="block w-6 h-0.5 bg-current transition-all duration-300"
                  animate={{
                    rotate: isOpen ? 45 : 0,
                    y: isOpen ? 0 : -4,
                  }}
                />
                <motion.span
                  className="block w-6 h-0.5 bg-current transition-all duration-300"
                  animate={{
                    opacity: isOpen ? 0 : 1,
                  }}
                />
                <motion.span
                  className="block w-6 h-0.5 bg-current transition-all duration-300"
                  animate={{
                    rotate: isOpen ? -45 : 0,
                    y: isOpen ? -2 : 4,
                  }}
                />
              </div>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <motion.div
        initial={false}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden bg-[#060010]/95 backdrop-blur-2xl border-t border-[#8400ff]/20 shadow-lg"
      >
        <div className="px-4 pt-4 pb-6 space-y-2">
          {navLinks.map((link, index) => (
            <motion.a
              key={link.name}
              href={link.href}
              onClick={(e) => handleNavClick(e, link.href, link.name, link.route)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: isOpen ? 1 : 0, x: isOpen ? 0 : -20 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="block px-4 py-3 text-gray-300 hover:text-[#a855f7] text-base font-medium transition-all duration-300 rounded-xl hover:bg-[#8400ff]/10 cursor-pointer"
            >
              {link.name}
            </motion.a>
          ))}
          <div className="pt-4 pb-2 border-t border-[#8400ff]/20 space-y-3">
            {!isAuthenticated && (
              <>
                <button
                  onClick={() => handleAuthRedirect('login')}
                  className="block w-full text-left px-4 py-3 text-gray-300 hover:text-[#a855f7] text-base font-medium rounded-xl hover:bg-[#8400ff]/10 transition-all duration-300"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleAuthRedirect('signup')}
                  className="w-full bg-[#8400ff] hover:bg-[#7000d6] text-white px-4 py-3 rounded-xl font-medium transition-all duration-300 shadow-lg hover:shadow-[0_0_20px_#a855f7]"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>
    </nav>
  );
};

export default Navbar;
