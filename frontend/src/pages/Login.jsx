import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader } from 'lucide-react';
import AnimatedButton from '../components/ui/AnimatedButton';

const Login = () => {
    const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'
    const [step, setStep] = useState(1); // 1: Email/Input, 2: OTP Verify
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [timer, setTimer] = useState(0);
    const navigate = useNavigate();

    React.useEffect(() => {
        let interval;
        if (timer > 0) {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer]);

    const handleSendOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await axios.post('https://aarogya-ai-personal.onrender.com/auth/send-otp', { email });
            setStep(2);
            setTimer(30);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const { data } = await axios.post('https://aarogya-ai-personal.onrender.com/auth/verify-otp', { email, otp });

            if (data.valid && !data.isNewUser) {
                localStorage.setItem('userInfo', JSON.stringify(data));
                // Redirect based on role
                if (data.role === 'doctor') {
                    navigate('/aarogya-ai/search');
                } else {
                    navigate('/dashboard');
                }
            } else if (data.isNewUser) {
                // If user doesn't exist, redirect to signup or show error
                // For now, let's show error as this is Login page
                setError('Account not found. Please sign up.');
            } else {
                setError('Invalid OTP');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Verification failed');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Simulation Account Bypass
        if (email === 'hospital@aarogya.com') {
            localStorage.setItem('userInfo', JSON.stringify({
                name: 'Hospital Admin',
                email: 'hospital@aarogya.com',
                role: 'hospital',
                token: 'simulation-token'
            }));
            setLoading(false);
            navigate('/federated-learning');
            return;
        }

        try {
            const { data } = await axios.post('https://aarogya-ai-personal.onrender.com/auth/login', {
                email,
                password,
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            // Redirect based on role
            if (data.role === 'doctor') {
                navigate('/aarogya-ai/search');
            } else if (email === 'hospital@aarogya.com') {
                navigate('/federated-learning');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '3s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass p-8 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
                        <p className="text-gray-500">Sign in to access your health dashboard</p>

                        {/* Login Method Toggle */}
                        <div className="flex bg-gray-100 p-1 rounded-xl mt-6">
                            <button
                                onClick={() => { setLoginMethod('password'); setStep(1); setError(''); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'password' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                Password
                            </button>
                            <button
                                onClick={() => { setLoginMethod('otp'); setStep(1); setError(''); }}
                                className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${loginMethod === 'otp' ? 'bg-white shadow-sm text-primary' : 'text-gray-500 hover:text-gray-700'}`}
                            >
                                OTP Login
                            </button>
                        </div>
                    </div>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="bg-red-50 text-red-600 p-3 rounded-xl text-sm mb-6 flex items-center justify-center"
                        >
                            {error}
                        </motion.div>
                    )}

                    {loginMethod === 'password' ? (
                        <form onSubmit={handlePasswordLogin} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                    />
                                </div>
                            </div>

                            <AnimatedButton type="submit" className="w-full" disabled={loading}>
                                {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Sign In <ArrowRight className="h-5 w-5" /></>}
                            </AnimatedButton>
                        </form>
                    ) : (
                        // OTP Login Flow
                        <div className="space-y-6">
                            {step === 1 ? (
                                <form onSubmit={handleSendOtp} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="email"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50"
                                                placeholder="name@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <AnimatedButton type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Send OTP <ArrowRight className="h-5 w-5" /></>}
                                    </AnimatedButton>
                                </form>
                            ) : (
                                <form onSubmit={handleVerifyOtp} className="space-y-6">
                                    <div className="text-center mb-4">
                                        <p className="text-sm text-gray-600">We sent a code to <span className="font-semibold text-gray-900">{email}</span></p>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-700 ml-1">Enter OTP</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50 tracking-widest text-center text-lg font-bold"
                                                placeholder="123456"
                                                maxLength={6}
                                                value={otp}
                                                onChange={(e) => setOtp(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <AnimatedButton type="submit" className="w-full" disabled={loading}>
                                        {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Verify & Login <ArrowRight className="h-5 w-5" /></>}
                                    </AnimatedButton>

                                    <div className="flex flex-col items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSendOtp}
                                            disabled={timer > 0 || loading}
                                            className={`text-sm font-medium ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-secondary'}`}
                                        >
                                            {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                        </button>
                                        <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-primary">
                                            Change Email
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Don't have an account?{' '}
                            <Link to="/signup" className="font-bold text-primary hover:text-secondary transition-colors">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
