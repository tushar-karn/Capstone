import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlineSearch, HiOutlinePencil, HiOutlineTrash, HiOutlinePlus, HiOutlineX } from 'react-icons/hi';

const roleColors = {
    admin: 'badge-danger', staff: 'badge-info', officer: 'badge-success', student: 'badge-primary'
};

export default function UsersManagementPage() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', email: '', role: 'student', department: '', isActive: true });

    const fetchUsers = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (roleFilter) params.role = roleFilter;
            const res = await api.get('/users', { params });
            setUsers(res.data.users);
        } catch (err) {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(); }, [search, roleFilter]);

    const handleEdit = (user) => {
        setEditing(user);
        setForm({ name: user.name, email: user.email, role: user.role, department: user.department || '', isActive: user.isActive });
        setShowModal(true);
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/users/${editing._id}`, form);
            toast.success('User updated');
            setShowModal(false);
            fetchUsers();
        } catch (err) {
            toast.error('Failed to update user');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            toast.success('User deleted');
            fetchUsers();
        } catch (err) {
            toast.error('Failed to delete user');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Manage Users</h1>
                    <p className="text-slate-400 mt-1">View and manage all campus users</p>
                </div>
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3">
                <div className="relative flex-1 min-w-[200px]">
                    <HiOutlineSearch className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search users..." className="form-input pl-10 text-sm" />
                </div>
                <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="form-select w-auto min-w-[140px] text-sm">
                    <option value="">All Roles</option>
                    <option value="admin">Admin</option>
                    <option value="staff">Staff</option>
                    <option value="officer">Officer</option>
                    <option value="student">Student</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-700">
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">User</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Role</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase hidden md:table-cell">Department</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase hidden lg:table-cell">Status</th>
                                <th className="text-left py-3 px-4 text-xs font-semibold text-slate-400 uppercase hidden lg:table-cell">Joined</th>
                                <th className="text-right py-3 px-4 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3, 4, 5].map(i => (
                                    <tr key={i} className="border-b border-slate-800">
                                        <td className="py-3 px-4"><div className="shimmer h-8 w-40 rounded" /></td>
                                        <td className="py-3 px-4"><div className="shimmer h-6 w-16 rounded" /></td>
                                        <td className="py-3 px-4 hidden md:table-cell"><div className="shimmer h-4 w-24 rounded" /></td>
                                        <td className="py-3 px-4 hidden lg:table-cell"><div className="shimmer h-4 w-16 rounded" /></td>
                                        <td className="py-3 px-4 hidden lg:table-cell"><div className="shimmer h-4 w-20 rounded" /></td>
                                        <td className="py-3 px-4"><div className="shimmer h-8 w-16 rounded ml-auto" /></td>
                                    </tr>
                                ))
                            ) : (
                                users.map((u, i) => (
                                    <motion.tr
                                        key={u._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: i * 0.03 }}
                                        className="border-b border-slate-800 hover:bg-slate-800/30 transition-colors"
                                    >
                                        <td className="py-3 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${u.role === 'admin' ? 'from-red-500 to-orange-500' : u.role === 'staff' ? 'from-blue-500 to-cyan-500' : u.role === 'officer' ? 'from-emerald-500 to-teal-500' : 'from-violet-500 to-purple-500'} flex items-center justify-center`}>
                                                    <span className="text-xs font-bold text-white">{u.name?.charAt(0)?.toUpperCase()}</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">{u.name}</p>
                                                    <p className="text-xs text-slate-400">{u.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-3 px-4">
                                            <span className={`badge ${roleColors[u.role]} capitalize`}>{u.role}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden md:table-cell text-sm text-slate-300">{u.department || '—'}</td>
                                        <td className="py-3 px-4 hidden lg:table-cell">
                                            <span className={`badge ${u.isActive ? 'badge-success' : 'badge-danger'}`}>{u.isActive ? 'Active' : 'Inactive'}</span>
                                        </td>
                                        <td className="py-3 px-4 hidden lg:table-cell text-sm text-slate-400">
                                            {new Date(u.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-3 px-4">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => handleEdit(u)} className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 hover:text-white transition-colors">
                                                    <HiOutlinePencil className="w-4 h-4" />
                                                </button>
                                                <button onClick={() => handleDelete(u._id)} className="p-1.5 rounded-lg hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors">
                                                    <HiOutlineTrash className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                {users.length === 0 && !loading && (
                    <div className="text-center py-8 text-slate-500">No users found</div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="relative w-full max-w-md bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">Edit User</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-700 rounded-lg"><HiOutlineX className="w-5 h-5 text-slate-400" /></button>
                            </div>
                            <form onSubmit={handleSave} className="space-y-4">
                                <div>
                                    <label className="form-label">Name</label>
                                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="form-input" required />
                                </div>
                                <div>
                                    <label className="form-label">Email</label>
                                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="form-input" required />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="form-label">Role</label>
                                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="form-select">
                                            <option value="student">Student</option>
                                            <option value="staff">Staff</option>
                                            <option value="officer">Officer</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Status</label>
                                        <select value={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.value === 'true' })} className="form-select">
                                            <option value="true">Active</option>
                                            <option value="false">Inactive</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Department</label>
                                    <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="form-input" />
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="btn-primary flex-1 justify-center">Save Changes</button>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
