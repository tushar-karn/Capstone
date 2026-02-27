import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HiOutlineTrendingUp, HiOutlineTrendingDown, HiOutlineLightningBolt } from 'react-icons/hi';

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-[var(--bg-card)] border border-[var(--border-color)] rounded-lg p-3 shadow-xl">
                <p className="text-sm text-white font-medium">{label}</p>
                {payload.map((item, i) => (
                    <p key={i} className="text-xs" style={{ color: item.color }}>{item.name}: {item.value}</p>
                ))}
            </div>
        );
    }
    return null;
};

export default function ReportsPage() {
    const { user } = useAuth();
    const [incidentData, setIncidentData] = useState(null);
    const [simData, setSimData] = useState(null);
    const [participationData, setParticipationData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('incidents');

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const [inc, sim, part] = await Promise.all([
                    api.get('/reports/incidents'),
                    api.get('/reports/simulations'),
                    api.get('/reports/participation')
                ]);
                setIncidentData(inc.data);
                setSimData(sim.data);
                setParticipationData(part.data);
            } catch (err) {
                console.error('Failed to fetch reports');
            } finally {
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="shimmer h-8 w-48 rounded mb-6" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => <div key={i} className="glass-card p-6"><div className="shimmer h-64 rounded" /></div>)}
                </div>
            </div>
        );
    }

    const monthlyTrend = (incidentData?.monthlyTrend || []).map(m => ({ month: m._id, count: m.count }));
    const bySeverity = (incidentData?.bySeverity || []).map(m => ({ name: m._id, value: m.count }));
    const byType = (incidentData?.byType || []).map(m => ({ name: m._id, count: m.count }));
    const prediction = incidentData?.trendPrediction;
    const simByType = (simData?.byType || []).map(m => ({ type: m._id, count: m.count, avgScore: Math.round(m.avgScore || 0) }));
    const usersByRole = (participationData?.usersByRole || []).map(m => ({ name: m._id, value: m.count }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
                <p className="text-slate-400 mt-1">AI-powered insights and trend analysis</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {['incidents', 'simulations', 'users'].map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        {tab === 'incidents' ? '🚨 Incidents' : tab === 'simulations' ? '🧪 Simulations' : '👥 Users'}
                    </button>
                ))}
            </div>

            {/* Incidents Tab */}
            {activeTab === 'incidents' && (
                <div className="space-y-6">
                    {/* AI Prediction Card */}
                    {prediction && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-5 border-l-4 border-l-indigo-500"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
                                    <HiOutlineLightningBolt className="w-5 h-5 text-indigo-400" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-white">AI Trend Prediction</h3>
                                    <p className="text-sm text-slate-400">
                                        Trend: <span className={prediction.trend === 'increasing' ? 'text-red-400' : prediction.trend === 'decreasing' ? 'text-emerald-400' : 'text-amber-400'}>{prediction.trend}</span>
                                        {prediction.prediction !== null && ` • Predicted next period: ${prediction.prediction} incidents`}
                                        {prediction.confidence && ` • Confidence: ${prediction.confidence}`}
                                    </p>
                                </div>
                                {prediction.trend === 'increasing' ? (
                                    <HiOutlineTrendingUp className="w-6 h-6 text-red-400 ml-auto" />
                                ) : (
                                    <HiOutlineTrendingDown className="w-6 h-6 text-emerald-400 ml-auto" />
                                )}
                            </div>
                        </motion.div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Monthly Trend */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6"
                        >
                            <h3 className="text-base font-semibold text-white mb-4">Incident Trends</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <AreaChart data={monthlyTrend}>
                                    <defs>
                                        <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Area type="monotone" dataKey="count" name="Incidents" stroke="#6366f1" fill="url(#colorCount)" strokeWidth={2} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* By Severity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="glass-card p-6"
                        >
                            <h3 className="text-base font-semibold text-white mb-4">By Severity</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie data={bySeverity} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                        {bySeverity.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                    <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
                                </PieChart>
                            </ResponsiveContainer>
                        </motion.div>

                        {/* By Type */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="glass-card p-6 lg:col-span-2"
                        >
                            <h3 className="text-base font-semibold text-white mb-4">Incidents by Type</h3>
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={byType}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="count" name="Incidents" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Simulations Tab */}
            {activeTab === 'simulations' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                        <h3 className="text-base font-semibold text-white mb-4">Simulations by Type</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={simByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="count" name="Count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                        <h3 className="text-base font-semibold text-white mb-4">Average Scores by Type</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={simByType}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                                <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 10 }} />
                                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} />
                                <Tooltip content={<CustomTooltip />} />
                                <Bar dataKey="avgScore" name="Avg Score" fill="#10b981" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                        <h3 className="text-base font-semibold text-white mb-4">Users by Role</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie data={usersByRole} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                                    {usersByRole.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                                <Legend formatter={(value) => <span style={{ color: '#94a3b8', fontSize: 12 }}>{value}</span>} />
                            </PieChart>
                        </ResponsiveContainer>
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
                        <h3 className="text-base font-semibold text-white mb-4">Quick Stats</h3>
                        <div className="space-y-4">
                            {usersByRole.map((role, i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                        <span className="text-sm text-slate-300 capitalize">{role.name}</span>
                                    </div>
                                    <span className="text-sm font-semibold text-white">{role.value}</span>
                                </div>
                            ))}
                            <hr className="border-slate-700" />
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-300 font-medium">Total Users</span>
                                <span className="text-lg font-bold gradient-text">{usersByRole.reduce((sum, r) => sum + r.value, 0)}</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
