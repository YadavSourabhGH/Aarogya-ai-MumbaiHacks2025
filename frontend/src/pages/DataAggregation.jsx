import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Upload, FileText, Image as ImageIcon, Loader2, Database } from 'lucide-react';

const DataAggregation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { abhaId, consentId } = location.state || {};

    const [fhirData, setFhirData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [questionnaire, setQuestionnaire] = useState({
        isSmoker: false,
        cigarettesPerDay: '',
        smokingYears: '',
        tobaccoOrGutka: false,
        persistentCough: false,
        coughingBlood: false,
        weightLoss: false,
        chestPainOrBreath: false,
        familyHistory: false,
        familyMember: '',
        alcoholConsumption: false,
        occupationalExposure: false,
        otherSymptoms: '',
        additionalNotes: ''
    });
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [uploadedRecords, setUploadedRecords] = useState([]);

    useEffect(() => {
        if (!abhaId) {
            navigate('/aarogya-ai/search');
            return;
        }
        fetchFHIRData();
        fetchUserRecords();
    }, [abhaId]);

    const fetchUserRecords = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // 1. Get Patient User ID from ABHA ID
            const userRes = await axios.get(`https://aarogya-ai-personal.onrender.com/abha/user/${abhaId}`, config);
            const patientId = userRes.data._id;

            // 2. Fetch Records for that Patient
            const { data } = await axios.get(`https://aarogya-ai-personal.onrender.com/records/user/${patientId}`, config);
            setUploadedRecords(data);
        } catch (error) {
            console.error('Error fetching user records:', error);
        }
    };

    const fetchFHIRData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`https://aarogya-ai-personal.onrender.com/abha/mock-data/${abhaId}`, config);
            setFhirData(data);

            // Pre-fill questionnaire if saved data exists
            if (data.savedQuestionnaire) {
                setQuestionnaire({
                    isSmoker: data.savedQuestionnaire.isSmoker || false,
                    smokingDuration: data.savedQuestionnaire.smokingDuration || '',
                    coughingBlood: data.savedQuestionnaire.coughingBlood || false,
                    familyHistory: data.savedQuestionnaire.familyHistory || false,
                    otherSymptoms: data.savedQuestionnaire.otherSymptoms || '',
                    additionalNotes: data.savedQuestionnaire.additionalNotes || ''
                });
            }

        } catch (error) {
            console.error('Error fetching FHIR data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setUploadedFile(file);
        }
    };

    const [selectedFile, setSelectedFile] = useState(null);
    const [fileAnalysis, setFileAnalysis] = useState(null);
    const [loadingAnalysis, setLoadingAnalysis] = useState(false);
    const [filePreviewUrl, setFilePreviewUrl] = useState(null);

    const handleFileClick = async (file) => {
        console.log("File clicked:", file);
        setSelectedFile(file);
        setLoadingAnalysis(true);
        setFileAnalysis(null);
        setFilePreviewUrl(null);

        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

        const fetchAnalysis = async () => {
            try {
                console.log("Fetching analysis for:", file.gridFsId);
                const analysisRes = await axios.get(`https://aarogya-ai-personal.onrender.com/records/analysis/${file.gridFsId}`, config);
                console.log("Analysis received:", analysisRes.data);
                setFileAnalysis(analysisRes.data);
            } catch (error) {
                console.error("Error fetching analysis", error);
            }
        };

        const fetchFile = async () => {
            try {
                console.log("Fetching file blob for:", file.gridFsId);
                const fileRes = await axios.get(`https://aarogya-ai-personal.onrender.com/records/file/${file.gridFsId}`, {
                    ...config,
                    responseType: 'blob'
                });
                console.log("File blob received, type:", fileRes.data.type);

                let blob = fileRes.data;
                if (file.filename.toLowerCase().endsWith('.pdf') && blob.type !== 'application/pdf') {
                    blob = new Blob([blob], { type: 'application/pdf' });
                }

                const url = URL.createObjectURL(blob);
                setFilePreviewUrl(url);
            } catch (error) {
                console.error("Error fetching file", error);
            }
        };

        await Promise.all([fetchAnalysis(), fetchFile()]);
        setLoadingAnalysis(false);
    };

    const handleCloseModal = () => {
        setSelectedFile(null);
        if (filePreviewUrl) {
            URL.revokeObjectURL(filePreviewUrl);
            setFilePreviewUrl(null);
        }
    };

    const runDiagnosis = async () => {
        setAnalyzing(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            // 1. Upload File if selected
            if (uploadedFile) {
                const formData = new FormData();
                formData.append('file', uploadedFile);
                formData.append('abhaId', abhaId);
                formData.append('type', 'report'); // Default type
                formData.append('category', 'General');

                try {
                    await axios.post('https://aarogya-ai-personal.onrender.com/doctor/upload', formData, {
                        headers: {
                            ...config.headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                } catch (uploadError) {
                    console.error('File upload failed:', uploadError);
                    alert('File upload failed, but proceeding with analysis...');
                }
            }

            // 2. Save questionnaire data to patient profile
            await axios.put('https://aarogya-ai-personal.onrender.com/profile/questionnaire', {
                abhaId,
                questionnaireData: questionnaire
            }, config);

            // 2. Run Analysis
            const { data } = await axios.post('https://aarogya-ai-personal.onrender.com/ai/analyze', {
                abhaId,
                questionnaire
            }, config);

            // Navigate to processing page for simulation effect
            navigate('/aarogya-ai/processing', {
                state: {
                    analysisId: data._id,
                    abhaId: abhaId
                }
            });

        } catch (error) {
            console.error('Analysis failed:', error);
            alert('Analysis failed. Please try again.');
            setAnalyzing(false);
        }
    };

    // Extract data from FHIR
    const patient = fhirData?.entry?.find(e => e.resource.resourceType === 'Patient')?.resource;
    const hemoglobinObs = fhirData?.entry?.filter(e =>
        e.resource.resourceType === 'Observation' && e.resource.code?.text === 'Hemoglobin'
    ).map(e => e.resource);
    const xrayStudy = fhirData?.entry?.find(e =>
        e.resource.resourceType === 'ImagingStudy'
    )?.resource;

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pt-24 pb-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        360° Patient Profile
                    </h1>
                    <p className="text-gray-600">
                        Patient: {patient?.name?.[0]?.family || abhaId} | ID: <span className="font-mono text-sm">{abhaId}</span>
                    </p>
                </div>

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
                                            <div className="text-center py-12 text-gray-500">
                                                <p>Analysis details unavailable.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* LEFT PANEL: Auto-Fetched Data */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Activity className="w-5 h-5 text-medical-blue" />
                            <h2 className="text-xl font-bold text-gray-800">Auto-Fetched Health Records</h2>
                        </div>

                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 text-medical-blue animate-spin" />
                            </div>
                        ) : (
                            <>
                                {/* Uploaded Records */}
                                {uploadedRecords?.map((file) => (
                                    <motion.div
                                        key={file._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        onClick={() => handleFileClick(file)}
                                        className="glass rounded-2xl p-6 mb-4 cursor-pointer hover:shadow-lg transition-all duration-200 border border-transparent hover:border-blue-200"
                                    >
                                        <h3 className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                            <FileText className="w-4 h-4 text-blue-600" />
                                            {file.filename}
                                        </h3>
                                        <div className="flex justify-between items-center text-sm text-gray-500">
                                            <span>{new Date(file.createdAt).toLocaleDateString()}</span>
                                            <span className="uppercase text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                {file.fileType.split('/')[1]}
                                            </span>
                                        </div>
                                    </motion.div>
                                ))}

                                {/* CBC Trend */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="glass rounded-2xl p-6"
                                >
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <FileText className="w-4 h-4 text-red-500" />
                                        CBC Report - Hemoglobin Trend
                                    </h3>
                                    <div className="space-y-3">
                                        {hemoglobinObs?.map((obs, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-100">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-700">
                                                        {new Date(obs.effectiveDateTime).toLocaleDateString()}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {obs.interpretation?.[0]?.text || 'Normal'}
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-lg font-bold text-gray-900">
                                                        {obs.valueQuantity.value} {obs.valueQuantity.unit}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {fhirData?.trends?.hemoglobin?.alert && (
                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                                                <p className="text-sm font-medium text-amber-800">
                                                    ⚠️ Declining Trend: {fhirData.trends.hemoglobin.change} g/dL over 6 months
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </motion.div>

                                {/* X-Ray */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2 }}
                                    className="glass rounded-2xl p-6"
                                >
                                    <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4 text-blue-500" />
                                        Chest X-Ray
                                    </h3>
                                    {xrayStudy && (
                                        <div className="bg-white rounded-lg border border-gray-100 p-4">
                                            <p className="text-sm font-medium text-gray-700 mb-2">
                                                {xrayStudy.description}
                                            </p>
                                            <p className="text-xs text-gray-500 mb-3">
                                                Date: {new Date(xrayStudy.started).toLocaleDateString()}
                                            </p>
                                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                                                <p className="text-sm text-yellow-900">
                                                    {xrayStudy.note?.[0]?.text}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            </>
                        )}
                    </div>

                    {/* RIGHT PANEL: Questionnaire */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FileText className="w-5 h-5 text-medical-teal" />
                            <h2 className="text-xl font-bold text-gray-800">Real-Time Assessment</h2>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="glass rounded-2xl p-6 space-y-6"
                        >
                            {/* 1. Lifestyle Factors */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 border-b pb-2">1. Lifestyle Factors</h3>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.isSmoker}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, isSmoker: e.target.checked })}
                                        className="w-5 h-5 text-medical-blue rounded focus:ring-2 focus:ring-medical-blue"
                                    />
                                    <span className="text-gray-700 font-medium">Do you smoke?</span>
                                </label>

                                {questionnaire.isSmoker && (
                                    <div className="pl-8 grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Cigarettes per day</label>
                                            <input
                                                type="number"
                                                value={questionnaire.cigarettesPerDay}
                                                onChange={(e) => setQuestionnaire({ ...questionnaire, cigarettesPerDay: e.target.value })}
                                                placeholder="e.g. 10"
                                                className="w-full px-3 py-2 rounded border border-gray-200 focus:border-medical-blue outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Years smoking</label>
                                            <input
                                                type="number"
                                                value={questionnaire.smokingYears}
                                                onChange={(e) => setQuestionnaire({ ...questionnaire, smokingYears: e.target.value })}
                                                placeholder="e.g. 5"
                                                className="w-full px-3 py-2 rounded border border-gray-200 focus:border-medical-blue outline-none text-sm"
                                            />
                                        </div>
                                    </div>
                                )}

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.tobaccoOrGutka}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, tobaccoOrGutka: e.target.checked })}
                                        className="w-5 h-5 text-medical-blue rounded focus:ring-2 focus:ring-medical-blue"
                                    />
                                    <span className="text-gray-700 font-medium">Do you chew tobacco or gutka?</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.alcoholConsumption}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, alcoholConsumption: e.target.checked })}
                                        className="w-5 h-5 text-medical-blue rounded focus:ring-2 focus:ring-medical-blue"
                                    />
                                    <span className="text-gray-700 font-medium">Do you drink alcohol?</span>
                                </label>
                            </div>

                            {/* 2. Symptoms (Red-Flag Indicators) */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 border-b pb-2 text-red-600">2. Symptoms (Red-Flag Indicators)</h3>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.persistentCough}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, persistentCough: e.target.checked })}
                                        className="w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 font-medium">Cough lasting more than 3 weeks?</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.coughingBlood}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, coughingBlood: e.target.checked })}
                                        className="w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 font-medium">Coughing blood? (Hemoptysis)</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.weightLoss}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, weightLoss: e.target.checked })}
                                        className="w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 font-medium">Unexplained weight loss recently?</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.chestPainOrBreath}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, chestPainOrBreath: e.target.checked })}
                                        className="w-5 h-5 text-red-500 rounded focus:ring-2 focus:ring-red-500"
                                    />
                                    <span className="text-gray-700 font-medium">Chest pain or shortness of breath?</span>
                                </label>
                            </div>

                            {/* 3. Family History & Environment */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 border-b pb-2 text-green-700">3. Family History & Environment</h3>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.familyHistory}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, familyHistory: e.target.checked })}
                                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-600"
                                    />
                                    <span className="text-gray-700 font-medium">Family history of cancer?</span>
                                </label>

                                {questionnaire.familyHistory && (
                                    <div className="pl-8">
                                        <label className="block text-xs text-gray-500 mb-1">Which family member?</label>
                                        <select
                                            value={questionnaire.familyMember}
                                            onChange={(e) => setQuestionnaire({ ...questionnaire, familyMember: e.target.value })}
                                            className="w-full px-3 py-2 rounded border border-gray-200 focus:border-green-600 outline-none text-sm bg-white"
                                        >
                                            <option value="">Select...</option>
                                            <option value="Mother">Mother</option>
                                            <option value="Father">Father</option>
                                            <option value="Sibling">Sibling</option>
                                            <option value="Grandparent">Grandparent</option>
                                            <option value="Other">Other</option>
                                        </select>
                                    </div>
                                )}

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.occupationalExposure}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, occupationalExposure: e.target.checked })}
                                        className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-600"
                                    />
                                    <span className="text-gray-700 font-medium">Exposed to dust, chemicals, or smoke at work?</span>
                                </label>
                            </div>

                            {/* Other Symptoms Textarea */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Symptoms / Notes
                                </label>
                                <textarea
                                    value={questionnaire.otherSymptoms}
                                    onChange={(e) => setQuestionnaire({ ...questionnaire, otherSymptoms: e.target.value })}
                                    rows="2"
                                    placeholder="Any other symptoms..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none resize-none"
                                />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Upload Fresh Blood Test / X-Ray
                                </label>
                                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-medical-blue hover:bg-blue-50 transition-all duration-200">
                                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600">
                                        {uploadedFile ? uploadedFile.name : 'Click to upload or drag & drop'}
                                    </span>
                                    <input
                                        type="file"
                                        onChange={handleFileUpload}
                                        accept="image/*,.pdf"
                                        className="hidden"
                                    />
                                </label>
                            </div>

                            {/* Additional Notes */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    value={questionnaire.additionalNotes}
                                    onChange={(e) => setQuestionnaire({ ...questionnaire, additionalNotes: e.target.value })}
                                    rows="2"
                                    placeholder="Clinical observations..."
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none resize-none"
                                />
                            </div>
                        </motion.div>

                        {/* Run AI Diagnosis Button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            onClick={runDiagnosis}
                            disabled={analyzing}
                            className="w-full medical-gradient text-white font-bold text-lg py-5 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                            {analyzing ? (
                                <span className="flex items-center justify-center gap-3">
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                    Initiating Analysis...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center gap-3">
                                    <Activity className="w-6 h-6" />
                                    RUN AI DIAGNOSIS
                                </span>
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataAggregation;
