import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import {
    Activity, Server, Database, Shield,
    ArrowRight, RefreshCw, Play, CheckCircle,
    TrendingUp, Users, Lock, Zap, Globe, Cpu
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

const FederatedDashboard = () => {
    const [globalState, setGlobalState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [simulating, setSimulating] = useState(false);

    useEffect(() => {
        fetchGlobalState();
        const interval = setInterval(fetchGlobalState, 2000);
        return () => clearInterval(interval);
    }, []);

    const fetchGlobalState = async () => {
        try {
            const { data } = await axios.get('https://aarogya-ai-personal.onrender.com/federated/state');
            setGlobalState(data);
            setLoading(false);
        } catch (error) {
            console.error("Error fetching state", error);
        }
    };

    const startSimulation = async () => {
        if (simulating || globalState?.status !== 'idle') return;

        setSimulating(true);
        try {
            // Register hospitals if needed
            if (globalState.participatingHospitals.length === 0) {
                await Promise.all([
                    axios.post('https://aarogya-ai-personal.onrender.com/federated/register', { id: 'h1', name: 'City General Hospital' }),
                    axios.post('https://aarogya-ai-personal.onrender.com/federated/register', { id: 'h2', name: 'Memorial Sloan Kettering' }),
                    axios.post('https://aarogya-ai-personal.onrender.com/federated/register', { id: 'h3', name: 'Mayo Clinic' })
                ]);
            }

            await axios.post('https://aarogya-ai-personal.onrender.com/federated/start-round');

            // Trigger updates with slight delays
            const hospitals = ['h1', 'h2', 'h3'];
            hospitals.forEach((hId, index) => {
                setTimeout(async () => {
                    try {
                        await axios.post('https://aarogya-ai-personal.onrender.com/federated/submit-update', { id: hId });
                    } catch (e) {
                        console.error(`Error submitting update for ${hId}`, e);
                    }
                }, (index + 1) * 1500); // Staggered updates
            });

        } catch (error) {
            console.error("Simulation error", error);
        } finally {
            // Ensure local loading state is reset
            setTimeout(() => setSimulating(false), 2000);
        }
    };

    const resetSimulation = async () => {
        await axios.post('https://aarogya-ai-personal.onrender.com/federated/reset');
        fetchGlobalState();
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-slate-500 font-medium">Initializing Network...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            {/* Navigation Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <a
                                href="/dashboard"
                                className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
                            >
                                <ArrowRight className="h-5 w-5 rotate-180" />
                                <span className="font-medium">Back to Dashboard</span>
                            </a>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-slate-500">
                                {JSON.parse(localStorage.getItem('userInfo') || '{}')?.name || 'User'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Title Section */}
                <div className="mb-10 flex flex-col items-center text-center">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/30">
                            <Shield className="h-8 w-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">
                            Federated Learning Network
                        </h1>
                    </div>
                    <p className="text-slate-500 mt-1 text-lg max-w-2xl">
                        Privacy-preserving distributed training simulation across secure nodes.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-center gap-4 mb-10">
                    <button
                        onClick={resetSimulation}
                        className="px-5 py-2.5 text-slate-600 hover:bg-white hover:shadow-sm border border-slate-200 bg-slate-50 rounded-xl flex items-center gap-2 transition-all font-medium"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </button>
                    <button
                        onClick={startSimulation}
                        disabled={simulating || globalState?.status !== 'idle'}
                        className={`px-8 py-2.5 rounded-xl font-bold text-white flex items-center gap-2 shadow-lg transition-all transform active:scale-95 ${simulating || globalState?.status !== 'idle'
                            ? 'bg-slate-300 cursor-not-allowed shadow-none'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-blue-200 hover:-translate-y-0.5'
                            }`}
                    >
                        {globalState?.status === 'idle' ? <Play className="h-4 w-4 fill-current" /> : <Activity className="h-4 w-4 animate-spin" />}
                        {globalState?.status === 'idle' ? 'Start New Round' : 'Training in Progress...'}
                    </button>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
                    <StatCard
                        icon={<RefreshCw className="h-6 w-6 text-blue-600" />}
                        label="Training Rounds"
                        value={`${globalState?.history.length} Completed`}
                        subValue={`Current Round: #${globalState?.round}`}
                        color="blue"
                    />
                    <StatCard
                        icon={<TrendingUp className="h-6 w-6 text-emerald-600" />}
                        label="Global Accuracy"
                        value={`${(globalState?.globalAccuracy * 100).toFixed(1)}%`}
                        subValue="+2.4% from last round"
                        color="emerald"
                        trend="up"
                    />
                    <StatCard
                        icon={<Users className="h-6 w-6 text-violet-600" />}
                        label="Active Nodes"
                        value={`${globalState?.participatingHospitals.length} Hospitals`}
                        subValue="All nodes online"
                        color="violet"
                    />
                    <StatCard
                        icon={<Lock className="h-6 w-6 text-amber-600" />}
                        label="Data Privacy"
                        value="100% Local"
                        subValue="No raw data transfer"
                        color="amber"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Network Visualization */}
                    <div className="lg:col-span-2 bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative min-h-[600px] flex flex-col">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 to-white/50 pointer-events-none"></div>

                        <div className="relative z-10 p-8 flex-1 flex flex-col">
                            <div className="flex justify-between items-center mb-12">
                                <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-blue-500" />
                                    Live Network Topology
                                </h3>
                                <div className="flex items-center gap-2 text-xs font-medium bg-slate-100 px-3 py-1.5 rounded-full text-slate-600">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                    System Operational
                                </div>
                            </div>

                            <div className="flex-1 relative w-full h-[500px] flex flex-col items-center justify-between py-10">
                                {/* SVG Layer for Connections */}
                                <svg
                                    className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
                                    viewBox="0 0 100 100"
                                    preserveAspectRatio="none"
                                >
                                    <defs>
                                        <style>
                                            {`
                                                @keyframes travel {
                                                    from { offset-distance: 100%; }
                                                    to { offset-distance: 0%; }
                                                }
                                                .packet-anim {
                                                    animation: travel 1.5s ease-in-out infinite;
                                                }
                                            `}
                                        </style>
                                    </defs>
                                    {globalState?.participatingHospitals.map((hospital, idx) => {
                                        const total = globalState.participatingHospitals.length;
                                        // Map index to 0-100 range for X coordinate
                                        // idx 0 -> 25%, idx 1 -> 50%, idx 2 -> 75% for 3 nodes
                                        const leftPos = (idx + 1) * (100 / (total + 1));

                                        // Coordinates in 0-100 space
                                        // Container height is fixed, so we map pixels to %
                                        // Server Bottom: 168px / 500px = 33.6%
                                        // Hospital Top: 332px / 500px = 66.4%

                                        const startX = 50;
                                        const startY = 33.6;
                                        const endX = leftPos;
                                        const endY = 66.4;

                                        // Control points for curve
                                        const cpY = 50; // Midpoint vertically

                                        return (
                                            <React.Fragment key={`path-${hospital.id}`}>
                                                <path
                                                    d={`M ${startX} ${startY} C 50 ${cpY}, ${endX} ${cpY}, ${endX} ${endY}`}
                                                    fill="none"
                                                    stroke="#cbd5e1"
                                                    strokeWidth="2"
                                                    strokeDasharray="6,6"
                                                    className="opacity-50"
                                                    vectorEffect="non-scaling-stroke"
                                                />

                                                {/* Data Packet Animation */}
                                                {hospital.status === 'completed' && globalState.status !== 'idle' && (
                                                    <circle
                                                        r="3"
                                                        fill="#3B82F6"
                                                        className="packet-anim"
                                                        style={{
                                                            offsetPath: `path("M ${startX} ${startY} C 50 ${cpY}, ${endX} ${cpY}, ${endX} ${endY}")`
                                                        }}
                                                    >
                                                        <title>Weight Update Packet</title>
                                                    </circle>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </svg>

                                {/* Central Server Node */}
                                <motion.div
                                    animate={{
                                        scale: globalState?.status === 'aggregating' ? [1, 1.05, 1] : 1,
                                        boxShadow: globalState?.status === 'aggregating'
                                            ? "0 0 60px rgba(59, 130, 246, 0.4)"
                                            : "0 20px 40px -10px rgba(59, 130, 246, 0.2)"
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="w-32 h-32 bg-white rounded-full flex items-center justify-center relative z-20 border-4 border-blue-50"
                                >
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 opacity-10"></div>
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-2 shadow-lg shadow-blue-500/30">
                                            <Server className="h-8 w-8 text-white" />
                                        </div>
                                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap">
                                            <p className="font-bold text-slate-800">Central Server</p>
                                            <p className="text-xs text-slate-500 font-medium">Aggregating Weights</p>
                                        </div>
                                    </div>
                                </motion.div>

                                {/* Hospital Nodes Container */}
                                <div className="w-full relative h-32">
                                    {globalState?.participatingHospitals.map((hospital, idx) => {
                                        const total = globalState.participatingHospitals.length;
                                        const leftPos = `${(idx + 1) * (100 / (total + 1))}%`;

                                        return (
                                            <div
                                                key={hospital.id}
                                                className="absolute top-0 transform -translate-x-1/2 transition-all duration-500 flex flex-col items-center"
                                                style={{ left: leftPos }}
                                            >
                                                <motion.div
                                                    animate={{
                                                        y: hospital.status === 'training' ? [0, -8, 0] : 0,
                                                    }}
                                                    transition={{ duration: 2, repeat: Infinity }}
                                                    className={`w-20 h-20 bg-white rounded-2xl shadow-xl flex flex-col items-center justify-center relative z-20 border transition-colors duration-300 ${hospital.status === 'completed' ? 'border-emerald-400 shadow-emerald-100' :
                                                        hospital.status === 'training' ? 'border-blue-400 shadow-blue-100' : 'border-slate-100'
                                                        }`}
                                                >
                                                    {hospital.status === 'training' && (
                                                        <div className="absolute inset-0 bg-blue-50 rounded-2xl animate-pulse"></div>
                                                    )}

                                                    <div className="relative z-10">
                                                        {hospital.status === 'completed' ? (
                                                            <CheckCircle className="h-8 w-8 text-emerald-500" />
                                                        ) : hospital.status === 'training' ? (
                                                            <Cpu className="h-8 w-8 text-blue-500 animate-pulse" />
                                                        ) : (
                                                            <Database className="h-8 w-8 text-slate-400" />
                                                        )}
                                                    </div>

                                                    {hospital.status === 'completed' && (
                                                        <motion.div
                                                            initial={{ scale: 0 }}
                                                            animate={{ scale: 1 }}
                                                            className="absolute -top-2 -right-2 bg-emerald-500 text-white p-0.5 rounded-full shadow-lg"
                                                        >
                                                            <CheckCircle className="h-2.5 w-2.5" />
                                                        </motion.div>
                                                    )}
                                                </motion.div>

                                                <div className="text-center mt-4">
                                                    <p className="text-sm font-bold text-slate-700 whitespace-nowrap">{hospital.name}</p>
                                                    <div className={`text-[10px] font-bold uppercase tracking-wider mt-1 px-2 py-0.5 rounded-full inline-block ${hospital.status === 'training' ? 'bg-blue-100 text-blue-700' :
                                                        hospital.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                            'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {hospital.status === 'idle' ? 'Ready' :
                                                            hospital.status === 'training' ? 'Training...' : 'Sent Update'}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Charts */}
                    <div className="space-y-6">
                        <ChartCard title="Model Accuracy">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={globalState?.history}>
                                    <defs>
                                        <linearGradient id="colorAccuracy" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="round" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                    <YAxis domain={[0.6, 1]} axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="accuracy"
                                        stroke="#3B82F6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAccuracy)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>

                        <ChartCard title="Training Loss">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={globalState?.history}>
                                    <defs>
                                        <linearGradient id="colorLoss" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="round" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94A3B8' }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area
                                        type="monotone"
                                        dataKey="loss"
                                        stroke="#EF4444"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorLoss)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </ChartCard>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper Components
const StatCard = ({ icon, label, value, subValue, color, trend }) => {
    const colorClasses = {
        blue: 'bg-blue-50 text-blue-600',
        emerald: 'bg-emerald-50 text-emerald-600',
        violet: 'bg-violet-50 text-violet-600',
        amber: 'bg-amber-50 text-amber-600',
    };

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-xs font-bold px-2 py-1 bg-emerald-50 text-emerald-600 rounded-full flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {trend === 'up' ? '+' : '-'}{value.split('%')[0]}%
                    </span>
                )}
            </div>
            <h3 className="text-slate-500 text-sm font-medium mb-1">{label}</h3>
            <p className="text-2xl font-bold text-slate-900 tracking-tight">{value}</p>
            <p className="text-xs text-slate-400 mt-2 font-medium">{subValue}</p>
        </div>
    );
};

const ChartCard = ({ title, children }) => (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-[300px] flex flex-col">
        <h3 className="text-base font-bold text-slate-900 mb-6">{title}</h3>
        <div className="flex-1 w-full min-h-0">
            {children}
        </div>
    </div>
);

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-xl shadow-xl border border-slate-100">
                <p className="text-sm font-bold text-slate-900 mb-1">Round #{label}</p>
                <p className="text-sm text-blue-600 font-medium">
                    Value: {payload[0].value.toFixed(4)}
                </p>
            </div>
        );
    }
    return null;
};

export default FederatedDashboard;
