import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Image as ImageIcon, Brain, Loader2 } from 'lucide-react';

const AnalysisProcessing = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { analysisId, abhaId } = location.state || {};

    const [progress, setProgress] = useState(0);
    const [currentPhase, setCurrentPhase] = useState(0);

    const phases = [
        { name: 'Analyzing Biomarkers', icon: Activity, description: 'CBC, Inflammation Markers' },
        { name: 'Scanning Imaging', icon: ImageIcon, description: 'EfficientNet / U-Net' },
        { name: 'Evaluating Symptoms', icon: Brain, description: 'NLP & Clinical Reasoning' }
    ];

    useEffect(() => {
        if (!analysisId) {
            navigate('/aarogya-ai/search');
            return;
        }

        // Simulate processing phases
        const phaseInterval = setInterval(() => {
            setCurrentPhase(prev => {
                if (prev >= 2) {
                    clearInterval(phaseInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, 2500); // Each phase takes 2.5 seconds

        // Progress bar
        const progressInterval = setInterval(() => {
            setProgress(prev => {
                if (prev >= 100) {
                    clearInterval(progressInterval);
                    // Navigate to results after completion
                    setTimeout(() => {
                        navigate(`/aarogya-ai/report/${analysisId}`, {
                            state: { abhaId }
                        });
                    }, 1000);
                    return 100;
                }
                return prev + 1.5;
            });
        }, 120); // Complete in ~8 seconds

        return () => {
            clearInterval(phaseInterval);
            clearInterval(progressInterval);
        };
    }, [analysisId]);

    return (
        <div className="min-h-screen medical-gradient flex items-center justify-center px-4">
            <div className="max-w-4xl w-full">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white/10 backdrop-blur-lg rounded-3xl p-12 shadow-2xl border border-white/20 text-center"
                >
                    {/* Title */}
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Multi-Modal Fusion Analysis
                    </h1>
                    <p className="text-blue-100 mb-12">
                        Processing patient data through advanced AI models
                    </p>

                    {/* Gears Animation */}
                    <div className="relative h-64 mb-12">
                        <div className="flex items-center justify-center gap-8">
                            {phases.map((phase, idx) => {
                                const Icon = phase.icon;
                                const isActive = idx === currentPhase;
                                const isCompleted = idx < currentPhase;

                                return (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, y: 50 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.3 }}
                                        className="relative"
                                    >
                                        {/* Gear Circle */}
                                        <div className={`relative w-32 h-32 rounded-full flex items-center justify-center border-4 transition-all duration-500 ${isActive
                                            ? 'border-white bg-white/20 shadow-2xl shadow-white/50'
                                            : isCompleted
                                                ? 'border-green-300 bg-green-500/30'
                                                : 'border-white/40 bg-white/5'
                                            }`}>
                                            {isActive && (
                                                <motion.div
                                                    className="absolute inset-0 rounded-full border-4 border-white/50"
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                                                />
                                            )}

                                            <Icon className={`w-12 h-12 transition-all duration-500 ${isActive
                                                ? 'text-white'
                                                : isCompleted
                                                    ? 'text-green-300'
                                                    : 'text-white/40'
                                                }`} />

                                            {isCompleted && (
                                                <motion.div
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    className="absolute top-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center"
                                                >
                                                    <span className="text-white text-lg">✓</span>
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* Label */}
                                        <div className="mt-4 text-center">
                                            <p className={`font-bold text-sm transition-all duration-500 ${isActive
                                                ? 'text-white'
                                                : isCompleted
                                                    ? 'text-green-300'
                                                    : 'text-white/50'
                                                }`}>
                                                {phase.name}
                                            </p>
                                            <p className="text-xs text-blue-200 mt-1">
                                                {phase.description}
                                            </p>
                                        </div>

                                        {/* Connector Line */}
                                        {idx < phases.length - 1 && (
                                            <div className={`absolute top-16 left-full w-8 h-0.5 transition-all duration-500 ${isCompleted ? 'bg-green-300' : 'bg-white/30'
                                                }`} />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="relative pt-8 max-w-2xl mx-auto">
                        <div className="flex justify-between text-sm font-medium text-blue-100 mb-2">
                            <span>Processing...</span>
                            <span>{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-green-400 to-emerald-500"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ ease: "linear" }}
                            />
                        </div>
                        <p className="text-center text-xs text-blue-200/60 mt-4 flex items-center justify-center gap-2">
                            <Loader2 className="w-3 h-3 animate-spin" />
                            This may take 5-10 seconds
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default AnalysisProcessing;
