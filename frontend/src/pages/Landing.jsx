import React from 'react';
import Hero from '../components/ui/Hero';
import FeatureCard from '../components/ui/FeatureCard';
import { Brain, FileText, Activity, Shield, Stethoscope, Smartphone } from 'lucide-react';
import Navbar from '../components/Navbar';

const Landing = () => {
    const features = [
        {
            icon: Brain,
            title: "Multimodal AI Analysis",
            description: "Our advanced AI analyzes text, lab reports, and medical images simultaneously for comprehensive risk assessment."
        },
        {
            icon: FileText,
            title: "Smart Record Parsing",
            description: "Upload PDFs, images, or text. We automatically extract and structure your medical data using OCR and NLP."
        },
        {
            icon: Activity,
            title: "Early Risk Detection",
            description: "Get probability scores for various cancer types and estimated stages based on your unique health profile."
        },
        {
            icon: Shield,
            title: "ABHA Integration",
            description: "Seamlessly connect your Ayushman Bharat Health Account to sync your medical history securely."
        },
        {
            icon: Stethoscope,
            title: "Doctor Verification",
            description: "AI findings are reviewed and validated by qualified oncologists to ensure accuracy and reliability."
        },
        {
            icon: Smartphone,
            title: "Accessible Anywhere",
            description: "Access your health dashboard from any device. Your data is encrypted and stored securely."
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Navbar is included in App.jsx layout usually, but if Landing needs specific one we can add here or rely on global */}

            <Hero />

            <section id="features" className="py-24 px-4 bg-white relative overflow-hidden">
                <div className="container mx-auto max-w-7xl relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Advanced Technology for <span className="text-gradient">Better Health</span>
                        </h2>
                        <p className="text-lg text-gray-600">
                            AarogyaAi combines cutting-edge artificial intelligence with medical expertise to bring you the future of preventive healthcare.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={feature.icon}
                                title={feature.title}
                                description={feature.description}
                                delay={index * 0.1}
                            />
                        ))}
                    </div>
                </div>

                {/* Background Elements */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-30">
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-primary/10 rounded-full blur-[80px]" />
                    <div className="absolute bottom-[-10%] left-[-5%] w-[30%] h-[30%] bg-secondary/10 rounded-full blur-[80px]" />
                </div>
            </section>

            <section className="py-24 px-4 bg-slate-50">
                <div className="container mx-auto max-w-7xl">
                    <div className="bg-gradient-to-r from-primary to-secondary rounded-3xl p-8 md:p-16 text-center text-white shadow-2xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to take control of your health?</h2>
                            <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
                                Join thousands of users who are using AarogyaAi for early detection and peace of mind.
                            </p>
                            <button onClick={() => window.location.href = '/signup'} className="bg-white text-primary font-bold py-3 px-8 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300">
                                Get Started Free
                            </button>
                        </div>

                        {/* Decorative Circles */}
                        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
                            <div className="absolute top-[-50%] left-[-10%] w-[50%] h-[100%] bg-white/10 rounded-full blur-[50px]" />
                            <div className="absolute bottom-[-50%] right-[-10%] w-[50%] h-[100%] bg-white/10 rounded-full blur-[50px]" />
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-slate-900 text-white py-12 border-t border-slate-800">
                <div className="container mx-auto px-4 text-center">
                    <div className="flex items-center justify-center mb-8">
                        <Activity className="h-8 w-8 text-primary mr-2" />
                        <span className="text-2xl font-bold">AarogyaAi</span>
                    </div>
                    <p className="text-slate-400 mb-8">
                        Empowering you with AI-driven health insights for a better tomorrow.
                    </p>
                    <div className="text-sm text-slate-500">
                        &copy; {new Date().getFullYear()} AarogyaAi. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Landing;
