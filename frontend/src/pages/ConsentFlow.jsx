import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, Loader2, Smartphone } from 'lucide-react';

const ConsentFlow = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { abhaId } = location.state || {};

    const [consentId, setConsentId] = useState(null);
    const [consentStatus, setConsentStatus] = useState('requesting'); // requesting, pending, approved
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        if (!abhaId) {
            navigate('/aarogya-ai/search');
            return;
        }
        requestConsent();
    }, [abhaId]);

    const requestConsent = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.post('https://aarogya-ai-personal.onrender.com/consent/request', {
                abhaId
            }, config);

            setConsentId(data.consent.consentId);
            setNotification(data.notification);
            setConsentStatus('pending');

            // Start polling for consent status
            pollConsentStatus(data.consent.consentId, config);

        } catch (error) {
            console.error('Consent request error:', error);
        }
    };

    const pollConsentStatus = (id, config) => {
        const interval = setInterval(async () => {
            try {
                const { data } = await axios.get(`https://aarogya-ai-personal.onrender.com/consent/status/${id}`, config);

                if (data.consent.status === 'approved') {
                    setConsentStatus('approved');
                    clearInterval(interval);

                    // Navigate to data aggregation after 2 seconds
                    setTimeout(() => {
                        navigate('/aarogya-ai/aggregate', {
                            state: { abhaId, consentId: id }
                        });
                    }, 2000);
                }

            } catch (error) {
                console.error('Polling error:', error);
                clearInterval(interval);
            }
        }, 2000); // Poll every 2 seconds
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center px-4">
            <div className="max-w-6xl w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Left Side: Website Status */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass rounded-3xl p-8 flex flex-col items-center justify-center"
                    >
                        <AnimatePresence mode="wait">
                            {consentStatus === 'requesting' && (
                                <motion.div
                                    key="requesting"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="text-center"
                                >
                                    <Loader2 className="w-16 h-16 text-medical-blue mx-auto mb-6 animate-spin" />
                                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                                        Initiating Consent Request
                                    </h2>
                                    <p className="text-gray-600">
                                        Please wait...
                                    </p>
                                </motion.div>
                            )}

                            {consentStatus === 'pending' && (
                                <motion.div
                                    key="pending"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="text-center"
                                >
                                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full">
                                        <div className="flex items-center justify-center mb-6">
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                                className="w-16 h-16 border-4 border-medical-blue border-t-transparent rounded-full"
                                            />
                                        </div>

                                        <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                                            Waiting for Patient Consent
                                        </h2>

                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                                            <p className="text-sm text-blue-900 text-center">
                                                ✉️ <strong>Email sent to patient</strong>
                                            </p>
                                            <p className="text-xs text-blue-700 mt-2 text-center">
                                                The patient has been notified via email and must approve this request to proceed.
                                            </p>
                                        </div>

                                        <div className="text-center text-sm text-gray-600">
                                            <p>Patient ID: <strong>{abhaId}</strong></p>
                                            <p className="mt-2">Please wait for the patient to review and approve your consent request.</p>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {consentStatus === 'approved' && (
                                <motion.div
                                    key="approved"
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    className="text-center"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="w-24 h-24 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center"
                                    >
                                        <CheckCircle className="w-16 h-16 text-white" />
                                    </motion.div>
                                    <h2 className="text-3xl font-bold text-green-600 mb-2">
                                        Consent Granted!
                                    </h2>
                                    <p className="text-gray-600 mb-4">
                                        Fetching Health Data...
                                    </p>
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />
                                        <span className="text-sm text-gray-500">Redirecting...</span>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>

                    {/* Right Side: Mock Phone Notification */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-center"
                    >
                        <div className="relative">
                            {/* Phone Mockup */}
                            <div className="w-[320px] h-[640px] bg-gray-900 rounded-[3rem] p-4 shadow-2xl border-8 border-gray-800">
                                {/* Phone Screen */}
                                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                                    {/* Status Bar */}
                                    <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                                        <span className="text-xs font-semibold">9:41 AM</span>
                                        <div className="flex gap-1">
                                            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                                            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                                            <div className="w-4 h-4 bg-gray-300 rounded-sm"></div>
                                        </div>
                                    </div>

                                    {notification && (
                                        <motion.div
                                            initial={{ y: -100, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: 0.5, type: 'spring', stiffness: 150 }}
                                            className="p-4"
                                        >
                                            {/* SMS Notification */}
                                            <div className="bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl p-6 shadow-lg">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <Smartphone className="w-6 h-6 text-white" />
                                                    <span className="text-white font-bold">Aarogya AI AI</span>
                                                </div>

                                                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 mb-4">
                                                    <p className="text-white text-sm leading-relaxed">
                                                        {notification.message.en}
                                                    </p>
                                                    <p className="text-white/80 text-xs mt-2 italic">
                                                        {notification.message.hi}
                                                    </p>
                                                </div>

                                                <div className="flex gap-3">
                                                    <button
                                                        className={`flex-1 py-3 rounded-xl font-bold text-white ${consentStatus === 'approved'
                                                            ? 'bg-white/30'
                                                            : 'bg-white/20 hover:bg-white/30'
                                                            } transition-all duration-200`}
                                                        disabled={consentStatus === 'approved'}
                                                    >
                                                        {consentStatus === 'approved' ? '✓ ALLOWED' : 'ALLOW'}
                                                    </button>
                                                    <button
                                                        className="flex-1 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-bold text-white transition-all duration-200"
                                                        disabled={consentStatus === 'approved'}
                                                    >
                                                        DENY
                                                    </button>
                                                </div>

                                                <p className="text-xs text-white/60 mt-4 text-center">
                                                    Valid for 1 hour
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Floating Info */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1 }}
                                className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-full text-center"
                            >
                                <p className="text-sm text-gray-600 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 inline-block shadow-lg">
                                    📱 Patient's Phone
                                </p>
                            </motion.div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ConsentFlow;
