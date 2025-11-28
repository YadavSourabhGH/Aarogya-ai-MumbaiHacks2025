import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import FileUpload from '../components/FileUpload';
import RiskGauge from '../components/RiskGauge';
import AbhaModal from '../components/AbhaModal';
import { FileText, Activity, Database, AlertTriangle, Clock, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import AnimatedButton from '../components/ui/AnimatedButton';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [files, setFiles] = useState([]);
    const [results, setResults] = useState([]);
    const [analyzing, setAnalyzing] = useState(false);
    const [abhaConnected, setAbhaConnected] = useState(false);
    const [abhaId, setAbhaId] = useState(null);
    const [modalState, setModalState] = useState({ isOpen: false, type: 'success', title: '', message: '', abhaId: '' });
    const navigate = useNavigate();

    useEffect(() => {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        if (!userInfo) {
            navigate('/login');
            return;
        }
        setUser(userInfo);
        fetchUserData(userInfo.token);
        fetchData(userInfo.token);
    }, [navigate]);

    const fetchUserData = async (token) => {
        try {
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get('http://localhost:4000/auth/user/me', config);

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

            const filesRes = await axios.get('http://localhost:4000/records/user/' + JSON.parse(localStorage.getItem('userInfo'))._id, config);
            setFiles(filesRes.data);

            const resultsRes = await axios.get('http://localhost:4000/ai/results/' + JSON.parse(localStorage.getItem('userInfo'))._id, config);
            setResults(resultsRes.data);
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const createAbhaIdHandler = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));

            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // Use email as ABHA ID
            const response = await axios.post('http://localhost:4000/abha/connect', {
                abhaId: userInfo.email
            }, config);

            setAbhaId(userInfo.email);
            setAbhaConnected(true);

            // Show success modal
            setModalState({
                isOpen: true,
                type: 'success',
                title: 'ABHA ID Created Successfully!',
                message: 'Doctors can now search for you using this email for consent-based health record access.',
                abhaId: userInfo.email
            });

            // Refresh data to show newly connected ABHA info
            fetchUserData(userInfo.token);
        } catch (error) {
            console.error('ABHA creation error:', error);

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
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.post('http://localhost:4000/ai/analyze', {}, config);
            setResults([data, ...results]);
        } catch (error) {
            alert('Analysis failed: ' + (error.response?.data?.message || error.message));
        } finally {
            setAnalyzing(false);
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileAnalysis, setFileAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);

    const handleFileClick = async (file) => {
        setSelectedFile(file);
        setLoadingAnalysis(true);
        setFileAnalysis(null);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get(`http://localhost:4000/records/analysis/${file.gridFsId}`, config);
            setFileAnalysis(data);
        } catch (error) {
            console.error("Error fetching analysis", error);
        } finally {
            setLoadingAnalysis(false);
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

            {/* File Details Modal */}
            {selectedFile && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col"
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
                                onClick={() => setSelectedFile(null)}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        <div className="p-6 overflow-y-auto">
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

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
                            <a
                                href={`http://localhost:4000/records/file/${selectedFile.gridFsId}`}
                                target="_blank"
                                rel="noreferrer"
                                className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                View Original File
                            </a>
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* ABHA Card */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden"
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
                                        <button
                                            onClick={createAbhaIdHandler}
                                            className="w-full px-5 py-3 rounded-xl text-sm font-semibold bg-white text-blue-600 hover:bg-blue-50 shadow-lg transition-all"
                                        >
                                            Create ABHA ID
                                        </button>
                                    </div>
                                )}
                            </div>
                        </motion.div>

                        {/* Upload Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                                <FileText className="h-5 w-5 text-primary" />
                                Upload Records
                            </h2>
                            <FileUpload onUploadSuccess={() => fetchData(user.token)} />
                        </motion.div>

                        {/* Recent Files */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Uploads</h2>
                            {files.length === 0 ? (
                                <div className="text-center py-8 text-gray-400">
                                    <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>No files uploaded yet</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
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
                                                <div>
                                                    <p className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors">{file.filename}</p>
                                                    <p className="text-xs text-gray-500">{new Date(file.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <span className="text-xs font-medium px-2 py-1 bg-white rounded border border-gray-200 text-gray-600 uppercase">
                                                {file.fileType.split('/')[1]}
                                            </span>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 }}
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

                        {/* Latest Result */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6"
                        >
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Latest Assessment</h3>

                            {results.length > 0 ? (
                                <>
                                    <RiskGauge score={results[0].riskScore || 0} />

                                    <div className="mt-6 space-y-4">
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-500">Cancer Stage</span>
                                            <span className="font-bold text-gray-900">{results[0].cancerStage || 'Not Detected'}</span>
                                        </div>
                                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                                            <span className="text-sm text-gray-500">AI Confidence</span>
                                            <span className="font-bold text-gray-900">{results[0].confidence}%</span>
                                        </div>

                                        {/* Organ Risk */}
                                        {results[0].organRisk && (
                                            <div className="p-3 bg-gray-50 rounded-xl space-y-2">
                                                <span className="text-sm text-gray-500 block mb-2">Organ Specific Risk</span>
                                                {Object.entries(results[0].organRisk).map(([organ, risk]) => (
                                                    <div key={organ} className="flex items-center gap-2">
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

                                    <div className="mt-6">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Analysis Summary</h4>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                            {results[0].explanation?.substring(0, 150)}...
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-12 text-gray-400">
                                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                                    <p>No analysis results yet</p>
                                </div>
                            )}
                        </motion.div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default Dashboard;
