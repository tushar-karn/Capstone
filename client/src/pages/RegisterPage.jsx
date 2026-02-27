import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineUser, HiOutlineMail, HiOutlineLockClosed, HiOutlineShieldCheck, HiOutlinePhone, HiOutlineAcademicCap } from 'react-icons/hi';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [form, setForm] = useState({
        name: '', email: '', password: '', confirmPassword: '',
        role: 'student', department: '', emergencyContact: '', agreeTerms: false
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        if (!form.agreeTerms) {
            toast.error('Please agree to the Terms and Conditions');
            return;
        }
        setLoading(true);
        try {
            const { confirmPassword, agreeTerms, ...data } = form;
            const user = await register(data);
            toast.success(`Welcome, ${user.name}! Account created successfully.`);
            navigate('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-5/12 animated-bg relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/50 to-cyan-900/50" />
                <div className="absolute top-20 left-20 w-32 h-32 bg-indigo-500/20 rounded-full blur-xl animate-float" />
                <div className="absolute bottom-32 right-20 w-48 h-48 bg-cyan-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }} />

                <div className="relative z-10 flex flex-col justify-center px-12">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
                            <HiOutlineShieldCheck className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Campus Safety</h2>
                            <p className="text-sm text-indigo-200 tracking-wider uppercase">Hub</p>
                        </div>
                    </div>

                    <h1 className="text-3xl font-bold text-white leading-tight mb-6">
                        Join Our Safety<br />
                        <span className="gradient-text">Community</span>
                    </h1>

                    <p className="text-slate-300 mb-10 max-w-sm">
                        Create your account and start your safety training journey today.
                    </p>

                    <div className="space-y-4">
                        {[
                            { icon: '📊', title: 'Personalized Dashboard', desc: 'Track your progress and safety metrics' },
                            { icon: '🎓', title: 'Interactive Learning', desc: 'Engage with lessons and simulations' },
                            { icon: '🆘', title: 'Emergency Resources', desc: 'Instant access to safety contacts' },
                        ].map((f, i) => (
                            <div key={i} className="flex items-center gap-4 py-3 px-4 rounded-xl bg-white/5 backdrop-blur border border-white/10">
                                <span className="text-2xl">{f.icon}</span>
                                <div>
                                    <p className="text-white font-semibold text-sm">{f.title}</p>
                                    <p className="text-slate-400 text-xs">{f.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center px-6 py-8 bg-[#0f172a]">
                <div className="w-full max-w-xl">
                    <div className="lg:hidden flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                            <HiOutlineShieldCheck className="w-6 h-6 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Campus Safety Hub</h2>
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-2">Create Account</h2>
                    <p className="text-slate-400 mb-6">Join us and start your safety training journey</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Full Name *</label>
                                <div className="relative">
                                    <HiOutlineUser className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input name="name" value={form.name} onChange={handleChange} placeholder="John Doe"
                                        className="form-input pl-12" required />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Email Address *</label>
                                <div className="relative">
                                    <HiOutlineMail className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@campus.edu"
                                        className="form-input pl-12" required />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Password *</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••"
                                        className="form-input pl-12" required minLength={6} />
                                </div>
                            </div>
                            <div>
                                <label className="form-label">Confirm Password *</label>
                                <div className="relative">
                                    <HiOutlineLockClosed className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••"
                                        className="form-input pl-12" required minLength={6} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Role *</label>
                                <select name="role" value={form.role} onChange={handleChange} className="form-select">
                                    <option value="student">Student</option>
                                    <option value="staff">Staff</option>
                                    <option value="officer">Officer</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Department</label>
                                <div className="relative">
                                    <HiOutlineAcademicCap className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                    <input name="department" value={form.department} onChange={handleChange} placeholder="Computer Science"
                                        className="form-input pl-12" />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="form-label">Emergency Contact</label>
                            <div className="relative">
                                <HiOutlinePhone className="absolute left-4 top-3.5 w-5 h-5 text-slate-500" />
                                <input name="emergencyContact" value={form.emergencyContact} onChange={handleChange} placeholder="+1 (555) 987-6543"
                                    className="form-input pl-12" />
                            </div>
                        </div>

                        <label className="flex items-start gap-3 cursor-pointer py-2">
                            <input type="checkbox" name="agreeTerms" checked={form.agreeTerms} onChange={handleChange}
                                className="w-4 h-4 mt-0.5 rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500" />
                            <span className="text-sm text-slate-400">
                                I agree to the <button type="button" className="text-indigo-400 hover:underline">Terms and Conditions</button> and{' '}
                                <button type="button" className="text-indigo-400 hover:underline">Privacy Policy</button>
                            </span>
                        </label>

                        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base">
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Creating Account...
                                </span>
                            ) : 'Create Account'}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-400 mt-6">
                        Already have an account?{' '}
                        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
                            Sign in instead
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
