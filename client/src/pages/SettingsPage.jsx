import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineUser, HiOutlineBell, HiOutlineShieldCheck, HiOutlineMail, HiOutlinePhone, HiOutlineAcademicCap } from 'react-icons/hi';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const [activeTab, setActiveTab] = useState('profile');
    const [profile, setProfile] = useState({
        name: user?.name || '',
        department: user?.department || '',
        emergencyContact: user?.emergencyContact || ''
    });
    const [notifications, setNotifications] = useState({
        emailAlerts: true,
        pushNotifications: true,
        incidentAlerts: true,
        drillReminders: true,
        weeklyReport: false
    });
    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api.put('/auth/profile', profile);
            updateUser(res.data.user);
            toast.success('Profile updated successfully');
        } catch (err) {
            toast.error('Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const roleColors = {
        admin: 'from-red-500 to-orange-500',
        staff: 'from-blue-500 to-cyan-500',
        officer: 'from-emerald-500 to-teal-500',
        student: 'from-violet-500 to-purple-500'
    };

    return (
        <div className="space-y-6 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white">Settings</h1>
                <p className="text-slate-400 mt-1">Manage your profile and preferences</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2">
                {[
                    { id: 'profile', icon: HiOutlineUser, label: 'Profile' },
                    { id: 'notifications', icon: HiOutlineBell, label: 'Notifications' },
                    { id: 'security', icon: HiOutlineShieldCheck, label: 'Security' },
                ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                    >
                        <tab.icon className="w-4 h-4" /> {tab.label}
                    </button>
                ))}
            </div>

            {/* Profile Tab */}
            {activeTab === 'profile' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    {/* Profile Header */}
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-700">
                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${roleColors[user?.role] || roleColors.student} flex items-center justify-center`}>
                            <span className="text-2xl font-bold text-white">{user?.name?.charAt(0)?.toUpperCase()}</span>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">{user?.name}</h3>
                            <p className="text-slate-400">{user?.email}</p>
                            <span className="badge badge-primary capitalize mt-1">{user?.role}</span>
                        </div>
                    </div>

                    <form onSubmit={handleSaveProfile} className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Full Name</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                                        className="form-input pl-12" />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Email Address</label>
                                <div className="relative">
                                    <HiOutlineMail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input value={user?.email || ''} disabled className="form-input pl-12 opacity-50 cursor-not-allowed" />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Department</label>
                                <div className="relative">
                                    <HiOutlineAcademicCap className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input value={profile.department} onChange={(e) => setProfile({ ...profile, department: e.target.value })}
                                        className="form-input pl-12" />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Emergency Contact</label>
                                <div className="relative">
                                    <HiOutlinePhone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input value={profile.emergencyContact} onChange={(e) => setProfile({ ...profile, emergencyContact: e.target.value })}
                                        className="form-input pl-12" />
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button type="submit" disabled={saving} className="btn-primary">
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => setProfile({ name: user?.name || '', department: user?.department || '', emergencyContact: user?.emergencyContact || '' })}>
                                Reset
                            </button>
                        </div>
                    </form>
                </motion.div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6">
                    <h3 className="text-lg font-semibold text-white mb-6">Notification Preferences</h3>
                    <div className="space-y-4">
                        {[
                            { key: 'emailAlerts', label: 'Email Alerts', desc: 'Receive important notifications via email' },
                            { key: 'pushNotifications', label: 'Push Notifications', desc: 'Browser push notifications for real-time alerts' },
                            { key: 'incidentAlerts', label: 'Incident Alerts', desc: 'Get notified when new incidents are reported' },
                            { key: 'drillReminders', label: 'Drill Reminders', desc: 'Reminders for upcoming safety drills' },
                            { key: 'weeklyReport', label: 'Weekly Report', desc: 'Receive weekly safety summary email' },
                        ].map(item => (
                            <div key={item.key} className="flex items-center justify-between py-3 px-4 rounded-xl bg-slate-800/50 border border-slate-700">
                                <div>
                                    <p className="text-sm font-medium text-white">{item.label}</p>
                                    <p className="text-xs text-slate-400">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                                    className={`w-12 h-6 rounded-full transition-colors duration-200 ${notifications[item.key] ? 'bg-indigo-500' : 'bg-slate-600'}`}
                                >
                                    <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${notifications[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </button>
                            </div>
                        ))}
                    </div>
                    <button className="btn-primary mt-6" onClick={() => toast.success('Notification preferences saved')}>
                        Save Preferences
                    </button>
                </motion.div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-4">Change Password</h3>
                        <form className="space-y-4">
                            <div>
                                <label className="form-label">Current Password</label>
                                <input type="password" className="form-input" placeholder="••••••••" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="form-label">New Password</label>
                                    <input type="password" className="form-input" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="form-label">Confirm New Password</label>
                                    <input type="password" className="form-input" placeholder="••••••••" />
                                </div>
                            </div>
                            <button type="button" className="btn-primary" onClick={() => toast.success('Password updated (demo)')}>
                                Update Password
                            </button>
                        </form>
                    </div>

                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-white mb-2">Account Info</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400">Role</span>
                                <span className="text-white capitalize">{user?.role}</span>
                            </div>
                            <div className="flex justify-between py-2 border-b border-slate-700">
                                <span className="text-slate-400">Account Created</span>
                                <span className="text-white">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
                            </div>
                            <div className="flex justify-between py-2">
                                <span className="text-slate-400">Account Status</span>
                                <span className="badge badge-success">Active</span>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
}
