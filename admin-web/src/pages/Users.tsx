
import { Mail, Trash2, User as UserIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';

interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
}

export default function Users() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/users/');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (userId: number) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await api.delete(`/users/${userId}/`);
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
                alert('Failed to delete user');
            }
        }
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Users</h1>
                    <p className="text-gray-500 mt-1 text-lg">Manage system users, staff, and customers.</p>
                </div>

                <div className="bg-white px-6 py-3 rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 flex items-center gap-3 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="bg-orange-50 p-2.5 rounded-xl">
                        <UserIcon className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Users</p>
                        <p className="text-xl font-black text-gray-900 leading-none">{users.length}</p>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            {isLoading ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 flex justify-center animate-fadeIn">
                    <div className="animate-pulse flex space-x-4">
                        <div className="flex-1 space-y-4 py-1">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="space-y-2">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-slideUp" style={{ animationDelay: '0.3s' }}>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead>
                                <tr className="bg-gray-50/50">
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest leading-4">User Profile</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest leading-4">Contact Info</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest leading-4">Role</th>
                                    <th className="px-8 py-5 text-left text-xs font-bold text-gray-400 uppercase tracking-widest leading-4">Status</th>
                                    <th className="px-8 py-5 text-right text-xs font-bold text-gray-400 uppercase tracking-widest leading-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/60 transition-colors group">
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-12 w-12 bg-gradient-to-br from-orange-100 to-red-100 rounded-2xl flex items-center justify-center shadow-inner ring-4 ring-white">
                                                    <span className="text-orange-600 font-black text-lg">
                                                        {user.first_name?.[0] || user.username[0].toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-bold text-gray-900 group-hover:text-orange-600 transition-colors">
                                                        {user.first_name} {user.last_name}
                                                    </div>
                                                    <div className="text-xs text-gray-400 font-medium mt-0.5">@{user.username}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="flex items-center text-sm font-medium text-gray-600 bg-gray-50/50 w-fit px-3 py-1.5 rounded-lg border border-transparent group-hover:border-gray-100 transition-all">
                                                <Mail className="w-4 h-4 mr-2.5 text-gray-400" />
                                                {user.email}
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            {user.is_superuser ? (
                                                <span className="px-3 py-1 inline-flex text-[10px] uppercase font-bold tracking-wide rounded-full bg-purple-50 text-purple-700 border border-purple-100 shadow-sm">
                                                    Super Admin
                                                </span>
                                            ) : user.is_staff ? (
                                                <span className="px-3 py-1 inline-flex text-[10px] uppercase font-bold tracking-wide rounded-full bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                                                    Staff Member
                                                </span>
                                            ) : (
                                                <span className="px-3 py-1 inline-flex text-[10px] uppercase font-bold tracking-wide rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                                                    Customer
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-sm text-gray-500">
                                            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide bg-green-50 text-green-700 border border-green-100 w-fit">
                                                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => handleDelete(user.id)}
                                                className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-2.5 rounded-xl transition-all transform hover:scale-110 active:scale-95"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
