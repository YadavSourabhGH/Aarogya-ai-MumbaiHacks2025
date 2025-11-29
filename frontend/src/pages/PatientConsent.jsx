import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Clock } from 'lucide-react';

const PatientConsent = () => {
    const [pendingConsent, setPendingConsent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        // Check authentication
        const userInfo = localStorage.getItem('userInfo');
        if (!userInfo) {
            navigate('/login');
            return;
        }

        fetchPendingConsent();

        // Poll for consent updates every 3 seconds
        const interval = setInterval(fetchPendingConsent, 3000);
        return () => clearInterval(interval);
    }, []);

    const fetchPendingConsent = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            const { data } = await axios.get('https://aarogya-ai-personal.onrender.com/auth/user/me', config);

            if (data.pendingConsent && data.pendingConsent.status === 'pending') {
                setPendingConsent(data.pendingConsent);
            } else {
                setPendingConsent(null);
            }
        } catch (error) {
            console.error('Error fetching consent:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async () => {
        if (!pendingConsent) return;

        setProcessing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post(`https://aarogya-ai-personal.onrender.com/consent/approve/${pendingConsent.consentId}`, {}, config);

            setPendingConsent(null);
            // Show success message
            alert('Consent approved successfully!');
        } catch (error) {
            console.error('Approval error:', error);
            alert('Failed to approve consent');
        } finally {
            setProcessing(false);
        }
    };

    const handleReject = async () => {
        if (!pendingConsent) return;

        setProcessing(true);
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post(`https://aarogya-ai-personal.onrender.com/consent/reject/${pendingConsent.consentId}`, {}, config);

            setPendingConsent(null);
            alert('Consent rejected');
        } catch (error) {
            console.error('Rejection error:', error);
            alert('Failed to reject consent');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <Clock className="w-12 h-12 text-medical-blue mx-auto mb-4 animate-spin" />
                    <p className="text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!pendingConsent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <Shield className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700 mb-2">No Pending Consents</h2>
                    <p className="text-gray-500">
                        You don't have any consent requests at the moment.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-2xl p-8 max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Shield className="w-16 h-16 text-medical-blue mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Consent Request</h1>
                    <p className="text-gray-600">
                        {pendingConsent?.doctorName || 'A doctor'} is requesting access to your medical records
                    </p>
                </div>

                {/* Consent Details */}
                <div className="space-y-4 mb-8">
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-4">Access Permission</h3>
                        <ul className="space-y-2">
                            <li className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Health Records</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Blood Reports (CBC)</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>X-Rays and Imaging</span>
                            </li>
                            <li className="flex items-start gap-2 text-sm text-blue-800">
                                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Medical History</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
                        <h3 className="font-bold text-purple-900 mb-2">Purpose</h3>
                        <p className="text-sm text-purple-800">
                            Cancer Screening via Aarogya AI AI
                        </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                        <h3 className="font-bold text-amber-900 mb-2">Valid For</h3>
                        <p className="text-sm text-amber-800">
                            1 hour from approval
                        </p>
                    </div>

                    {pendingConsent.requestedAt && (
                        <div className="text-center text-xs text-gray-500">
                            Requested {new Date(pendingConsent.requestedAt).toLocaleString()}
                        </div>
                    )}
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={handleReject}
                        disabled={processing}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <XCircle className="w-5 h-5 " />
                        DENY
                    </button>
                    <button
                        onClick={handleApprove}
                        disabled={processing}
                        className="medical-gradient text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <CheckCircle className="w-5 h-5" />
                        {processing ? 'APPROVING...' : 'ALLOW'}
                    </button>
                </div>

                {/* Security Note */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                    <p className="text-xs text-gray-500 text-center">
                        🔒 Your data is encrypted and protected by DEPA framework.
                        This consent can be revoked anytime from your dashboard.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default PatientConsent;
