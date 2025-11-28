import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { FileText, Download, Send, CheckCircle, Loader2, Home } from 'lucide-react';

const PatientHandout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { analysisId, abhaId } = location.state || {};

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pushing, setPushing] = useState(false);
    const [pushed, setPushed] = useState(false);

    useEffect(() => {
        fetchAnalysis();
    }, [analysisId]);

    const fetchAnalysis = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`http://localhost:4000/ai/analysis/${analysisId}`, config);
            setAnalysis(data);

        } catch (error) {
            console.error('Error fetching analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const pushToABHA = () => {
        setPushing(true);

        // Simulate push to ABHA locker
        setTimeout(() => {
            setPushing(false);
            setPushed(true);
        }, 2000);
    };

    const downloadPDF = () => {
        // In real implementation, this would call backend PDF generation
        alert('PDF Download feature - would generate and download patient report');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-medical-blue animate-spin" />
            </div>
        );
    }

    const riskScore = analysis?.overallRiskScore || 0;
    const riskLevel = riskScore > 70 ? 'HIGH RISK' : riskScore > 40 ? 'MODERATE RISK' : 'LOW RISK';
    const riskColor = riskScore > 70 ? 'text-red-600' : riskScore > 40 ? 'text-amber-600' : 'text-green-600';

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 pt-24 pb-12 px-4">
            <div className="max-w-4xl mx-auto">

                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center mb-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                        className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4"
                    >
                        <CheckCircle className="w-12 h-12 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Analysis Complete!
                    </h1>
                    <p className="text-gray-600">
                        Patient report ready for {abhaId}
                    </p>
                </motion.div>

                {/* Patient Handout Preview */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-3xl p-8 mb-6"
                >
                    <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-200">
                        <FileText className="w-8 h-8 text-medical-blue" />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Patient Report</h2>
                            <p className="text-sm text-gray-500">CureSight AI Cancer Screening</p>
                        </div>
                    </div>

                    {/* Simplified Report Content */}
                    <div className="space-y-6">
                        {/* Risk Level */}
                        <div className="bg-white border-2 border-gray-200 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-gray-700 mb-2">Risk Assessment</h3>
                            <p className={`text-3xl font-bold ${riskColor}`}>
                                {riskLevel}
                            </p>
                            <p className="text-gray-600 mt-2">
                                Overall Risk Score: {riskScore}%
                            </p>
                        </div>

                        {/* Appointment Details */}
                        {analysis?.clinicReferrals?.[0] && (
                            <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                                <h3 className="text-lg font-bold text-blue-900 mb-3">
                                    📅 Scheduled Appointment
                                </h3>
                                <div className="space-y-2 text-gray-700">
                                    <p className="font-semibold">{analysis.clinicReferrals[0].name}</p>
                                    <p className="text-sm">{analysis.clinicReferrals[0].location}</p>
                                    <p className="text-sm">Contact: {analysis.clinicReferrals[0].contact}</p>
                                    {analysis.clinicReferrals[0].appointmentDate && (
                                        <p className="text-blue-800 font-bold mt-2">
                                            {new Date(analysis.clinicReferrals[0].appointmentDate).toLocaleString('en-IN', {
                                                weekday: 'long',
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Lifestyle Advice */}
                        <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-amber-900 mb-3">
                                💊 Lifestyle Recommendations
                            </h3>
                            <ul className="space-y-2 text-gray-700 text-sm">
                                {analysis?.recommendations?.slice(0, 3).map((rec, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-amber-600">•</span>
                                        <span>{rec}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Next Steps */}
                        <div className="bg-purple-50 border-2 border-purple-200 rounded-2xl p-6">
                            <h3 className="text-lg font-bold text-purple-900 mb-2">
                                🔔 Important Next Steps
                            </h3>
                            <p className="text-gray-700">
                                {analysis?.nextSteps}
                            </p>
                        </div>

                        {/* QR Code Placeholder */}
                        <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-2xl">
                            <div className="w-32 h-32 bg-gray-200 mx-auto rounded-lg flex items-center justify-center mb-2">
                                <span className="text-gray-400 text-4xl">QR</span>
                            </div>
                            <p className="text-sm text-gray-500">
                                Scan to access full report in ABHA Health Locker
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Action Buttons */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        onClick={downloadPDF}
                        className="bg-gray-700 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <Download className="w-5 h-5" />
                        Download PDF
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        onClick={pushToABHA}
                        disabled={pushing || pushed}
                        className={`font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg transition-all duration-200 ${pushed
                            ? 'bg-green-500 text-white'
                            : 'medical-gradient text-white hover:shadow-xl transform hover:-translate-y-1'
                            } disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none`}
                    >
                        {pushing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Pushing...
                            </>
                        ) : pushed ? (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Pushed to ABHA
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5" />
                                Push to ABHA Locker
                            </>
                        )}
                    </motion.button>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => navigate('/curesight/search')}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
                    >
                        <Home className="w-5 h-5" />
                        New Screening
                    </motion.button>
                </div>

                {/* Success Confetti Message */}
                {pushed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mt-6 bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center"
                    >
                        <p className="text-green-800 font-medium">
                            🎉 Report successfully added to patient's ABHA Health Locker!
                        </p>
                        <p className="text-sm text-green-600 mt-1">
                            Patient can access anytime from their mobile app
                        </p>
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default PatientHandout;
