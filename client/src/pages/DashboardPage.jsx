import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { HiOutlineUsers, HiOutlineBookOpen, HiOutlineExclamationCircle, HiOutlineHeart, HiOutlineBeaker, HiOutlineClock, HiOutlineCheckCircle, HiOutlineServer, HiOutlineCheck } from 'react-icons/hi';

const KPICard = ({ icon: Icon, label, value, trend, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: delay * 0.1, duration: 0.4 }}
        className="glass-card p-5"
    >
        <div className="flex items-center justify-between mb-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            {trend && (
                <span className={`text-xs font-semibold px-2 py-1 rounded-lg ${trend > 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
            )}
        </div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-sm text-slate-400 mt-1">{label}</p>
    </motion.div>
);

export default function DashboardPage() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [pendingIncidents, setPendingIncidents] = useState([]);
    const isAdminOrOfficer = ['admin', 'officer'].includes(user?.role);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await api.get('/reports/dashboard');
                setData(res.data);
            } catch (err) {
                console.error('Dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        const fetchPendingIncidents = async () => {
            if (isAdminOrOfficer) {
                try {
                    const res = await api.get('/incidents?status=Reported&limit=5');
                    setPendingIncidents(res.data.incidents || []);
                } catch (err) {
                    console.error('Failed to fetch pending incidents', err);
                }
            }
        };

        fetchDashboard();
        fetchPendingIncidents();
    }, [isAdminOrOfficer]);

    const handleVerifyIncident = async (id) => {
        try {
            await api.put(`/incidents/${id}`, { status: 'In Progress' });
            toast.success('Incident verified and published!');
            setPendingIncidents(pendingIncidents.filter(i => i._id !== id));
            // Optionally refetch dashboard data to update KPIs
        } catch (err) {
            toast.error('Verification failed');
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="glass-card p-5">
                            <div className="shimmer h-10 w-10 rounded-xl mb-3" />
                            <div className="shimmer h-8 w-20 rounded mb-2" />
                            <div className="shimmer h-4 w-32 rounded" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    const kpis = data?.kpis || {};

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white">
                    Welcome back, <span className="gradient-text">{user?.name}</span>
                </h1>
                <p className="text-slate-400 mt-1">Here's what's happening on campus today</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon={HiOutlineUsers} label="Total Users" value={kpis.totalUsers || 0} trend={12} color="bg-gradient-to-br from-violet-500 to-purple-600" delay={0} />
                <KPICard icon={HiOutlineBookOpen} label="Active Lessons" value={kpis.activeLessons || 0} trend={8} color="bg-gradient-to-br from-blue-500 to-cyan-600" delay={1} />
                <KPICard icon={HiOutlineExclamationCircle} label="Incidents This Month" value={kpis.incidentsThisMonth || 0} trend={-5} color="bg-gradient-to-br from-amber-500 to-orange-600" delay={2} />
                <KPICard icon={HiOutlineHeart} label="System Health" value={`${kpis.systemHealth || 98}%`} trend={2} color="bg-gradient-to-br from-emerald-500 to-teal-600" delay={3} />
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    {/* Pending Verification (Admin/Officer only) */}
                    {isAdminOrOfficer && pendingIncidents.length > 0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="glass-card p-6 border-l-4 border-l-amber-500"
                        >
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <HiOutlineExclamationCircle className="w-5 h-5 text-amber-400" />
                                Action Required: Pending Incident Verifications
                            </h3>
                            <div className="space-y-3">
                                {pendingIncidents.map((incident) => (
                                    <div key={incident._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 px-4 rounded-xl bg-slate-800/50 border border-amber-500/20">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="badge badge-danger">{incident.type}</span>
                                                <span className="badge badge-warning">{incident.severity}</span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-white">{incident.title}</h4>
                                            <p className="text-xs text-slate-400 mt-1">Location: {incident.location?.building || 'Map Pin'}</p>
                                            <p className="text-xs text-slate-500 mt-1">Reported by: {incident.reportedBy?.name || 'Unknown'}</p>
                                        </div>
                                        <button
                                            onClick={() => handleVerifyIncident(incident._id)}
                                            className="btn-primary py-2 px-4 text-xs shrink-0 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-emerald-500/20"
                                        >
                                            <HiOutlineCheck className="w-4 h-4" /> Verify & Publish
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Recent Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="lg:col-span-2 glass-card p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <HiOutlineClock className="w-5 h-5 text-indigo-400" />
                            Recent Activity
                        </h3>
                        <div className="space-y-3">
                            {(data?.recentActivity || [])
                                .filter(activity => {
                                    if (['admin', 'officer', 'staff'].includes(user?.role)) return true;
                                    const action = activity.action || '';
                                    return ['Incident Reported', 'Incident Status Updated', 'Simulation Joined', 'Simulation Created', 'Emergency Zone Created'].includes(action) ||
                                        action.toLowerCase().includes('incident') ||
                                        action.toLowerCase().includes('sos') ||
                                        action.toLowerCase().includes('simulation');
                                })
                                .slice(0, 8).map((activity, i) => (
                                    <div key={i} className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-slate-800/50 transition-colors">
                                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                            <span className="text-xs font-bold text-indigo-400">{activity.user?.name?.charAt(0) || '?'}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-white truncate">
                                                <span className="font-medium">{activity.user?.name || 'System'}</span>
                                                <span className="text-slate-400"> — {activity.action}</span>
                                            </p>
                                            <p className="text-xs text-slate-500 truncate">{activity.details}</p>
                                        </div>
                                        <span className="text-xs text-slate-500 flex-shrink-0">
                                            {new Date(activity.createdAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                ))}
                            {(!data?.recentActivity || data.recentActivity.length === 0) && (
                                <p className="text-slate-500 text-sm text-center py-4">No recent activity</p>
                            )}
                        </div>
                    </motion.div>
                </div>

                {/* System Status + Quick Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="space-y-6"
                >
                    {/* System Status */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <HiOutlineServer className="w-5 h-5 text-emerald-400" />
                            System Status
                        </h3>
                        <div className="space-y-3">
                            {[
                                { name: 'API Server', status: 'Operational', color: 'bg-emerald-400' },
                                { name: 'Database', status: 'Operational', color: 'bg-emerald-400' },
                                { name: 'Alert System', status: 'Operational', color: 'bg-emerald-400' },
                                { name: 'Map Service', status: 'Operational', color: 'bg-emerald-400' },
                            ].map((sys, i) => (
                                <div key={i} className="flex items-center justify-between py-2">
                                    <span className="text-sm text-slate-300">{sys.name}</span>
                                    <div className="flex items-center gap-2">
                                        <div className={`w-2 h-2 rounded-full ${sys.color}`} />
                                        <span className="text-xs text-slate-400">{sys.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <HiOutlineCheckCircle className="w-5 h-5 text-blue-400" />
                            Quick Overview
                        </h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-300">Pending Incidents</span>
                                <span className="badge badge-warning">{kpis.pendingIncidents || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-300">Total Simulations</span>
                                <span className="badge badge-info">{kpis.totalSimulations || 0}</span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-sm text-slate-300">Active Lessons</span>
                                <span className="badge badge-success">{kpis.activeLessons || 0}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
