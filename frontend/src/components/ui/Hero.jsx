import React from 'react';
import { motion } from 'framer-motion';
import AnimatedButton from './AnimatedButton';
import { ArrowRight, Activity, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import dashboardGraph from '../../assets/dashboard_graph.png';

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
                    className="relative flex justify-center items-center"
                >
                    {/* Decorative Blob behind image */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-purple-200 rounded-full blur-3xl opacity-30 transform scale-110" />

                    <img
                        src={dashboardGraph}
                        alt="AI Health Analysis Dashboard"
                        className="relative z-10 w-full max-w-lg rounded-3xl shadow-2xl transform rotate-[-3deg] hover:rotate-0 transition-all duration-700 border-[8px] border-white hover:shadow-primary/20"
                    />

                    {/* Floating Elements */}
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute -top-6 -right-4 md:-right-10 bg-white p-4 rounded-2xl shadow-xl z-20 border border-gray-100"
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
