import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay }}
            whileHover={{ y: -5 }}
            className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group"
        >
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <Icon className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-gray-600 leading-relaxed">{description}</p>
        </motion.div>
    );
};

export default FeatureCard;
