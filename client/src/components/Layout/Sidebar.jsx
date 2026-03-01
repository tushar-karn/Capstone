import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    HiOutlineHome, HiOutlineBookOpen, HiOutlineBeaker, HiOutlineExclamation,
    HiOutlineChartBar, HiOutlineCog, HiOutlineUsers, HiOutlineShieldCheck,
    HiOutlineChevronLeft, HiOutlineChevronRight, HiOutlineMap, HiOutlineBell, HiOutlineSpeakerphone
} from 'react-icons/hi';

const menuItems = {
    admin: [
        { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        { path: '/notifications', icon: HiOutlineSpeakerphone, label: 'Notifications' },
        { path: '/users', icon: HiOutlineUsers, label: 'Manage Users' },
        { path: '/lessons', icon: HiOutlineBookOpen, label: 'Manage Lessons' },
        { path: '/simulations', icon: HiOutlineBeaker, label: 'Simulations' },
        { path: '/emergency', icon: HiOutlineBell, label: 'Emergency Support' },
        { path: '/reports', icon: HiOutlineChartBar, label: 'Reports & Analytics' },
        { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
    ],
    staff: [
        { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        { path: '/notifications', icon: HiOutlineSpeakerphone, label: 'Notifications' },
        { path: '/lessons', icon: HiOutlineBookOpen, label: 'Lessons' },
        { path: '/simulations', icon: HiOutlineBeaker, label: 'Simulations' },
        { path: '/emergency', icon: HiOutlineBell, label: 'Emergency Support' },
        { path: '/reports', icon: HiOutlineChartBar, label: 'Reports' },
        { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
    ],
    officer: [
        { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        { path: '/notifications', icon: HiOutlineSpeakerphone, label: 'Notifications' },
        { path: '/lessons', icon: HiOutlineBookOpen, label: 'Lessons' },
        { path: '/simulations', icon: HiOutlineBeaker, label: 'Simulations' },
        { path: '/emergency', icon: HiOutlineBell, label: 'Emergency Support' },
        { path: '/reports', icon: HiOutlineChartBar, label: 'Reports' },
        { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
    ],
    student: [
        { path: '/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
        { path: '/notifications', icon: HiOutlineSpeakerphone, label: 'Notifications' },
        { path: '/lessons', icon: HiOutlineBookOpen, label: 'Safety Lessons' },
        { path: '/simulations', icon: HiOutlineBeaker, label: 'Simulations' },
        { path: '/emergency', icon: HiOutlineBell, label: 'Emergency Support' },
        { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
    ]
};

export default function Sidebar({ collapsed, onToggle }) {
    const { user } = useAuth();
    const items = menuItems[user?.role] || menuItems.student;

    return (
        <>
            {/* Mobile overlay */}
            {!collapsed && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 md:hidden"
                    onClick={onToggle}
                />
            )}

            <aside
                style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
                className={`fixed top-0 left-0 h-full z-50 transition-transform duration-300 flex flex-col ${collapsed ? '-translate-x-full md:translate-x-0' : 'translate-x-0'
                    }`}
            >
                {/* Sidebar background */}
                <div className="absolute inset-0 bg-[#0c1222] border-r border-[var(--border-color)]" />

                {/* Content */}
                <div className="relative flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-color)]">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
                            <HiOutlineShieldCheck className="w-5 h-5 text-white" />
                        </div>
                        {!collapsed && (
                            <div className="overflow-hidden">
                                <h1 className="text-base font-bold text-white whitespace-nowrap">Campus Safety</h1>
                                <p className="text-[0.65rem] text-slate-400 font-medium tracking-wider uppercase">Hub</p>
                            </div>
                        )}
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
                        {items.map((item) => (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
                                        ? 'bg-gradient-to-r from-indigo-500/20 to-cyan-500/10 text-indigo-400 border border-indigo-500/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                                    }`
                                }
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                {!collapsed && <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>}
                            </NavLink>
                        ))}
                    </nav>

                    {/* Collapse toggle */}
                    <div className="p-3 border-t border-[var(--border-color)]">
                        <button
                            onClick={onToggle}
                            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 transition-all"
                        >
                            {collapsed ? <HiOutlineChevronRight className="w-5 h-5" /> : <HiOutlineChevronLeft className="w-5 h-5" />}
                            {!collapsed && <span className="text-sm">Collapse</span>}
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
}
