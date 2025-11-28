import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, XCircle, Clock, User, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import AnimatedButton from '../components/ui/AnimatedButton';

const DoctorDashboard = () => {
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [reviewNotes, setReviewNotes] = useState('');

    useEffect(() => {
        fetchResults();
    }, []);

    const fetchResults = async () => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
            const { data } = await axios.get('http://localhost:4000/doctor/results', config);
            setResults(data);
        } catch (error) {
            console.error("Error fetching results", error);
        } finally {
            setLoading(false);
        }
    };

    const submitReview = async (resultId, decision) => {
        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };

            await axios.post('http://localhost:4000/doctor/review', {
                resultId,
                decision,
                notes: reviewNotes
            }, config);

            alert('Review submitted successfully');
            setReviewNotes('');
            setExpandedId(null);
            fetchResults(); // Refresh list
        } catch (error) {
            alert('Failed to submit review');
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Doctor Dashboard</h1>
                    <p className="text-gray-500">Review AI-generated cancer assessments</p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {results.map((result) => (
                            <motion.div
                                key={result._id}
                                layout
                                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div
                                    className="p-6 cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-between"
                                    onClick={() => setExpandedId(expandedId === result._id ? null : result._id)}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${result.riskScore > 70 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                            <span className="font-bold">{result.riskScore}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{result.userId?.name || 'Unknown Patient'}</h3>
                                            <p className="text-sm text-gray-500 flex items-center gap-2">
                                                <Clock className="h-3 w-3" />
                                                {new Date(result.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        {result.doctorReviewed ? (
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${result.doctorDecision === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {result.doctorDecision}
                                            </span>
                                        ) : (
                                            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-yellow-100 text-yellow-700">
                                                Pending Review
                                            </span>
                                        )}
                                        {expandedId === result._id ? <ChevronUp className="h-5 w-5 text-gray-400" /> : <ChevronDown className="h-5 w-5 text-gray-400" />}
                                    </div>
                                </div>

                                {expandedId === result._id && (
                                    <div className="p-6 border-t border-gray-100 bg-gray-50/50">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <Activity className="h-5 w-5 text-primary" />
                                                    AI Analysis
                                                </h4>
                                                <div className="space-y-3 text-sm">
                                                    <div className="flex justify-between p-3 bg-white rounded-lg border border-gray-100">
                                                        <span className="text-gray-500">Cancer Stage</span>
                                                        <span className="font-bold">{result.cancerStage}</span>
                                                    </div>
                                                    <div className="flex justify-between p-3 bg-white rounded-lg border border-gray-100">
                                                        <span className="text-gray-500">Confidence</span>
                                                        <span className="font-bold">{result.confidence}%</span>
                                                    </div>
                                                    <div className="p-3 bg-white rounded-lg border border-gray-100">
                                                        <span className="text-gray-500 block mb-2">Explanation</span>
                                                        <p className="text-gray-700 leading-relaxed">{result.explanation}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                                    <User className="h-5 w-5 text-primary" />
                                                    Doctor's Review
                                                </h4>

                                                {result.doctorReviewed ? (
                                                    <div className="bg-white p-4 rounded-xl border border-gray-100">
                                                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                                                        <p className="text-gray-800 mb-4">{result.doctorNotes || 'No notes provided.'}</p>
                                                        <div className="flex items-center gap-2 text-sm font-medium">
                                                            Status:
                                                            <span className={result.doctorDecision === 'approved' ? 'text-green-600' : 'text-red-600'}>
                                                                {result.doctorDecision.toUpperCase()}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="space-y-4">
                                                        <textarea
                                                            className="w-full p-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                            rows="4"
                                                            placeholder="Add clinical notes or observations..."
                                                            value={reviewNotes}
                                                            onChange={(e) => setReviewNotes(e.target.value)}
                                                        />
                                                        <div className="flex gap-3">
                                                            <AnimatedButton
                                                                onClick={() => submitReview(result._id, 'approved')}
                                                                className="flex-1 bg-green-600 hover:bg-green-700"
                                                            >
                                                                <CheckCircle className="h-4 w-4 mr-2" /> Approve AI
                                                            </AnimatedButton>
                                                            <AnimatedButton
                                                                onClick={() => submitReview(result._id, 'override')}
                                                                className="flex-1 bg-red-600 hover:bg-red-700"
                                                            >
                                                                <XCircle className="h-4 w-4 mr-2" /> Override
                                                            </AnimatedButton>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorDashboard;
