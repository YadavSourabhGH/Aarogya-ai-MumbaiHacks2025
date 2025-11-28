import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, ArrowRight, Loader, CheckCircle } from 'lucide-react';
import AnimatedButton from '../components/ui/AnimatedButton';

const Signup = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState('patient');
    const [signupToken, setSignupToken] = useState('');
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

    const sendOtpHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post('http://localhost:4000/auth/send-otp', { email });
            setStep(2);
            setTimer(30); // Start 30s cooldown
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const resendOtpHandler = async () => {
        setLoading(true);
        try {
            await axios.post('http://localhost:4000/auth/send-otp', { email });
            setTimer(30);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
        } finally {
            setLoading(false);
        }
    };

    const verifyOtpHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:4000/auth/verify-otp', { email, otp });
            setSignupToken(data.signupToken);
            setStep(3);
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    const signupHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:4000/auth/signup', {
                name,
                email,
                password,
                role,
                signupToken,
            });
            localStorage.setItem('userInfo', JSON.stringify(data));
            // Redirect based on role
            if (data.role === 'doctor') {
                navigate('/curesight/search');
            } else {
                navigate('/dashboard');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Signup failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-secondary/10 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="glass p-8 rounded-3xl shadow-2xl">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h2>
                        <p className="text-gray-500">Join AarogyaAi for early detection</p>

                        {/* Progress Steps */}
                        <div className="flex justify-center items-center gap-2 mt-6">
                            {[1, 2, 3].map((s) => (
                                <div key={s} className={`h-2 rounded-full transition-all duration-300 ${s <= step ? 'w-8 bg-primary' : 'w-2 bg-gray-200'}`} />
                            ))}
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

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.form
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={sendOtpHandler}
                                className="space-y-6"
                            >
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
                            </motion.form>
                        )}

                        {step === 2 && (
                            <motion.form
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={verifyOtpHandler}
                                className="space-y-6"
                            >
                                <div className="text-center mb-4">
                                    <p className="text-sm text-gray-600">We sent a code to <span className="font-semibold text-gray-900">{email}</span></p>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Enter OTP</label>
                                    <div className="relative">
                                        <CheckCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
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
                                    {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Verify OTP <ArrowRight className="h-5 w-5" /></>}
                                </AnimatedButton>

                                <div className="flex flex-col items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={resendOtpHandler}
                                        disabled={timer > 0 || loading}
                                        className={`text-sm font-medium ${timer > 0 ? 'text-gray-400 cursor-not-allowed' : 'text-primary hover:text-secondary'}`}
                                    >
                                        {timer > 0 ? `Resend OTP in ${timer}s` : 'Resend OTP'}
                                    </button>
                                    <button type="button" onClick={() => setStep(1)} className="text-sm text-gray-500 hover:text-primary">
                                        Change Email
                                    </button>
                                </div>
                            </motion.form>
                        )}

                        {step === 3 && (
                            <motion.form
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                onSubmit={signupHandler}
                                className="space-y-6"
                            >
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Full Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                        <input
                                            type="text"
                                            required
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/50"
                                            placeholder="John Doe"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">I am a</label>
                                    <div className="flex gap-4">
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="patient"
                                                checked={role === 'patient'}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="sr-only peer"
                                            />
                                            <div className="px-4 py-3 rounded-xl border-2 border-gray-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-center font-medium">
                                                Patient
                                            </div>
                                        </label>
                                        <label className="flex-1 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="role"
                                                value="doctor"
                                                checked={role === 'doctor'}
                                                onChange={(e) => setRole(e.target.value)}
                                                className="sr-only peer"
                                            />
                                            <div className="px-4 py-3 rounded-xl border-2 border-gray-200 peer-checked:border-primary peer-checked:bg-primary/5 transition-all text-center font-medium">
                                                Doctor
                                            </div>
                                        </label>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-700 ml-1">Create Password</label>
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
                                    {loading ? <Loader className="animate-spin h-5 w-5" /> : <>Complete Signup <ArrowRight className="h-5 w-5" /></>}
                                </AnimatedButton>
                            </motion.form>
                        )}
                    </AnimatePresence>

                    <div className="mt-8 text-center">
                        <p className="text-gray-600">
                            Already have an account?{' '}
                            <Link to="/login" className="font-bold text-primary hover:text-secondary transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Signup;
