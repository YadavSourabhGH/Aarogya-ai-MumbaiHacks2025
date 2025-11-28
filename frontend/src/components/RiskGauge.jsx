import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

const RiskGauge = ({ score }) => {
    const data = [
        { name: 'Score', value: score },
        { name: 'Remaining', value: 100 - score },
    ];

    let color = '#10b981'; // Green
    if (score > 30) color = '#f59e0b'; // Yellow
    if (score > 70) color = '#ef4444'; // Red

    return (
        <div className="relative h-64 w-full flex flex-col items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        dataKey="value"
                        startAngle={180}
                        endAngle={0}
                        data={data}
                        cx="50%"
                        cy="70%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={0}
                        stroke="none"
                    >
                        <Cell fill={color} className="drop-shadow-lg" />
                        <Cell fill="#f3f4f6" />
                    </Pie>
                </PieChart>
            </ResponsiveContainer>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
                className="absolute bottom-10 flex flex-col items-center"
            >
                <span className="text-5xl font-bold text-gray-800" style={{ color }}>{score}%</span>
                <span className="text-sm text-gray-500 font-medium uppercase tracking-wider mt-1">Risk Probability</span>
            </motion.div>
        </div>
    );
};

export default RiskGauge;
