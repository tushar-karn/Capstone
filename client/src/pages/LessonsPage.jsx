import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineEye, HiOutlineSearch, HiOutlineFilter, HiOutlineX, HiOutlineBookOpen, HiOutlineCheckCircle } from 'react-icons/hi';

const categories = ['Fire Safety', 'Earthquake', 'Health Emergency', 'Flood Safety', 'Chemical Hazard', 'General Safety'];
const levels = ['Beginner', 'Intermediate', 'Advanced'];
const statuses = ['Active', 'Inactive', 'Draft'];

const categoryIcons = {
    'Fire Safety': '🔥', 'Earthquake': '🌍', 'Health Emergency': '🏥',
    'Flood Safety': '🌊', 'Chemical Hazard': '☢️', 'General Safety': '🛡️'
};

const levelColors = {
    'Beginner': 'badge-success', 'Intermediate': 'badge-warning', 'Advanced': 'badge-danger'
};

export default function LessonsPage() {
    const { user, updateUser } = useAuth();
    const isAdmin = ['admin', 'officer'].includes(user?.role);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterLevel, setFilterLevel] = useState('');
    const [form, setForm] = useState({
        title: '', category: 'Fire Safety', level: 'Beginner', duration: 30,
        content: '', videoUrl: '', status: 'Active'
    });
    const [viewingLesson, setViewingLesson] = useState(null);
    const [completing, setCompleting] = useState(false);

    const getEmbedUrl = (url) => {
        if (!url) return null;
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length >= 5) ? `https://www.youtube.com/embed/${match[2]}` : null;
    };

    const handleCompleteLesson = async () => {
        if (!viewingLesson || completing) return;
        setCompleting(true);
        try {
            const res = await api.post(`/lessons/${viewingLesson._id}/complete`);
            const updatedCompletedLessons = res.data.completedLessons;
            updateUser({ completedLessons: updatedCompletedLessons });
            toast.success('Lesson marked as complete!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to complete lesson');
        } finally {
            setCompleting(false);
        }
    };

    const fetchLessons = async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (filterCategory) params.category = filterCategory;
            if (filterLevel) params.level = filterLevel;
            const res = await api.get('/lessons', { params });
            // For non-admins, only show active lessons locally as a fallback
            const loadedLessons = res.data.lessons;
            setLessons(isAdmin ? loadedLessons : loadedLessons.filter(l => l.status === 'Active'));
        } catch (err) {
            toast.error('Failed to fetch lessons');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLessons(); }, [search, filterCategory, filterLevel]);

    const handleView = (lesson) => {
        setViewingLesson(lesson);
        // Optionally update view count here via API
        api.patch(`/lessons/${lesson._id}/view`).catch(err => console.error(err));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editing) {
                await api.put(`/lessons/${editing._id}`, form);
                toast.success('Lesson updated');
            } else {
                await api.post('/lessons', form);
                toast.success('Lesson created');
            }
            setShowModal(false);
            setEditing(null);
            setForm({ title: '', category: 'Fire Safety', level: 'Beginner', duration: 30, content: '', videoUrl: '', status: 'Active' });
            fetchLessons();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Operation failed');
        }
    };

    const handleEdit = (lesson) => {
        setEditing(lesson);
        setForm({
            title: lesson.title, category: lesson.category, level: lesson.level,
            duration: lesson.duration, content: lesson.content, videoUrl: lesson.videoUrl || '', status: lesson.status
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this lesson?')) return;
        try {
            await api.delete(`/lessons/${id}`);
            toast.success('Lesson deleted');
            fetchLessons();
        } catch (err) {
            toast.error('Failed to delete lesson');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        {isAdmin ? 'Manage Lessons' : 'Safety Lessons'}
                    </h1>
                    <p className="text-slate-400 mt-1">
                        {isAdmin ? 'Create and manage safety training content' : 'Browse available safety courses'}
                    </p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => { setEditing(null); setForm({ title: '', category: 'Fire Safety', level: 'Beginner', duration: 30, content: '', videoUrl: '', status: 'Active' }); setShowModal(true); }}
                        className="btn-primary"
                    >
                        <HiOutlinePlus className="w-5 h-5" /> New Lesson
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="glass-card p-4">
                <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                        <HiOutlineSearch className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search lessons..."
                            className="form-input pl-10 text-sm"
                        />
                    </div>
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="form-select w-auto min-w-[160px] text-sm">
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <select value={filterLevel} onChange={(e) => setFilterLevel(e.target.value)} className="form-select w-auto min-w-[140px] text-sm">
                        <option value="">All Levels</option>
                        {levels.map(l => <option key={l} value={l}>{l}</option>)}
                    </select>
                </div>
            </div>

            {/* Lessons Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="glass-card p-5">
                            <div className="shimmer h-6 w-32 rounded mb-3" />
                            <div className="shimmer h-4 w-full rounded mb-2" />
                            <div className="shimmer h-4 w-2/3 rounded" />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {lessons.map((lesson, i) => (
                            <motion.div
                                key={lesson._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="glass-card p-5 flex flex-col"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">{categoryIcons[lesson.category] || '📘'}</span>
                                        {!isAdmin && user?.completedLessons?.includes(lesson._id) && (
                                            <span className="text-emerald-400" title="Completed">
                                                <HiOutlineCheckCircle className="w-5 h-5" />
                                            </span>
                                        )}
                                    </div>
                                    <span className={`badge ${levelColors[lesson.level]}`}>{lesson.level}</span>
                                </div>
                                <h3 className="text-base font-semibold text-white mb-2 line-clamp-2">{lesson.title}</h3>
                                <p className="text-sm text-slate-400 mb-3 line-clamp-2">{lesson.content}</p>

                                <div className="flex items-center gap-4 text-xs text-slate-500 mt-auto mb-3">
                                    <span>⏱️ {lesson.duration} min</span>
                                    <span>👁️ {lesson.viewCount} views</span>
                                    <span className={`badge ${lesson.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{lesson.status}</span>
                                </div>

                                <div className="flex items-center gap-2 pt-3 border-t border-slate-700">
                                    {isAdmin ? (
                                        <button onClick={() => handleEdit(lesson)} className="flex-1 btn-secondary text-xs py-2 justify-center hover:bg-slate-700">
                                            <HiOutlinePencil className="w-3.5 h-3.5" /> Edit
                                        </button>
                                    ) : (
                                        <button onClick={() => handleView(lesson)} className={`flex-1 ${user?.completedLessons?.includes(lesson._id) ? 'btn-secondary text-emerald-400 border-emerald-500/30 hover:bg-slate-800' : 'btn-primary'} text-xs py-2 justify-center flex items-center gap-1.5`}>
                                            {user?.completedLessons?.includes(lesson._id) ? (
                                                <><HiOutlineCheckCircle className="w-3.5 h-3.5" /> Rewatch</>
                                            ) : (
                                                <><HiOutlineEye className="w-3.5 h-3.5" /> Start Lesson</>
                                            )}
                                        </button>
                                    )}
                                    {isAdmin && (
                                        <button onClick={() => handleDelete(lesson._id)} className="btn-danger text-xs py-2 px-3">
                                            <HiOutlineTrash className="w-3.5 h-3.5" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}

            {lessons.length === 0 && !loading && (
                <div className="text-center py-12 text-slate-500">
                    <HiOutlineBookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>No lessons found</p>
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
                    >
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border-color)] rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-white">{editing ? 'Edit Lesson' : 'Create New Lesson'}</h2>
                                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
                                    <HiOutlineX className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="form-label">Title *</label>
                                    <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="form-input" required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="form-label">Category</label>
                                        <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="form-select">
                                            {categories.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Level</label>
                                        <select value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} className="form-select">
                                            {levels.map(l => <option key={l} value={l}>{l}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Duration (min)</label>
                                        <input type="number" value={form.duration} onChange={(e) => setForm({ ...form, duration: parseInt(e.target.value) })} className="form-input" min="1" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="form-label">Content *</label>
                                    <textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} className="form-input min-h-[120px] resize-y" required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Video URL</label>
                                        <input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} className="form-input" placeholder="https://..." />
                                    </div>
                                    <div>
                                        <label className="form-label">Status</label>
                                        <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="form-select">
                                            {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button type="submit" className="btn-primary flex-1 justify-center">
                                        {editing ? 'Update Lesson' : 'Create Lesson'}
                                    </button>
                                    <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">Cancel</button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Read-Only Lesson View Modal */}
            <AnimatePresence>
                {viewingLesson && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setViewingLesson(null)} />
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl"
                        >
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-900/50">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="text-2xl">{categoryIcons[viewingLesson.category] || '📘'}</span>
                                        <span className={`badge ${levelColors[viewingLesson.level]}`}>{viewingLesson.level}</span>
                                        <span className="text-xs text-slate-400">⏱️ {viewingLesson.duration} min</span>
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">{viewingLesson.title}</h2>
                                </div>
                                <button onClick={() => setViewingLesson(null)} className="p-2 hover:bg-slate-800 rounded-xl transition-colors shrink-0">
                                    <HiOutlineX className="w-6 h-6 text-slate-400" />
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6 space-y-8">
                                {/* Video Player */}
                                {viewingLesson.videoUrl && getEmbedUrl(viewingLesson.videoUrl) ? (
                                    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-lg aspect-video bg-black">
                                        <iframe
                                            width="100%"
                                            height="100%"
                                            src={getEmbedUrl(viewingLesson.videoUrl)}
                                            title="Course Video"
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    </div>
                                ) : (
                                    viewingLesson.videoUrl && (
                                        <div className="p-4 rounded-xl bg-slate-800 border border-slate-700 text-slate-300">
                                            <p className="font-medium mb-2 flex items-center gap-2">🔗 External Resource:</p>
                                            <a href={viewingLesson.videoUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 break-all underline">
                                                {viewingLesson.videoUrl}
                                            </a>
                                        </div>
                                    )
                                )}

                                {/* Article / Blog Content */}
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <HiOutlineBookOpen className="w-5 h-5 text-indigo-400" />
                                        Lesson Content
                                    </h3>
                                    <div className="prose prose-invert prose-slate max-w-none mb-8">
                                        {viewingLesson.content.split('\n').map((paragraph, idx) => (
                                            paragraph.trim() ? <p key={idx} className="text-slate-300 leading-relaxed mb-4">{paragraph}</p> : <br key={idx} />
                                        ))}
                                    </div>

                                    {/* Action Buttons */}
                                    {!isAdmin && (
                                        <div className="pt-6 border-t border-slate-700/50 flex justify-end">
                                            {user?.completedLessons?.includes(viewingLesson._id) ? (
                                                <button disabled className="btn-secondary opacity-80 cursor-not-allowed border-emerald-500/30 text-emerald-400 py-2.5 px-6 flex items-center gap-2">
                                                    <HiOutlineCheckCircle className="w-5 h-5" /> Completed
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={handleCompleteLesson}
                                                    disabled={completing}
                                                    className="btn-primary py-2.5 px-6 flex items-center gap-2"
                                                >
                                                    <HiOutlineCheckCircle className="w-5 h-5" />
                                                    {completing ? 'Marking...' : 'Mark as Complete'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
