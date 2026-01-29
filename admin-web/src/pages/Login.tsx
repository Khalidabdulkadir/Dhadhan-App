
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await api.post('/auth/login/', { username: email, password });
            localStorage.setItem('accessToken', response.data.access);
            localStorage.setItem('refreshToken', response.data.refresh);
            navigate('/');
        } catch (err: any) {
            console.error(err);
            setError('Invalid email or password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex w-full bg-white">
            {/* Left Side - Hero Image */}
            <div className="hidden lg:flex lg:w-7/12 relative items-center justify-center overflow-hidden bg-gray-900">
                <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/80 z-10"></div>

                {/* Background Image with Zoom Effect */}
                <div
                    className="absolute inset-0 bg-cover bg-center animate-subtle-zoom"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=2000&auto=format&fit=crop')`
                    }}
                />

                <div className="relative z-20 text-center px-16 max-w-4xl">
                    <div className="mb-8 inline-block animate-slideUp" style={{ animationDelay: '0.1s' }}>
                        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shadow-2xl">
                            <h2 className="text-6xl font-black text-white tracking-tight drop-shadow-xl">
                                Dhadhan<span className="text-orange-500">Admin</span>
                            </h2>
                        </div>
                    </div>

                    <p className="text-2xl text-gray-200 font-light leading-relaxed mb-12 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                        The complete operating system for modern restaurants.<br />
                        <span className="text-white/80 text-lg mt-2 block font-normal">Manage orders, products, and partners with elegance.</span>
                    </p>

                    {/* Stats/Badges */}
                    <div className="flex justify-center gap-8 animate-slideUp" style={{ animationDelay: '0.3s' }}>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">10k+</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest">Order Processed</div>
                        </div>
                        <div className="w-px bg-white/20"></div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-white mb-1">99.9%</div>
                            <div className="text-xs text-gray-400 uppercase tracking-widest">Uptime</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-white lg:w-5/12">
                <div className="max-w-[420px] w-full space-y-10">
                    <div className="text-center space-y-3">
                        <div className="lg:hidden mx-auto h-16 w-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-orange-500/30">
                            <span className="text-white text-3xl font-black">M</span>
                        </div>
                        <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 font-medium text-lg">
                            Please sign in to continue
                        </p>
                    </div>

                    {error && (
                        <div className="bg-red-50/80 backdrop-blur-sm border border-red-100 p-4 rounded-2xl animate-fadeIn flex items-start gap-3">
                            <div className="flex-shrink-0 w-1 bg-red-500 rounded-full h-full self-stretch"></div>
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                                <input
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-2xl focus:outline-none focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium placeholder-gray-400"
                                    placeholder="admin@matrix.com"
                                    required
                                />
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-bold text-gray-700 ml-1">Password</label>
                                    <a href="#" className="text-sm font-semibold text-orange-600 hover:text-orange-700">Test Account?</a>
                                </div>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-100 text-gray-900 rounded-2xl focus:outline-none focus:bg-white focus:border-orange-500/30 focus:ring-4 focus:ring-orange-500/10 transition-all font-medium placeholder-gray-400"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-base font-bold rounded-2xl text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-900/20 transition-all shadow-xl shadow-gray-900/20 transform hover:-translate-y-1 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                "Sign In"
                            )}
                        </button>
                    </form>

                    <div className="text-center pt-4">
                        <p className="text-xs text-gray-400 font-medium">
                            Need help? <a href="#" className="text-gray-600 hover:text-orange-600 underline decoration-gray-300 underline-offset-2">Contact Support</a>
                        </p>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes subtle-zoom {
                    0% { transform: scale(1); }
                    100% { transform: scale(1.05); }
                }
                .animate-subtle-zoom {
                    animation: subtle-zoom 20s infinite alternate ease-in-out;
                }
            `}</style>
        </div>
    );
}
