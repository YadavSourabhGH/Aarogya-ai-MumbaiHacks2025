import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import RiskGauge from '../components/RiskGauge';
import AbhaModal from '../components/AbhaModal';
import { FileText, Activity, Database, AlertTriangle, Clock, ChevronRight, Utensils, CalendarCheck, Sparkles, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/ui/AnimatedButton';
import AnalysisModal from '../components/AnalysisModal';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [abhaConnected, setAbhaConnected] = useState(false);
    const [abhaId, setAbhaId] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, type: 'success', title: '', message: '', abhaId: '' });
    const navigate = useNavigate();

    const [customAbhaId, setCustomAbhaId] = useState('');
    const [abhaCreationStep, setAbhaCreationStep] = useState('idle'); // idle, verifying, otp, fetching, success
    const [otp, setOtp] = useState('');

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }
        setUser(userInfo);
        // Set default custom ABHA ID
        if (userInfo.email) {
            const initials = userInfo.email.split('@')[0];
            setCustomAbhaId(initials);
        }

        fetchUserData(userInfo.token);
        fetchData(userInfo.token);
        fetchProfile(userInfo.token);
    }, [navigate]);

    const fetchProfile = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('https://aarogya-ai-personal.onrender.com/profile/me', config);
            setProfile(data);
        } catch (error) {
            console.error("Error fetching profile", error);
        }
    };

    const fetchUserData = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('https://aarogya-ai-personal.onrender.com/auth/user/me', config);

            if (data.abhaId) {
                setAbhaId(data.abhaId);
                setAbhaConnected(true);
            }
        } catch (error) {
            console.error("Error fetching user data", error);
        }
    };

    const fetchData = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const filesRes = await axios.get('https://aarogya-ai-personal.onrender.com/records/user/' + JSON.parse(localStorage.getItem('userInfo'))._id, config);
            setFiles(filesRes.data);

            const resultsRes = await axios.get('https://aarogya-ai-personal.onrender.com/ai/results/' + JSON.parse(localStorage.getItem('userInfo'))._id, config);
            setResults(resultsRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const startAbhaCreation = () => {
        setAbhaCreationStep('fetching'); // Show "Connecting..." modal

        // Open Popup
        const width = 500;
        const height = 600;
        const left = (window.screen.width - width) / 2;
        const top = (window.screen.height - height) / 2;

        const popup = window.open(
            '/simulation/abha-verification',
            'AbhaVerification',
            `width=${width},height=${height},left=${left},top=${top}`
        );

        // Listen for message from popup
        const handleMessage = async (event) => {
            if (event.data.type === 'ABHA_VERIFIED') {
                window.removeEventListener('message', handleMessage);
                if (popup && !popup.closed) popup.close();

                await createAbhaIdHandler();
                setAbhaCreationStep('idle');
            }
        };

        window.addEventListener('message', handleMessage);
    };

    const createAbhaIdHandler = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Use custom ABHA ID
            const fullAbhaId = customAbhaId.includes('@abha') ? customAbhaId : `${customAbhaId}@abha`;
            const response = await axios.post('https://aarogya-ai-personal.onrender.com/abha/connect', {
                abhaId: fullAbhaId
            }, config);

            setAbhaId(fullAbhaId);
            setAbhaConnected(true);

            // Show success modal
            setModalState({
                isOpen: true,
                type: 'success',
                title: 'ABHA ID Created Successfully!',
                message: 'Doctors can now search for you using this ID for consent-based health record access.',
                abhaId: fullAbhaId
            });

            // Refresh data to show newly connected ABHA info
            fetchUserData(userInfo.token);
        } catch (error) {
            console.error('ABHA creation error:', error);
            setAbhaCreationStep('idle'); // Reset step on error

            // Show error modal
            setModalState({
                isOpen: true,
                type: 'error',
                title: 'ABHA ID Creation Failed',
                message: error.response?.data?.message || error.message || 'An error occurred while creating your ABHA ID.',
                abhaId: ''
            });
        }
    };

    const analyzeHandler = async () => {
        setAnalyzing(true);
        setShowAnalysisModal(true); // Show modal immediately
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.post('https://aarogya-ai-personal.onrender.com/ai/analyze', {}, config);

            // Wait a moment to let the user see the "completion" state if needed,
            // or just navigate immediately.
            // The modal will unmount when we navigate away.
            navigate(`/aarogya-ai/report/${data._id}`, {
                state: { abhaId: profile?.abhaId }
            });

        } catch (error) {
            alert('Analysis failed: ' + (error.response?.data?.message || error.message));
            setAnalyzing(false);
            setShowAnalysisModal(false); // Hide modal on error
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileAnalysis, setFileAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);

    const handleFileClick = async (file) => {
        setSelectedFile(file);
        setLoadingAnalysis(true);
        setFileAnalysis(null);
        setFilePreviewUrl(null); // Reset preview

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Fetch Analysis
            const analysisRes = await axios.get(`https://aarogya-ai-personal.onrender.com/records/analysis/${file.gridFsId}`, config);
            setFileAnalysis(analysisRes.data);

            // Fetch File Blob for Preview
            const fileRes = await axios.get(`https://aarogya-ai-personal.onrender.com/records/file/${file.gridFsId}`, {
                ...config,
                responseType: 'blob'
            });

            let blob = fileRes.data;
            if (file.filename.toLowerCase().endsWith('.pdf') && blob.type !== 'application/pdf') {
                console.log('Forcing PDF type for blob');
                blob = new Blob([blob], { type: 'application/pdf' });
            }

            const url = URL.createObjectURL(blob);
            setFilePreviewUrl(url);

        } catch (error) {
            console.error("Error fetching data", error);
        } finally {
            setLoadingAnalysis(false);
        }
    };

    // Cleanup object URL when modal closes or component unmounts
    useEffect(() => {
        return () => {
            if (filePreviewUrl) {
                URL.revokeObjectURL(filePreviewUrl);
            }
        };
    }, [filePreviewUrl]);

    const handleCloseModal = () => {
        setSelectedFile(null);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            {/* ABHA Modal */}
            <AbhaModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState({ ...modalState, isOpen: false })}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
                abhaId={modalState.abhaId}
            />

            {/* ABHA Simulation Modal */}
            {abhaCreationStep !== 'idle' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
                    >
                        <div className="p-6">
                            {abhaCreationStep === 'fetching' && (
                                <div className="flex flex-col items-center justify-center py-8 space-y-4">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
                                    <div className="text-center">
                                        <h3 className="font-bold text-lg text-gray-900">Connecting to NDHM</h3>
                                        <p className="text-sm text-gray-500">Please complete verification in the popup window...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            {/* File Details Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
                    >
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedFile.filename}</h3>
                                    <p className="text-xs text-gray-500 uppercase">{selectedFile.fileType.split('/')[1]}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
                                {/* Left Side: Preview */}
                                <div className="bg-gray-100 rounded-xl overflow-hidden border border-gray-200 flex items-center justify-center min-h-[300px]">
                                    {filePreviewUrl ? (
                                        selectedFile.fileType.startsWith('image/') ? (
                                            <img src={filePreviewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />
                                        ) : selectedFile.fileType === 'application/pdf' ? (
                                            <iframe src={filePreviewUrl} title="PDF Preview" className="w-full h-full min-h-[500px]" />
                                        ) : (
                                            <div className="text-center text-gray-500">
                                                <FileText className="h-16 w-16 mx-auto mb-2 opacity-20" />
                                                <p>Preview not available for this file type</p>
                                            </div>
                                        )
                                    ) : (
                                        <div className="animate-pulse flex flex-col items-center">
                                            <div className="h-12 w-12 bg-gray-300 rounded-full mb-2"></div>
                                            <div className="h-4 w-32 bg-gray-300 rounded"></div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Side: Analysis */}
                                <div className="overflow-y-auto">
                                    {loadingAnalysis ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                                            <p className="text-gray-500">Retrieving AI Analysis...</p>
                                        </div>
                                    ) : fileAnalysis ? (
                                        <div className="space-y-6">
                                            {/* Summary Section */}
                                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                                <h4 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                                                    <Activity className="h-4 w-4" /> AI Summary
                                                </h4>
                                                <p className="text-gray-700 leading-relaxed">
                                                    {fileAnalysis.summary || "No summary available for this document."}
                                                </p>
                                            </div>

                                            {/* Structured Data Section */}
                                            {fileAnalysis.structuredData && Object.keys(fileAnalysis.structuredData).length > 0 && (
                                                <div>
                                                    <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                                                        <Database className="h-4 w-4 text-gray-500" /> Extracted Data
                                                    </h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {Object.entries(fileAnalysis.structuredData).map(([key, value]) => (
                                                            <div key={key} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                                <span className="text-xs text-gray-500 uppercase font-semibold block mb-1">
                                                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                                                </span>
                                                                <span className="text-sm font-medium text-gray-900 truncate block">
                                                                    {typeof value === 'object' ? JSON.stringify(value) : value.toString()}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Raw Text Preview (Collapsible or truncated) */}
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-2 text-sm">Raw Content Preview</h4>
                                                <div className="bg-gray-50 p-3 rounded-lg text-xs font-mono text-gray-600 max-h-32 overflow-y-auto border border-gray-100">
                                                    {fileAnalysis.text || "No text content extracted."}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center py-12 text-gray-400">
                                            <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-20" />
                                            <p>Analysis not found. This might be an old file.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            {filePreviewUrl && (
                                <a
                                    href={filePreviewUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    download={selectedFile.filename}
                                    className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    Download Original File
                                </a>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}

            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8 flex flex-col md:flex-row justify-between items-end md:items-center gap-4"
                >
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                        <p className="text-gray-500">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                        <Clock className="h-4 w-4" />
                        <span>Last login: {new Date().toLocaleDateString()}</span>
                    </div>
                </motion.div>

                {/* ABHA Card - Full Width */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative z-10">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                                    <Database className="h-6 w-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-lg">ABHA Health ID</h3>
                                    <p className="text-blue-100 text-sm">Your digital health identity</p>
                                </div>
                            </div>
                        </div>

                        {abhaConnected && abhaId ? (
                            <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                                <p className="text-xs text-blue-100 mb-1">Your ABHA ID</p>
                                <p className="font-mono font-bold text-white text-lg">{abhaId}</p>
                                <p className="text-xs text-blue-100 mt-2">
                                    ✓ Doctors can search for you using this email for consent-based access
                                </p>
                            </div>
                        ) : (
                            <div className="mt-4">
                                <p className="text-sm text-blue-100 mb-4">
                                    Create your ABHA ID to enable secure health record sharing with healthcare providers
                                </p>
                                <div className="flex flex-col sm:flex-row gap-3 items-end">
                                    <div className="w-full sm:max-w-md">
                                        <label className="text-xs text-blue-200 block mb-1">Choose your ABHA ID</label>
                                        <div className="flex items-center bg-white/10 border border-white/20 rounded-xl focus-within:ring-2 focus-within:ring-white/50 overflow-hidden transition-all">
                                            <input
                                                type="text"
                                                value={customAbhaId}
                                                onChange={(e) => setCustomAbhaId(e.target.value)}
                                                className="w-full px-4 py-2.5 bg-transparent text-white placeholder-blue-200/50 focus:outline-none border-none"
                                                placeholder="username"
                                            />
                                            <span className="px-4 py-2.5 text-blue-200 bg-white/5 border-l border-white/10 font-medium">
                                                @abha
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={startAbhaCreation}
                                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all whitespace-nowrap h-[46px]"
                                    >
                                        Create ABHA ID
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Main Content) */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* AI Health Plan Card */}
                        {profile && profile.healthPlan && (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden relative"
                            >
                                {/* Decorative Background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                                <div className="p-6 relative z-10">
                                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                        <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <Sparkles className="h-5 w-5" />
                                        </div>
                                        AI Health Plan
                                    </h3>

                                    {(!profile.healthPlan.dietPlan?.length && !profile.healthPlan.checkupSchedule?.length) ? (
                                        <div className="text-center py-8">
                                            <div className="bg-purple-50 p-3 rounded-full inline-block mb-3">
                                                <Sparkles className="h-6 w-6 text-purple-300" />
                                            </div>
                                            <p className="text-gray-600 font-medium">Ready to generate your health plan</p>
                                            <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                                                Upload your medical reports and run the analysis to generate a personalized diet plan and checkup schedule.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-8">
                                            {/* Diet Plan */}
                                            {profile.healthPlan.dietPlan?.length > 0 && (
                                                <div>
                                                    <h4 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                                                        <Utensils className="h-4 w-4 text-gray-400" />
                                                        Personalized Diet
                                                    </h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                        {profile.healthPlan.dietPlan.map((meal, idx) => (
                                                            <div key={idx} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <span className="font-bold text-gray-900">{meal.meal}</span>
                                                                    <span className="text-xs font-bold bg-green-50 px-2.5 py-1 rounded-full text-green-700 border border-green-100">
                                                                        {meal.calories} kcal
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 mb-2 leading-relaxed">{meal.items?.join(', ')}</p>
                                                                {meal.notes && (
                                                                    <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg italic border border-gray-100">
                                                                        Note: {meal.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Checkup Schedule */}
                                            {profile.healthPlan.checkupSchedule?.length > 0 && (
                                                <div>
                                                    <h4 className="font-bold text-gray-800 mb-4 text-xs uppercase tracking-wider flex items-center gap-2">
                                                        <CalendarCheck className="h-4 w-4 text-gray-400" />
                                                        Recommended Checkups
                                                    </h4>
                                                    <div className="space-y-3">
                                                        {profile.healthPlan.checkupSchedule.map((checkup, idx) => (
                                                            <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50/50 transition-colors">
                                                                <div>
                                                                    <p className="font-bold text-gray-900 text-sm mb-1">{checkup.testName}</p>
                                                                    <div className="flex items-center gap-2">
                                                                        <Clock className="h-3 w-3 text-gray-400" />
                                                                        <p className="text-xs text-gray-500">{checkup.frequency}</p>
                                                                    </div>
                                                                </div>
                                                                <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${checkup.priority === 'High' ? 'bg-red-100 text-red-700' :
                                                                    checkup.priority === 'Medium' ? 'bg-amber-100 text-amber-700' :
                                                                        'bg-blue-100 text-blue-700'
                                                                    }`}>
                                                                    {checkup.priority}
                                                                </span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="text-center pt-4 border-t border-gray-100">
                                                <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    Generated by AI Agent {profile.healthPlan.generatedAt ? `on ${new Date(profile.healthPlan.generatedAt).toLocaleDateString()}` : 'just now'}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}


                        {/* Latest Result */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Latest Assessment</h3>

                            {results.length > 0 ? (
                                <>
                                    <div className="flex flex-col md:flex-row items-center gap-8">
                                        <div className="w-full md:w-1/3 flex justify-center">
                                            <RiskGauge score={results[0].riskScore || 0} />
                                        </div>

                                        <div className="w-full md:w-2/3 space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-3 bg-gray-50 rounded-xl">
                                                    <span className="text-sm text-gray-500 block mb-1">Cancer Stage</span>
                                                    <span className="font-bold text-gray-900 block">{results[0].cancerStage || 'Not Detected'}</span>
                                                </div>
                                                <div className="p-3 bg-gray-50 rounded-xl">
                                                    <span className="text-sm text-gray-500 block mb-1">AI Confidence</span>
                                                    <span className="font-bold text-gray-900 block">{results[0].confidence}%</span>
                                                </div>
                                            </div>

                                            {/* Organ Risk */}
                                            {results[0].organRisk && (
                                                <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                                                    <span className="text-sm text-gray-500 block font-medium">Organ Specific Risk</span>
                                                    {Object.entries(results[0].organRisk).map(([organ, risk]) => (
                                                        <div key={organ} className="flex items-center gap-3">
                                                            <span className="text-xs w-20 capitalize text-gray-600">{organ}</span>
                                                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full ${risk > 70 ? 'bg-red-500' : risk > 30 ? 'bg-yellow-500' : 'bg-green-500'}`}
                                                                    style={{ width: `${risk}%` }}
                                                                />
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-700 w-8 text-right">{risk}%</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-6">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Analysis Summary</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            {results[0].explanation?.substring(0, 200)}...
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <div className="bg-white p-4 rounded-full shadow-sm inline-block mb-4">
                                        <Activity className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h4 className="text-gray-900 font-medium mb-1">No analysis yet</h4>
                                    <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                        Upload your medical records and click "Analyze My Health" to get started.
                                    </p>
                                </div>
                            )}
                        </motion.div>

                        {/* Recent Files */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Uploads</h2>
                            {files.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                    <div className="bg-white p-3 rounded-full shadow-sm inline-block mb-3">
                                        <FileText className="h-6 w-6 text-gray-300" />
                                    </div>
                                    <p className="text-gray-500 font-medium">No files uploaded yet</p>
                                    <p className="text-xs text-gray-400 mt-1">Upload records to get AI insights</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {files.map((file, i) => (
                                        <motion.div
                                            key={file._id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => handleFileClick(file)}
                                            className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-blue-50 hover:border-blue-100 cursor-pointer transition-all border border-gray-100 group"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-white flex items-center justify-center shadow-sm text-primary group-hover:scale-110 transition-transform">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors truncate">{file.filename}</p>
                                                    <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-gray-200 text-gray-600 uppercase flex-shrink-0">
                                                {file.fileType.split('/')[1]}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl shadow-lg border border-primary/10 p-6 relative overflow-hidden"
                        >
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-secondary" />

                            <h2 className="text-lg font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <Activity className="h-5 w-5 text-primary" />
                                AI Health Analysis
                            </h2>
                            <p className="text-sm text-gray-500 mb-6">
                                Generate a comprehensive risk assessment based on your uploaded data.
                            </p>

                            <AnimatedButton
                                onClick={analyzeHandler}
                                disabled={analyzing}
                                className="w-full shadow-primary/20"
                            >
                                {analyzing ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>Analyze My Health <ChevronRight className="h-4 w-4" /></>
                                )}
                            </AnimatedButton>
                        </motion.div>

                        {/* Upload Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Upload Records
                            </h2>
                            <FileUpload onUploadSuccess={() => fetchData(user.token)} />
                        </motion.div>



                        {/* Medical History Card */}
                        {profile && profile.questionnaireData && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                            >
                                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" />
                                    Medical History
                                </h2>
                                <div className="space-y-4">
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Smoking Status</p>
                                        <p className="font-medium text-gray-900">
                                            {profile.questionnaireData.isSmoker ? 'Smoker' : 'Non-Smoker'}
                                        </p>
                                        {profile.questionnaireData.isSmoker && (
                                            <p className="text-xs text-gray-600 mt-1">{profile.questionnaireData.smokingDuration}</p>
                                        )}
                                    </div>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs text-gray-500 uppercase font-semibold">Family History</p>
                                        <p className="font-medium text-gray-900">
                                            {profile.questionnaireData.familyHistory ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    {profile.questionnaireData.otherSymptoms && (
                                        <div className="p-3 bg-gray-50 rounded-lg">
                                            <p className="text-xs text-gray-500 uppercase font-semibold">Reported Symptoms</p>
                                            <p className="font-medium text-gray-900">{profile.questionnaireData.otherSymptoms}</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>
                {/* Analysis Simulation Modal */}
                <AnalysisModal 
                    isOpen={showAnalysisModal} 
                    onClose={() => setShowAnalysisModal(false)}
                />
            </div>
        </div>
    );
};

export default Dashboard;
