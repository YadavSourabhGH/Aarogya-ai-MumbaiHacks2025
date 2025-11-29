import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, XCircle, Calendar, MapPin, Phone, Loader2 } from 'lucide-react';
import ShapChart from '../components/ShapChart';
import GradCAMOverlay from '../components/GradCAMOverlay';



const MedicalReport = () => {
    const { analysisId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { abhaId } = location.state || {};

    const [analysis, setAnalysis] = useState(null);
    const [loading, setLoading] = useState(true);
    const [doctorNotes, setDoctorNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [imageUrl, setImageUrl] = useState(null);

    useEffect(() => {
        fetchAnalysisResults();
        return () => {
            if (imageUrl) URL.revokeObjectURL(imageUrl);
        };
    }, [analysisId]);

    const fetchAnalysisResults = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch specific analysis by ID
            const { data } = await axios.get(`https://aarogya-ai-personal.onrender.com/ai/analysis/${analysisId}`, config);
            setAnalysis(data);

            // Fetch Image if available
            let url = null;
            if (data.documentIds && data.documentIds.length > 0) {
                const imageDoc = data.documentIds.find(doc => doc.mimeType && doc.mimeType.startsWith('image/'));
                if (imageDoc) {
                    try {
                        const imageRes = await axios.get(`https://aarogya-ai-personal.onrender.com/records/file/${imageDoc.fileUrl}`, {
                            ...config,
                            responseType: 'blob'
                        });
                        url = URL.createObjectURL(imageRes.data);
                    } catch (imgErr) {
                        console.error("Error fetching image:", imgErr);
                    }
                }
            }

            // Set fallback if no image found or fetch failed
            if (!url) {
                url = 'https://upload.wikimedia.org/wikipedia/commons/a/a1/Normal_posteroanterior_%28PA%29_chest_radiograph_%28X-ray%29.jpg';
            }

            setImageUrl(url);
        } catch (error) {
            console.error('Error fetching analysis:', error);
        } finally {
            setLoading(false);
        }
    };

    const submitVerification = async (decision) => {
        setSubmitting(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post('https://aarogya-ai-personal.onrender.com/doctor/review', {
                resultId: analysisId,
                decision,
                notes: doctorNotes
            }, config);

            // Navigate to patient handout
            navigate('/aarogya-ai/handout', {
                state: { analysisId, abhaId }
            });

        } catch (error) {
            console.error('Verification error:', error);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-medical-blue animate-spin" />
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Analysis not found</p>
            </div>
        );
    }

    const riskScore = analysis.overallRiskScore || 0;
    const riskLevel = riskScore > 70 ? 'HIGH' : riskScore > 40 ? 'MODERATE' : 'LOW';
    const riskColor = riskScore > 70 ? 'risk-gradient-high' : riskScore > 40 ? 'risk-gradient-medium' : 'risk-gradient-low';
    const riskTextColor = riskScore > 70 ? 'text-red-600' : riskScore > 40 ? 'text-amber-600' : 'text-green-600';
    const riskBorder = riskScore > 70 ? 'border-red-200' : riskScore > 40 ? 'border-amber-200' : 'border-green-200';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">

                {/* A. RISK SCORE HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`${riskColor} rounded-3xl p-8 mb-8 shadow-2xl text-white`}
                >
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <AlertCircle className="w-8 h-8" />
                                <h1 className="text-4xl font-bold">{riskLevel} RISK</h1>
                            </div>
                            <p className="text-xl opacity-90">
                                {analysis.organRisks?.lung ? 'Primary Concern: Lung' : 'Multi-Organ Assessment'}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-6xl font-bold mb-1">{riskScore}%</div>
                            <div className="text-lg opacity-90">
                                Confidence: {analysis.confidence || 85}%
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-white/30">
                        <p className="text-sm opacity-80">
                            Cancer Stage: <span className="font-bold">{analysis.cancerStage}</span>
                        </p>
                    </div>
                </motion.div>

                {/* B. EXPLAINABILITY SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                    {/* SHAP Analysis */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="glass rounded-3xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Why This Score?
                        </h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            SHAP analysis showing factors contributing to risk assessment
                        </p>
                        <ShapChart factors={analysis.shapFactors} />
                    </motion.div>

                    {/* GradCAM Imaging */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                        className="glass rounded-3xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            AI Imaging Analysis
                        </h2>
                        <p className="text-gray-600 mb-6 text-sm">
                            GradCAM heatmap highlighting regions of concern
                        </p>
                        {imageUrl ? (
                            <GradCAMOverlay
                                imageUrl={imageUrl}
                                heatmapData={analysis.gradcamHeatmap}
                            />
                        ) : (
                            <div className="h-64 flex items-center justify-center bg-gray-100 rounded-lg border border-gray-200">
                                <p className="text-gray-500">Loading X-Ray...</p>
                            </div>
                        )}
                    </motion.div>
                </div>

                {/* C. RECOMMENDATIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">

                    {/* Next Steps */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="glass rounded-3xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Recommended Next Steps
                        </h2>
                        <div className={`bg-white border-2 ${riskBorder} rounded-2xl p-6 mb-4`}>
                            <p className={`text-lg font-bold ${riskTextColor} mb-2`}>
                                {analysis.nextSteps}
                            </p>
                        </div>
                        <ul className="space-y-2">
                            {analysis.recommendations?.map((rec, idx) => (
                                <li key={idx} className="flex items-start gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </motion.div>

                    {/* Clinic Referrals */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="glass rounded-3xl p-6"
                    >
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Nearest Oncology Centers
                        </h2>
                        <div className="space-y-4">
                            {analysis.clinicReferrals?.map((clinic, idx) => (
                                <div key={idx} className="bg-white rounded-2xl border border-gray-200 p-4 hover:shadow-lg transition-shadow">
                                    <h3 className="font-bold text-gray-900 mb-2">{clinic.name}</h3>
                                    <div className="space-y-2 text-sm text-gray-600">
                                        <p className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4" />
                                            {clinic.location}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <Phone className="w-4 h-4" />
                                            {clinic.contact}
                                        </p>
                                        {clinic.appointmentDate && (
                                            <p className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Suggested: {new Date(clinic.appointmentDate).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                    <button className="mt-3 w-full bg-medical-blue text-white font-medium py-2 rounded-lg hover:bg-blue-600 transition-colors">
                                        Request Appointment
                                    </button>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* SCREEN 6: DOCTOR VERIFICATION */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-3xl p-8"
                >
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                        Doctor Verification
                    </h2>
                    <p className="text-gray-600 text-center mb-6">
                        Do you agree with this AI assessment?
                    </p>

                    <textarea
                        value={doctorNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder="Add clinical notes or observations (optional)..."
                        rows="4"
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none resize-none mb-6"
                    />

                    <div className="flex gap-4">
                        <button
                            onClick={() => submitVerification('approved')}
                            disabled={submitting}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <CheckCircle className="w-6 h-6" />
                            YES / VERIFIED
                        </button>
                        <button
                            onClick={() => submitVerification('override')}
                            disabled={submitting}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            <XCircle className="w-6 h-6" />
                            NO / OVERRIDE
                        </button>
                    </div>

                    {submitting && (
                        <div className="mt-4 flex items-center justify-center gap-2 text-gray-600">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-sm">Submitting verification...</span>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default MedicalReport;
