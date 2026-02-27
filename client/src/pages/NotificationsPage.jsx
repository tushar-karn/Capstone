import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLocation } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineBell, HiOutlineCheckCircle, HiOutlineSpeakerphone, HiOutlineInformationCircle, HiOutlineExclamationCircle, HiOutlinePaperAirplane } from 'react-icons/hi';

const typeIcons = {
    Info: <HiOutlineInformationCircle className="w-6 h-6 text-blue-400" />,
    Warning: <HiOutlineExclamationCircle className="w-6 h-6 text-yellow-400" />,
    Alert: <HiOutlineSpeakerphone className="w-6 h-6 text-red-500" />
};

export default function NotificationsPage() {
    const { user } = useAuth();
    const location = useLocation();
    const isAdminOrStaff = ['admin', 'staff', 'officer'].includes(user?.role);

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    // Broadcast Form State
    const [form, setForm] = useState({
        title: location.state?.prefill?.title || '',
        message: location.state?.prefill?.message || '',
        type: location.state?.prefill?.type || 'Info'
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data.notifications);
        } catch (err) {
            toast.error('Failed to load notifications');
        } finally {
            setLoading(false);
        }
    };

    const handleBroadcast = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const res = await api.post('/notifications', form);
            toast.success('Broadcast sent successfully!');
            setNotifications([res.data.notification, ...notifications]);
            setForm({ title: '', message: '', type: 'Info' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send broadcast');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAcknowledge = async (id) => {
        try {
            await api.put(`/notifications/${id}/acknowledge`);
            toast.success('Notification acknowledged');

            // Optimistically update UI
            setNotifications(prev => prev.map(n => {
                if (n._id === id) {
                    return { ...n, acknowledgedBy: [...(n.acknowledgedBy || []), user._id] };
                }
                return n;
            }));
        } catch (err) {
            toast.error('Failed to acknowledge notification');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <HiOutlineBell className="text-indigo-400" /> Campus Notifications
                </h1>
                <p className="text-slate-400 mt-1">Stay updated with official broadcasts and emergency alerts.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Main Feed Column */}
                <div className={`space-y-4 ${isAdminOrStaff ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    <h2 className="text-lg font-semibold text-white mb-4">Recent Broadcasts</h2>

                    <AnimatePresence>
                        {notifications.length === 0 ? (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-8 text-center text-slate-500">
                                <HiOutlineBell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                                <p>No notifications at the moment.</p>
                            </motion.div>
                        ) : (
                            notifications.map((notif, i) => {
                                const isAcked = notif.acknowledgedBy?.includes(user?._id);
                                return (
                                    <motion.div
                                        key={notif._id}
                                        initial={{ opacity: 0, y: 15 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className={`glass-card p-5 border-l-4 transition-all ${isAcked ? 'opacity-70 border-l-slate-600 bg-slate-800/20' :
                                            notif.type === 'Alert' ? 'border-l-red-500 bg-red-500/5' :
                                                notif.type === 'Warning' ? 'border-l-yellow-500 bg-yellow-500/5' :
                                                    'border-l-blue-500 bg-blue-500/5'
                                            }`}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="mt-1">
                                                {typeIcons[notif.type]}
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start mb-1">
                                                    <h3 className={`font-semibold ${isAcked ? 'text-slate-300' : 'text-white'}`}>
                                                        {notif.title}
                                                    </h3>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(notif.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <p className={`text-sm mb-3 ${isAcked ? 'text-slate-500' : 'text-slate-300'}`}>
                                                    {notif.message}
                                                </p>

                                                <div className="flex justify-between items-center mt-4">
                                                    <span className="text-xs text-slate-500 flex items-center gap-1">
                                                        Sent by: {notif.createdBy?.name || 'Admin'}
                                                    </span>

                                                    {!isAdminOrStaff && (
                                                        isAcked ? (
                                                            <span className="flex items-center gap-1.5 text-xs text-emerald-500 font-medium">
                                                                <HiOutlineCheckCircle className="w-4 h-4" /> Acknowledged
                                                            </span>
                                                        ) : (
                                                            <button
                                                                onClick={() => handleAcknowledge(notif._id)}
                                                                className="btn-primary text-xs py-1.5 px-4 flex items-center gap-1.5"
                                                            >
                                                                <HiOutlineCheckCircle className="w-3.5 h-3.5" /> Acknowledge
                                                            </button>
                                                        )
                                                    )}

                                                    {isAdminOrStaff && (
                                                        <span className="text-xs text-indigo-400 bg-indigo-500/10 px-2 py-1 rounded-md">
                                                            {notif.acknowledgedBy?.length || 0} Acknowledgements
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </AnimatePresence>
                </div>

                {/* Admin Broadcast Sidebar */}
                {isAdminOrStaff && (
                    <div className="lg:col-span-1">
                        <div className="glass-card p-5 sticky top-6">
                            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <HiOutlineSpeakerphone className="text-indigo-400" /> New Broadcast
                            </h2>
                            <form onSubmit={handleBroadcast} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Severity Type</label>
                                    <select
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    >
                                        <option value="Info">ℹ️ Information (Blue)</option>
                                        <option value="Warning">⚠️ Warning (Yellow)</option>
                                        <option value="Alert">🚨 Critical Alert (Red)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Subject</label>
                                    <input
                                        type="text"
                                        required
                                        maxLength={100}
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-600"
                                        placeholder="e.g., Campus Main Gate Closure"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1">Message Body</label>
                                    <textarea
                                        required
                                        rows="4"
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none placeholder-slate-600 resize-none"
                                        placeholder="Type your official announcement here..."
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full btn-primary py-2.5 flex items-center justify-center gap-2"
                                >
                                    <HiOutlinePaperAirplane className="w-4 h-4 transform rotate-45 -mt-0.5" />
                                    {isSubmitting ? 'Sending...' : 'Send Broadcast to Campus'}
                                </button>
                                <p className="text-[10px] text-slate-500 text-center mt-2">
                                    Broadcasts are instantly visible to all registered users.
                                </p>
                            </form>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}
