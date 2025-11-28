import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, X } from 'lucide-react';

const AbhaModal = ({ isOpen, onClose, type, title, message, abhaId }) => {
    if (!isOpen) return null;

    const isSuccess = type === 'success';

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', duration: 0.3 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 transition-colors z-10"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>

                            {/* Content */}
                            <div className="p-8 text-center">
                                {/* Icon */}
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                                    className="mb-6"
                                >
                                    {isSuccess ? (
                                        <div className="w-20 h-20 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                                            <CheckCircle className="w-12 h-12 text-green-600" />
                                        </div>
                                    ) : (
                                        <div className="w-20 h-20 mx-auto rounded-full bg-red-100 flex items-center justify-center">
                                            <XCircle className="w-12 h-12 text-red-600" />
                                        </div>
                                    )}
                                </motion.div>

                                {/* Title */}
                                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                    {title}
                                </h2>

                                {/* Message */}
                                <p className="text-gray-600 mb-6 leading-relaxed">
                                    {message}
                                </p>

                                {/* ABHA ID Display (if success) */}
                                {isSuccess && abhaId && (
                                    <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100">
                                        <p className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">
                                            Your ABHA ID
                                        </p>
                                        <p className="font-mono font-bold text-blue-900 text-lg break-all">
                                            {abhaId}
                                        </p>
                                        <p className="text-xs text-blue-600 mt-2">
                                            ✓ Doctors can now search for you using this email
                                        </p>
                                    </div>
                                )}

                                {/* Action Button */}
                                <button
                                    onClick={onClose}
                                    className={`w-full py-3 px-6 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl ${isSuccess
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700'
                                            : 'bg-gray-900 text-white hover:bg-gray-800'
                                        }`}
                                >
                                    {isSuccess ? 'Got it!' : 'Try Again'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default AbhaModal;
