import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, Upload, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

const DataAggregation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { abhaId, consentId } = location.state || {};

    const [fhirData, setFhirData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [questionnaire, setQuestionnaire] = useState({
        isSmoker: false,
        smokingDuration: '',
        coughingBlood: false,
        familyHistory: false,
        otherSymptoms: '',
        additionalNotes: ''
    });
    const [uploadedFile, setUploadedFile] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    useEffect(() => {
        if (!abhaId) {
            navigate('/curesight/search');
            return;
        }
        fetchFHIRData();
    }, [abhaId]);

    const fetchFHIRData = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get(`http://localhost:4000/abha/mock-data/${abhaId}`, config);
            setFhirData(data);

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

    const runDiagnosis = async () => {
        setAnalyzing(true);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.post('http://localhost:4000/ai/analyze', {
                questionnaire,
                consentId
            }, config);

            // Navigate to processing screen
            navigate('/curesight/processing', {
                state: { analysisId: data._id, abhaId }
            });

        } catch (error) {
            console.error('Analysis error:', error);
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
                            {/* Checkboxes */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.isSmoker}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, isSmoker: e.target.checked })}
                                        className="w-5 h-5 text-medical-blue rounded focus:ring-2 focus:ring-medical-blue"
                                    />
                                    <span className="text-gray-700 font-medium">Smoker?</span>
                                </label>

                                {questionnaire.isSmoker && (
                                    <input
                                        type="text"
                                        value={questionnaire.smokingDuration}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, smokingDuration: e.target.value })}
                                        placeholder="e.g., 20+ cigarettes/day for 25 years"
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-medical-blue focus:ring-2 focus:ring-medical-blue/20 outline-none"
                                    />
                                )}

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.coughingBlood}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, coughingBlood: e.target.checked })}
                                        className="w-5 h-5 text-medical-blue rounded focus:ring-2 focus:ring-medical-blue"
                                    />
                                    <span className="text-gray-700 font-medium">Coughing blood? (Hemoptysis)</span>
                                </label>

                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={questionnaire.familyHistory}
                                        onChange={(e) => setQuestionnaire({ ...questionnaire, familyHistory: e.target.checked })}
                                        className="w-5 h-5 text-medical-blue rounded focus:ring-2 focus:ring-medical-blue"
                                    />
                                    <span className="text-gray-700 font-medium">Family History of Cancer?</span>
                                </label>
                            </div>

                            {/* Other Symptoms */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Other Symptoms
                                </label>
                                <textarea
                                    value={questionnaire.otherSymptoms}
                                    onChange={(e) => setQuestionnaire({ ...questionnaire, otherSymptoms: e.target.value })}
                                    rows="3"
                                    placeholder="e.g., persistent cough, weight loss, chest pain..."
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
