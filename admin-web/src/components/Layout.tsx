
import { LayoutDashboard, LogOut, Menu, ShoppingBag, Store, Users, UtensilsCrossed, Video } from 'lucide-react';
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Layout({ children }: { children: React.ReactNode }) {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login');
    };

    const navItems = [
        { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/restaurants', icon: Store, label: 'Restaurants' },
        { path: '/orders', icon: ShoppingBag, label: 'Orders' },
        { path: '/products', icon: UtensilsCrossed, label: 'Products' },
        { path: '/reels', icon: Video, label: 'Reels' },
        { path: '/categories', icon: Menu, label: 'Categories' },
        { path: '/users', icon: Users, label: 'Users' },
    ];

    return (
        <div className="flex h-screen bg-gray-50/50 font-sans text-gray-900 selection:bg-orange-100 selection:text-orange-900">
            {/* Sidebar */}
            <aside className="w-72 bg-white flex flex-col z-20 transition-all duration-300 border-r border-gray-100/80">
                <div className="p-8 pb-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-gradient-to-br from-orange-500 to-red-600 p-2.5 rounded-xl shadow-lg shadow-orange-500/30 transform hover:scale-105 transition-transform duration-300">
                            <UtensilsCrossed className="w-6 h-6 text-white" />
                        </div>
                        <h1 className="text-2xl font-black text-gray-900 tracking-tight">Matrix<span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">Admin</span></h1>
                    </div>
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-4 px-2 font-mono">Main Menu</div>
                </div>

                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center px-4 py-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                    ? 'bg-gradient-to-r from-orange-50 to-white text-orange-600 shadow-sm border border-orange-100'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                    }`}
                            >
                                <div className={`absolute left-0 w-1 h-8 bg-orange-500 rounded-r-full transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-full'}`} />
                                <Icon className={`w-5 h-5 mr-3.5 transition-all duration-300 ${isActive ? 'text-orange-600 scale-110 drop-shadow-sm' : 'text-gray-400 group-hover:text-gray-600 group-hover:scale-110'}`} />
                                <span className={`font-semibold tracking-wide text-[15px] ${isActive ? 'text-gray-900' : ''}`}>{item.label}</span>
                                {isActive && (
                                    <div className="absolute right-3 w-1.5 h-1.5 bg-orange-500 rounded-full shadow-lg shadow-orange-300" />
                                )}
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50/30">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-3.5 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-xl transition-all duration-300 font-semibold group hover:shadow-sm border border-transparent hover:border-red-100"
                    >
                        <LogOut className="w-5 h-5 mr-3 transition-transform group-hover:-translate-x-1" />
                        <span>Sign Out</span>
                    </button>
                    <div className="mt-4 text-center text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                        v2.0.0 • Matrix Systems
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto bg-gray-50/50 relative p-8">
                <div className="max-w-[1920px] mx-auto animate-fadeIn min-h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
