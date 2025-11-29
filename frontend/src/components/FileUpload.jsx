import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { Upload, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';

const FileUpload = ({ onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('tags', 'report,upload');

        setUploading(true);
        setMessage(null);

        try {
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${userInfo.token}`,
                },
            };

            await axios.post('https://aarogya-ai-personal.onrender.com/records/upload', formData, config);

            setMessage({ type: 'success', text: 'File uploaded successfully!' });
            if (onUploadSuccess) onUploadSuccess();
        } catch (error) {
            setMessage({ type: 'error', text: error.response?.data?.message || 'Upload failed' });
        } finally {
            setUploading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

    return (
        <div className="w-full">
            <motion.div
                {...getRootProps()}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                className={cn(
                    "border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 relative overflow-hidden group",
                    isDragActive
                        ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                        : "border-gray-200 hover:border-primary hover:bg-gray-50"
                )}
            >
                <input {...getInputProps()} />

                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
                    <div className={cn(
                        "h-16 w-16 rounded-full flex items-center justify-center transition-all duration-300",
                        isDragActive ? "bg-primary/20 text-primary" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                    )}>
                        <Upload className="h-8 w-8" />
                    </div>
                    <div>
                        <p className="text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                            {isDragActive ? 'Drop it like it\'s hot!' : 'Click or Drag files here'}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Supported formats: PDF, JPG, PNG</p>
                    </div>
                </div>
            </motion.div>

            <AnimatePresence>
                {uploading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="mt-4 flex items-center justify-center text-sm text-primary font-medium bg-primary/5 p-3 rounded-xl"
                    >
                        <Loader className="animate-spin h-4 w-4 mr-2" />
                        Processing your medical record...
                    </motion.div>
                )}

                {message && !uploading && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={cn(
                            "mt-4 p-3 rounded-xl flex items-center text-sm font-medium",
                            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                        )}
                    >
                        {message.type === 'success' ? <CheckCircle className="h-4 w-4 mr-2" /> : <AlertCircle className="h-4 w-4 mr-2" />}
                        {message.text}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FileUpload;
