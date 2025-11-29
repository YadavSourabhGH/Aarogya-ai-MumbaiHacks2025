import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Image as ImageIcon, Brain, Loader2, X } from 'lucide-react';

const AnalysisModal = ({ isOpen, onClose, onComplete }) => {
    const [progress, setProgress] = useState(0);
    const [currentPhase, setCurrentPhase] = useState(0);

    const phases = [
        { name: 'Analyzing Biomarkers', icon: Activity, description: 'CBC, Inflammation Markers' },
        { name: 'Scanning Imaging', icon: ImageIcon, description: 'EfficientNet / U-Net' },
        { name: 'Evaluating Symptoms', icon: Brain, description: 'NLP & Clinical Reasoning' }
    ];

    useEffect(() => {
        if (!isOpen) {
            setProgress(0);
            setCurrentPhase(0);
            return;
        }

        // Simulate processing phases
        const phaseInterval = setInterval(() => {
            setCurrentPhase(prev => {
                if (prev >= 2) return prev;
                return prev + 1;
            });
        }, 2000);

        // Progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 95) {
                    // Stall at 95% until manually completed or API returns
                    return 95;
                }
                return prev + 1;
            });
        }, 100);

        return () => {
            clearInterval(phaseInterval);
            clearInterval(progressInterval);
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={onClose} // Optional: allow clicking outside to close? Maybe not for critical process.
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-4xl bg-gray-900/90 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/10 overflow-hidden"
                    >
                        {/* Close Button (Optional) */}
                        {/* <button 
                            onClick={onClose}
                            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button> */}

                        <div className="text-center">
                            {/* Title */}
                            <h2 className="text-3xl font-bold text-white mb-2">
                                Multi-Modal Fusion Analysis
                            </h2>
                            <p className="text-blue-200 mb-10">
                                Processing patient data through advanced AI models
                            </p>

                            {/* Gears Animation */}
                            <div className="relative h-48 mb-10">
                                <div className="flex items-center justify-center gap-6 md:gap-12">
                                    {phases.map((phase, idx) => {
                                        const Icon = phase.icon;
                                        const isActive = idx === currentPhase;
                                        const isCompleted = idx < currentPhase;

                                        return (
                                            <motion.div
                                                key={idx}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.2 }}
                                                className="relative"
                                            >
                                                {/* Gear Circle */}
                                                <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive
                                                    ? 'border-white bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                                    : isCompleted
                                                        ? 'border-green-400 bg-green-500/20'
                                                        : 'border-white/20 bg-white/5'
                                                    }`}>
                                                    {isActive && (
                                                        <motion.div
                                                            className="absolute inset-0 rounded-full border-4 border-t-white border-r-transparent border-b-white border-l-transparent"
                                                            animate={{ rotate: 360 }}
                                                            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                        />
                                                    )}

                                                    <Icon className={`w-10 h-10 md:w-12 md:h-12 transition-all duration-500 ${isActive
                                                        ? 'text-white'
                                                        : isCompleted
                                                            ? 'text-green-400'
                                                            : 'text-white/40'
                                                        }`} />

                                                    {isCompleted && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg"
                                                        >
                                                            <span className="text-white font-bold">✓</span>
                                                        </motion.div>
                                                    )}
                                                </div>

                                                {/* Label */}
                                                <div className="mt-4 text-center">
                                                    <p className={`font-bold text-sm transition-all duration-500 ${isActive
                                                        ? 'text-white'
                                                        : isCompleted
                                                            ? 'text-green-400'
                                                            : 'text-white/40'
                                                        }`}>
                                                        {phase.name}
                                                    </p>
                                                    <p className="text-xs text-blue-300/60 mt-1 hidden md:block">
                                                        {phase.description}
                                                    </p>
                                                </div>

                                                {/* Connector Line */}
                                                {idx < phases.length - 1 && (
                                                    <div className={`hidden md:block absolute top-14 left-full w-6 md:w-12 h-0.5 transition-all duration-500 ${isCompleted ? 'bg-green-400' : 'bg-white/20'
                                                        }`} />
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="max-w-xl mx-auto">
                                <div className="flex justify-between text-sm font-medium text-blue-200 mb-2">
                                    <span>Processing data...</span>
                                    <span>{Math.round(progress)}%</span>
                                </div>
                                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ ease: "linear" }}
                                    />
                                </div>
                                <p className="text-center text-xs text-blue-300/50 mt-4 flex items-center justify-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    AI is analyzing 150+ biomarkers
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default AnalysisModal;
