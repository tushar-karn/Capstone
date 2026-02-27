import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineMail, HiOutlineLockClosed, HiOutlineShieldCheck } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [remember, setRemember] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const user = await login(email, password);
            toast.success(`Welcome back, ${user.name}!`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel - Gradient */}
            <div className="hidden lg:flex lg:w-1/2 animated-bg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-cyan-900/50" />
                {/* Floating shapes */}
                <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl animate-float" />
                <div className="absolute bottom-32 right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-violet-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }} />

                <div className="relative z-10 flex flex-col justify-center px-16">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <HiOutlineShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Campus Safety</h2>
                            <p className="text-sm text-indigo-200 tracking-wider uppercase">Hub</p>
                        </div>
                    </div>

                    <h1 className="text-4xl font-bold text-white leading-tight mb-6">
                        Protecting Our Campus,<br />
                        <span className="gradient-text">Together.</span>
                    </h1>

                    <p className="text-lg text-slate-300 max-w-md mb-10">
                        AI-powered disaster management and emergency response platform for a safer campus community.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: '🛡️', title: 'Real-Time Alerts', desc: 'Instant emergency notifications' },
                            { icon: '🗺️', title: 'Interactive Maps', desc: 'Live emergency zone tracking' },
                            { icon: '🤖', title: 'AI Risk Scoring', desc: 'Predictive safety analytics' },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                                <span className="text-2xl">{feature.icon}</span>
                                <div>
                                    <p className="text-white font-semibold text-sm">{feature.title}</p>
                                    <p className="text-slate-400 text-xs">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-[#0f172a]">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                            <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Campus Safety Hub</h2>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-slate-400 mb-8">Sign in to access your safety dashboard</p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="form-label">Email Address</label>
                            <div className="relative">
                                <HiOutlineMail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@campus.edu"
                                    className="form-input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Password</label>
                            <div className="relative">
                                <HiOutlineLockClosed className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className="form-input pl-12"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={remember}
                                    onChange={(e) => setRemember(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500"
                                />
                                <span className="text-sm text-slate-400">Remember me</span>
                            </label>
                            <button type="button" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
                                Forgot password?
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full justify-center py-3 text-base"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Demo credentials */}
                    <div className="mt-6 p-4 rounded-xl bg-slate-800/50 border border-slate-700">
                        <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">Demo Credentials</p>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                            {[
                                { role: 'Admin', email: 'admin@campus.edu', pw: 'admin123' },
                                { role: 'Staff', email: 'sarah@campus.edu', pw: 'staff123' },
                                { role: 'Officer', email: 'mike@campus.edu', pw: 'officer123' },
                                { role: 'Student', email: 'tushar@campus.edu', pw: 'student123' },
                            ].map((cred) => (
                                <button
                                    key={cred.role}
                                    onClick={() => { setEmail(cred.email); setPassword(cred.pw); }}
                                    className="text-left p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                                >
                                    <p className="font-medium text-indigo-300">{cred.role}</p>
                                    <p className="text-slate-500 truncate">{cred.email}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
