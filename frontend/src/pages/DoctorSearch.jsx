import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, CheckCircle, XCircle, Loader2, Activity } from 'lucide-react';

const DoctorSearch = () => {
    const [abhaId, setAbhaId] = useState('');
    const [validating, setValidating] = useState(false);
    const [validation, setValidation] = useState(null);
    const navigate = useNavigate();

    // Check authentication on mount
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            // Redirect to login if not authenticated
            navigate('/login', { state: { from: '/curesight/search' } });
        }
    }, [navigate]);

    const handleSearch = async (value) => {
        setAbhaId(value);
        setValidation(null);

        if (!value || value.length < 5) {
            return;
        }

        setValidating(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            if (!userInfo || !userInfo.token) {
                navigate('/login', { state: { from: '/curesight/search' } });
                return;
            }

            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`http://localhost:4000/abha/verify/${value}`, config);

            setValidation(data);

            // Auto-advance to consent flow if valid
            if (data.valid && data.registered) {
                setTimeout(() => {
                    navigate('/curesight/consent', { state: { abhaId: value } });
                }, 1500);
            }

        } catch (error) {
            console.error('Verification error:', error);
            setValidation({
                valid: false,
                message: 'Error verifying ABHA ID. Please try again.'
            });
        } finally {
            setValidating(false);
        }
    };

    return (
        <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-20 left-20 w-72 h-72 bg-medical-blue/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-20 w-96 h-96 bg-medical-teal/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-medical-purple/5 rounded-full blur-3xl"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4">
                {/* Logo/Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-12"
                >
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Activity className="w-12 h-12 text-medical-blue" strokeWidth={2.5} />
                        <h1 className="text-5xl font-bold text-gradient">CureSight AI</h1>
                    </div>
                    <p className="text-xl text-gray-600 font-medium">Advanced Cancer Screening Platform</p>
                    <p className="text-sm text-gray-500 mt-2">Powered by ABDM & Multi-Modal AI Analysis</p>
                </motion.div>

                {/* Search Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="w-full max-w-2xl"
                >
                    <div className="glass rounded-3xl shadow-2xl p-8 md:p-12">
                        <h2 className="text-2xl font-bold text-gray-800 mb-2 text-center">
                            Patient Search
                        </h2>
                        <p className="text-gray-600 text-center mb-8">
                            Enter patient's ABHA ID to begin screening
                        </p>

                        {/* Search Input */}
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
                                <Search className="h-6 w-6 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                value={abhaId}
                                onChange={(e) => handleSearch(e.target.value)}
                                placeholder="ramesh@abdm"
                                className="w-full pl-16 pr-16 py-5 text-lg rounded-2xl border-2 border-gray-200 focus:border-medical-blue focus:ring-4 focus:ring-medical-blue/20 outline-none transition-all duration-300 bg-white"
                            />
                            {/* Status Indicator */}
                            <div className="absolute inset-y-0 right-0 pr-6 flex items-center">
                                {validating && (
                                    <Loader2 className="h-6 w-6 text-medical-blue animate-spin" />
                                )}
                                {!validating && validation?.valid && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <CheckCircle className="h-6 w-6 text-green-500" />
                                    </motion.div>
                                )}
                                {!validating && validation && !validation.valid && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                        <XCircle className="h-6 w-6 text-red-500" />
                                    </motion.div>
                                )}
                            </div>
                        </div>

                        {/* Validation Message */}
                        {validation && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-4 p-4 rounded-xl ${validation.valid
                                    ? 'bg-green-50 border border-green-200'
                                    : 'bg-red-50 border border-red-200'
                                    }`}
                            >
                                <p className={`text-sm font-medium ${validation.valid ? 'text-green-800' : 'text-red-800'
                                    }`}>
                                    {validation.message}
                                </p>
                                {validation.valid && validation.registered && (
                                    <p className="text-xs text-green-600 mt-1">
                                        ✓ Redirecting to consent flow...
                                    </p>
                                )}
                                {!validation.valid && validation.suggestion && (
                                    <p className="text-xs text-gray-600 mt-2">
                                        {validation.suggestion}
                                    </p>
                                )}
                            </motion.div>
                        )}

                        {/* Example IDs */}
                        <div className="mt-8 pt-6 border-t border-gray-200">
                            <p className="text-sm text-gray-500 mb-3">Demo ABHA IDs:</p>
                            <div className="flex flex-wrap gap-2">
                                {['ramesh@abdm', 'priya@abdm', 'amit@abdm'].map((id) => (
                                    <button
                                        key={id}
                                        onClick={() => handleSearch(id)}
                                        className="px-4 py-2 text-sm bg-gray-100 hover:bg-medical-blue hover:text-white rounded-lg transition-colors duration-200"
                                    >
                                        {id}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Info Cards */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full"
                >
                    {[
                        { icon: '🔒', title: 'DEPA Consent', desc: 'Secure patient authorization' },
                        { icon: '🧬', title: 'Multi-Modal AI', desc: 'Biomarkers + Imaging analysis' },
                        { icon: '📊', title: 'Explainable Results', desc: 'SHAP & GradCAM insights' }
                    ].map((item, idx) => (
                        <div
                            key={idx}
                            className="glass rounded-2xl p-6 text-center hover:shadow-xl transition-shadow duration-300"
                        >
                            <div className="text-4xl mb-3">{item.icon}</div>
                            <h3 className="font-bold text-gray-800 mb-1">{item.title}</h3>
                            <p className="text-sm text-gray-600">{item.desc}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default DoctorSearch;
