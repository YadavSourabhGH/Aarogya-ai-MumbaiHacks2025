import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const AnimatedButton = ({ children, className, onClick, variant = 'primary', ...props }) => {
    const variants = {
        primary: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg hover:shadow-primary/50",
        outline: "border-2 border-primary text-primary hover:bg-primary/10",
        ghost: "text-gray-600 hover:text-primary hover:bg-gray-100/50",
        danger: "bg-red-500 text-white hover:bg-red-600 shadow-md"
    };

    return (
        <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
                "px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2",
                variants[variant],
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </motion.button>
    );
};

export default AnimatedButton;
