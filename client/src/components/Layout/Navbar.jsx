import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { HiOutlineBell, HiOutlineMenu, HiOutlineLogout, HiOutlineUser } from 'react-icons/hi';

export default function Navbar({ onMenuToggle }) {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const roleColors = {
        admin: 'from-red-500 to-orange-500',
        staff: 'from-blue-500 to-cyan-500',
        officer: 'from-emerald-500 to-teal-500',
        student: 'from-violet-500 to-purple-500'
    };

    return (
        <header className="sticky top-0 z-30 backdrop-blur-lg bg-[#0f172a]/80 border-b border-[var(--border-color)]">
            <div className="flex items-center justify-between px-6 py-3">
                {/* Left: Menu toggle for mobile */}
                <button
                    onClick={onMenuToggle}
                    className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                    <HiOutlineMenu className="w-5 h-5" />
                </button>

                {/* Center: Search (hidden on mobile) */}
                <div className="hidden md:block flex-1 max-w-md">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="w-full py-2 px-4 pl-10 bg-slate-800/50 border border-slate-700 rounded-xl text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                        />
                        <svg className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-3">
                    {/* Notifications */}
                    <button
                        onClick={() => navigate('/notifications')}
                        className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                        <HiOutlineBell className="w-5 h-5" />
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                    </button>

                    {/* User */}
                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-3 py-1.5 px-3 rounded-xl hover:bg-slate-800 transition-colors"
                        >
                            <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${roleColors[user?.role] || roleColors.student} flex items-center justify-center`}>
                                <span className="text-white text-sm font-bold">{user?.name?.charAt(0)?.toUpperCase()}</span>
                            </div>
                            <div className="hidden md:block text-left">
                                <p className="text-sm font-medium text-white leading-tight">{user?.name}</p>
                                <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
                            </div>
                        </button>

                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
                                <div className="absolute right-0 top-12 w-48 bg-[var(--bg-card)] border border-[var(--border-color)] rounded-xl shadow-2xl z-50 py-2">
                                    <button
                                        onClick={() => { navigate('/settings'); setShowDropdown(false); }}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                                    >
                                        <HiOutlineUser className="w-4 h-4" /> Profile
                                    </button>
                                    <hr className="my-1 border-slate-700" />
                                    <button
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-400 hover:bg-slate-700 hover:text-red-300 transition-colors"
                                    >
                                        <HiOutlineLogout className="w-4 h-4" /> Logout
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
