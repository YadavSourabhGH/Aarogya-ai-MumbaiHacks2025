import React from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import { ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-slate-50">
            {/* Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[100px] animate-float" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-accent/10 rounded-full blur-[80px] animate-float" style={{ animationDelay: '4s' }} />
            </div>

            <div className="container mx-auto px-4 z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                {/* Text Content */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-left"
                >
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-white border border-gray-200 shadow-sm mb-6">
                        <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2 animate-pulse"></span>
                        <span className="text-xs font-medium text-gray-600">AI-Powered Early Detection</span>
                    </div>

                    <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6 text-gray-900">
                        Detect Cancer <br />
                        <span className="text-gradient">Before It's Too Late</span>
                    </h1>

                    <p className="text-lg text-gray-600 mb-8 max-w-xl leading-relaxed">
                        AarogyaAi leverages advanced multimodal AI to analyze your medical records, lab reports, and imaging data for early cancer risk assessment.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <AnimatedButton onClick={() => navigate('/signup')}>
                            Start Screening Now <ArrowRight className="w-5 h-5" />
                        </AnimatedButton>
                        <AnimatedButton variant="outline" onClick={() => document.getElementById('features').scrollIntoView({ behavior: 'smooth' })}>
                            Learn How It Works
                        </AnimatedButton>
                    </div>

                    <div className="mt-12 flex items-center gap-8 text-gray-500">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">HIPAA Compliant</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-primary" />
                            <span className="text-sm font-medium">98% Accuracy</span>
                        </div>
                    </div>
                </motion.div>

                {/* Hero Image / Visual */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                >
                    <div className="relative z-10 bg-white/40 backdrop-blur-xl rounded-3xl border border-white/50 shadow-2xl p-6 transform rotate-[-2deg] hover:rotate-0 transition-all duration-500">
                        <div className="absolute top-4 right-4 flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        </div>
                        <div className="mt-8 space-y-4">
                            <div className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                                <Activity className="w-16 h-16 text-primary/50" />
                            </div>
                            <div className="space-y-2">
                                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                                <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse"></div>
                            </div>
                            <div className="pt-4 border-t border-gray-100">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Risk Assessment</span>
                                    <span className="text-sm font-bold text-red-500">High Priority</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                                    <div className="bg-gradient-to-r from-primary to-accent h-2.5 rounded-full w-[85%]"></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [0, -20, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-10 -right-10 bg-white p-4 rounded-2xl shadow-xl z-20"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <ShieldCheck className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Status</p>
                                <p className="text-sm font-bold text-gray-800">Secure & Private</p>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>

            </div>
        </div>
    );
};

export default Hero;
