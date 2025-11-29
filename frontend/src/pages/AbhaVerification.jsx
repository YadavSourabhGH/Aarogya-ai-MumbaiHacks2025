import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, ShieldCheck } from 'lucide-react';

const AbhaVerification = () => {
    const [step, setStep] = useState('input'); // input, verifying, success
    const [aadhaar, setAadhaar] = useState('');

    useEffect(() => {
        if (step === 'verifying') {
            // Simulate verification process
            const timer1 = setTimeout(() => {
                setStep('success');
            }, 2500);

            return () => clearTimeout(timer1);
        }

        if (step === 'success') {
            const timer2 = setTimeout(() => {
                // Send message to parent window
                if (window.opener) {
                    window.opener.postMessage({ type: 'ABHA_VERIFIED' }, '*');
                    window.close();
                }
            }, 2000);

            return () => clearTimeout(timer2);
        }
    }, [step]);

    const handleVerify = () => {
        if (aadhaar.length === 12) {
            setStep('verifying');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="w-full max-w-md bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                {/* Header simulating Gov portal */}
                <div className="bg-[#1e3a8a] p-4 flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                        <img
                            src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"
                            alt="Emblem"
                            className="w-6 h-6"
                        />
                    </div>
                    <div>
                        <h1 className="text-white font-bold text-sm">National Health Authority</h1>
                        <p className="text-blue-200 text-xs">Government of India</p>
                    </div>
                </div>

                <div className="p-8 flex flex-col items-center text-center min-h-[300px] justify-center">
                    {step === 'input' && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="w-full space-y-6"
                        >
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Link Aadhaar</h2>
                                <p className="text-gray-500 text-sm">
                                    Enter your 12-digit Aadhaar number to verify your identity.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <input
                                    type="text"
                                    value={aadhaar}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '');
                                        if (val.length <= 12) setAadhaar(val);
                                    }}
                                    placeholder="XXXX XXXX XXXX"
                                    className="w-full px-4 py-3 text-center text-xl tracking-widest font-bold border-2 border-gray-200 rounded-xl focus:border-blue-600 focus:ring-2 focus:ring-blue-100 outline-none transition-all"
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={aadhaar.length !== 12}
                                    className="w-full bg-[#1e3a8a] hover:bg-blue-900 text-white font-bold py-3 rounded-xl shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Verify Identity
                                </button>
                            </div>

                            <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
                                <ShieldCheck className="w-4 h-4" />
                                <span>Your data is encrypted and secure</span>
                            </div>
                        </motion.div>
                    )}

                    {step === 'verifying' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="relative">
                                <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-25"></div>
                                <div className="relative bg-white p-4 rounded-full shadow-md">
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Verifying Aadhaar</h2>
                                <p className="text-gray-500 text-sm">
                                    Securely connecting to UIDAI servers...
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'success' && (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="space-y-6"
                        >
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                                <CheckCircle className="w-10 h-10 text-green-600" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800 mb-2">Verified Successfully</h2>
                                <p className="text-gray-500 text-sm">
                                    Your identity has been confirmed. Redirecting back to AarogyaAI...
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                    <p className="text-xs text-gray-400">
                        © 2024 National Digital Health Mission. All rights reserved.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AbhaVerification;
