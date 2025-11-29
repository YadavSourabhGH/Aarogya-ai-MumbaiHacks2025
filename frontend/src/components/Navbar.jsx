import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Activity, LogOut, User, Menu, X, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import AnimatedButton from './ui/AnimatedButton';

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [hasPendingConsent, setHasPendingConsent] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);

        // Check user on mount and route change
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        setUser(userInfo);

        return () => window.removeEventListener('scroll', handleScroll);
    }, [location]);

    // Check for pending consent
    useEffect(() => {
        if (user) {
            checkPendingConsent();
            const interval = setInterval(checkPendingConsent, 10000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const checkPendingConsent = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (!userInfo) return;

            // Skip for simulation account
            if (userInfo.email === 'hospital@aarogya.com') return;

            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('https://aarogya-ai-personal.onrender.com/auth/user/me', config);

            if (data.pendingConsent && data.pendingConsent.status === 'pending') {
                setHasPendingConsent(true);
            } else {
                setHasPendingConsent(false);
            }
        } catch (error) {
            // Silently fail
        }
    };

    const logoutHandler = () => {
        localStorage.removeItem('userInfo');
        setUser(null);
        setHasPendingConsent(false);
        navigate('/login');
    };

    const isAuthPage = location.pathname === '/login' || location.pathname === '/signup';
    const isLoggedIn = !!user;

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 sm:px-6 lg:px-8 py-4",
                scrolled ? "glass shadow-sm py-2" : "bg-transparent"
            )}
        >
            <div className="max-w-7xl mx-auto flex justify-between items-center">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg text-white group-hover:shadow-lg group-hover:shadow-primary/30 transition-all duration-300">
                        <Activity className="h-6 w-6" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                        AarogyaAi
                    </span>
                </Link>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Consent Notification Bell */}
                    {isLoggedIn && hasPendingConsent && (
                        <Link
                            to="/consent"
                            className="relative p-2 text-gray-700 hover:text-primary transition-colors"
                            title="Pending consent request"
                        >
                            <Bell className="w-6 h-6" />
                            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                        </Link>
                    )}

                    {!isAuthPage && (
                        <>
                            {user ? (
                                <>
                                    <Link
                                        to={user.email === 'hospital@aarogya.com' ? '/federated-learning' : '/dashboard'}
                                        className="text-gray-600 hover:text-primary font-medium transition-colors"
                                    >
                                        Dashboard
                                    </Link>
                                    <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                                <User className="h-4 w-4" />
                                            </div>
                                            {user.name}
                                        </div>
                                        <button
                                            onClick={logoutHandler}
                                            className="text-gray-400 hover:text-red-500 transition-colors"
                                            title="Logout"
                                        >
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="text-gray-600 hover:text-primary font-medium transition-colors">
                                        Login
                                    </Link>
                                    <AnimatedButton onClick={() => navigate('/signup')} className="py-2 px-4 text-sm">
                                        Get Started
                                    </AnimatedButton>
                                </>
                            )}
                        </>
                    )}
                </div>

                {/* Mobile Menu Button */}
                <div className="md:hidden">
                    <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600 hover:text-primary">
                        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white border-t border-gray-100 mt-2 overflow-hidden"
                    >
                        <div className="flex flex-col p-4 space-y-4">
                            {user ? (
                                <>
                                    <Link
                                        to={user.email === 'hospital@aarogya.com' ? '/federated-learning' : '/dashboard'}
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="text-gray-600 font-medium"
                                    >
                                        Dashboard
                                    </Link>
                                    <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                        <span className="text-sm font-medium text-gray-700">{user.name}</span>
                                        <button onClick={() => { logoutHandler(); setMobileMenuOpen(false); }} className="text-red-500 text-sm font-medium">Logout</button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-gray-600 font-medium">Login</Link>
                                    <Link to="/signup" onClick={() => setMobileMenuOpen(false)} className="text-primary font-bold">Sign Up</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};

export default Navbar;
