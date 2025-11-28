import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const ShapChart = ({ factors }) => {
    if (!factors || factors.length === 0) return null;

    // Sort by impact magnitude
    const sortedFactors = [...factors].sort((a, b) => b.impact - a.impact);

    return (
        <div className="space-y-3">
            {sortedFactors.map((factor, idx) => {
                const isIncrease = factor.direction === 'increase';
                const barColor = isIncrease ? 'bg-red-500' : 'bg-green-500';
                const textColor = isIncrease ? 'text-red-700' : 'text-green-700';

                return (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        className="relative"
                    >
                        <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                                {isIncrease ? (
                                    <TrendingUp className="w-4 h-4 text-red-500" />
                                ) : (
                                    <TrendingDown className="w-4 h-4 text-green-500" />
                                )}
                                <span className="text-sm font-medium text-gray-700">{factor.name}</span>
                            </div>
                            <span className={`text-sm font-bold ${textColor}`}>
                                {isIncrease ? '+' : '-'}{factor.impact}%
                            </span>
                        </div>

                        <div className="h-8 bg-gray-100 rounded-lg overflow-hidden relative">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(factor.impact / 35) * 100}%` }} // Scale to max 35% impact
                                transition={{ duration: 0.8, ease: 'easeOut', delay: idx * 0.1 }}
                                className={`h-full ${barColor} rounded-lg flex items-center px-3`}
                            >
                                <span className="text-xs text-white font-medium truncate">
                                    {factor.value}
                                </span>
                            </motion.div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ShapChart;
