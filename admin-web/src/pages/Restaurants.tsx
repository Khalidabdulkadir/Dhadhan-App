
import { Edit, MapPin, MessageCircle, Plus, Search, Store, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../api';
import Modal from '../components/Modal';

interface Restaurant {
    id: number;
    name: string;
    logo: string;
    whatsapp_number: string;
    location: string;
    description: string;
    delivery_note: string;
    created_at: string;
    cover_image: string;
    is_verified: boolean;
    discount_percentage: number;
    is_featured_campaign: boolean;
}

export default function Restaurants() {
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRestaurant, setEditingRestaurant] = useState<Restaurant | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        whatsapp_number: '',
        location: '',
        description: '',
        delivery_note: '',
        logo: '',
        is_verified: false,
        discount_percentage: '',
        is_featured_campaign: false,
    });
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string>('');
    const [coverFile, setCoverFile] = useState<File | null>(null);
    const [coverPreview, setCoverPreview] = useState<string>('');

    useEffect(() => {
        fetchRestaurants();
    }, []);

    useEffect(() => {
        const results = restaurants.filter(restaurant =>
            restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            restaurant.location.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredRestaurants(results);
    }, [searchTerm, restaurants]);

    const fetchRestaurants = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/restaurants/');
            setRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            data.append('whatsapp_number', formData.whatsapp_number);
            data.append('location', formData.location);
            data.append('description', formData.description);
            data.append('delivery_note', formData.delivery_note);
            data.append('is_verified', String(formData.is_verified));
            data.append('discount_percentage', String(formData.discount_percentage));
            data.append('is_featured_campaign', String(formData.is_featured_campaign));
            if (logoFile) {
                data.append('logo', logoFile);
            }
            if (coverFile) {
                data.append('cover_image', coverFile);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (editingRestaurant) {
                await api.patch(`/restaurants/${editingRestaurant.id}/`, data, config);
            } else {
                await api.post('/restaurants/', data, config);
            }
            fetchRestaurants();
            closeModal();
        } catch (error) {
            console.error('Error saving restaurant:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this restaurant? This will also delete all associated products and categories.')) {
            try {
                await api.delete(`/restaurants/${id}/`);
                fetchRestaurants();
            } catch (error) {
                console.error('Error deleting restaurant:', error);
            }
        }
    };

    const openModal = (restaurant?: Restaurant) => {
        if (restaurant) {
            setEditingRestaurant(restaurant);
            setFormData({
                name: restaurant.name,
                whatsapp_number: restaurant.whatsapp_number,
                location: restaurant.location,
                description: restaurant.description,
                delivery_note: restaurant.delivery_note || '',
                logo: restaurant.logo,
                is_verified: restaurant.is_verified,
                discount_percentage: restaurant.discount_percentage ? String(restaurant.discount_percentage) : '',
                is_featured_campaign: restaurant.is_featured_campaign,
            });
            setLogoPreview(restaurant.logo ? getImageUrl(restaurant.logo) : '');
            setLogoFile(null);
            setCoverPreview(restaurant.cover_image ? getImageUrl(restaurant.cover_image) : '');
            setCoverFile(null);
        } else {
            setEditingRestaurant(null);
            setFormData({
                name: '',
                whatsapp_number: '',
                location: '',
                description: '',
                delivery_note: '',
                logo: '',
                is_verified: false,
                discount_percentage: '',
                is_featured_campaign: false,
            });
            setLogoPreview('');
            setLogoFile(null);
            setCoverPreview('');
            setCoverFile(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingRestaurant(null);
        setFormData({
            name: '',
            whatsapp_number: '',
            location: '',
            description: '',
            delivery_note: '',
            logo: '',
            is_verified: false,
            discount_percentage: '',
            is_featured_campaign: false,
        });
        setLogoPreview('');
        setLogoFile(null);
        setCoverPreview('');
        setCoverFile(null);
    };

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setLogoFile(file);
            setLogoPreview(URL.createObjectURL(file));
        }
    };

    const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setCoverFile(file);
            setCoverPreview(URL.createObjectURL(file));
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Restaurants</h1>
                    <p className="text-gray-500 mt-1 text-lg">Manage generic restaurants, vendors, and partners.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search restaurants..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full sm:w-72 bg-white border-2 border-gray-100 rounded-xl py-3 pl-10 pr-4 text-gray-700 outline-none focus:border-primary/20 focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all font-semibold"
                    >
                        <Plus className="w-5 h-5" />
                        Add Restaurant
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white rounded-3xl h-80 animate-pulse shadow-sm border border-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filteredRestaurants.map((restaurant, index) => (
                        <div
                            key={restaurant.id}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col animate-slideUp"
                            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                        >
                            {/* Card Hero */}
                            <div className="relative h-48 bg-gray-50 overflow-hidden">
                                {restaurant.logo ? (
                                    <div className="w-full h-full relative">
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity z-10" />
                                        <img
                                            src={getImageUrl(restaurant.logo)}
                                            alt={restaurant.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                                        <Store className="w-16 h-16 mb-2 opacity-50" />
                                        <span className="text-sm font-medium">No Logo</span>
                                    </div>
                                )}

                                {/* Discount Badge */}
                                {restaurant.discount_percentage > 0 && (
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm backdrop-blur-md">
                                            {Math.round(restaurant.discount_percentage)}% OFF
                                        </span>
                                    </div>
                                )}

                                {/* Overlay Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
                                    <button
                                        onClick={() => openModal(restaurant)}
                                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-black/5 text-gray-700 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all"
                                        title="Edit"
                                        aria-label="Edit restaurant"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(restaurant.id)}
                                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-black/5 text-gray-700 hover:text-red-600 hover:scale-110 active:scale-95 transition-all"
                                        title="Delete"
                                        aria-label="Delete restaurant"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-4">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1 flex items-center gap-2">
                                        {restaurant.name}
                                        {restaurant.is_verified && (
                                            <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        )}
                                    </h3>
                                    <div className="flex items-center text-gray-500 text-sm">
                                        <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0" />
                                        <span className="truncate">{restaurant.location}</span>
                                    </div>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                                        <MessageCircle className="w-4 h-4 text-green-600 mt-0.5 mr-2.5 flex-shrink-0" />
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-0.5">WhatsApp</p>
                                            <p className="text-sm font-semibold text-gray-900">{restaurant.whatsapp_number}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-auto pt-4 border-t border-gray-100">
                                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                        {restaurant.description || <span className="text-gray-400 italic">No description provided.</span>}
                                    </p>
                                    {restaurant.delivery_note && (
                                        <div className="mt-3 bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg border border-blue-100">
                                            <span className="font-bold mr-1">Note:</span> {restaurant.delivery_note}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredRestaurants.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <Store className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Restaurants Found</h3>
                    <p className="text-gray-500 max-w-sm text-center mb-8">
                        {searchTerm ? `No matches found for "${searchTerm}".` : "Get started by adding your first partner restaurant."}
                    </p>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 font-semibold transition-all"
                    >
                        Add Restaurant
                    </button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingRestaurant ? 'Edit Restaurant' : 'New Restaurant'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cover Image Upload (Full Width) */}
                    <div className="w-full">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Cover Image</label>
                        <div
                            className={`
                                relative h-48 border-2 border-dashed rounded-2xl overflow-hidden transition-all cursor-pointer group
                                ${coverPreview ? 'border-transparent' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
                            `}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleCoverChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            {coverPreview ? (
                                <>
                                    <img src={coverPreview} alt="Cover Preview" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white font-medium">
                                        Change Cover Image (Used for Hero Campaign)
                                    </div>
                                </>
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                                    <Plus className="w-10 h-10 mb-2" />
                                    <p className="font-medium">Add Cover Image (Hero)</p>
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Campaign Toggle */}
                    <div className="flex items-center pt-2 pb-4">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={formData.is_featured_campaign}
                                onChange={(e) => setFormData({ ...formData, is_featured_campaign: e.target.checked })}
                            />
                            <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
                            <span className="ml-3 text-sm font-semibold text-gray-700">
                                {formData.is_featured_campaign ? 'Active Hero Campaign (Big Card)' : 'Standard Restaurant'}
                            </span>
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name Input */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-semibold text-gray-700">Restaurant Name</label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.is_verified}
                                        onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                                        className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary"
                                    />
                                    <span className="text-sm font-medium text-gray-600">Verified Badge</span>
                                </label>
                            </div>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                placeholder="e.g. Burger King"
                                required
                            />
                        </div>

                        {/* Discount Percentage */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Discount Percentage (%)</label>
                            <input
                                type="number"
                                min="0"
                                max="100"
                                value={formData.discount_percentage}
                                onChange={(e) => setFormData({ ...formData, discount_percentage: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                placeholder="0"
                            />
                        </div>

                        {/* WhatsApp */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Number</label>
                            <div className="relative">
                                <MessageCircle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={formData.whatsapp_number}
                                    onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="+254..."
                                    required
                                />
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={formData.location}
                                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                    placeholder="City, Street"
                                    required
                                />
                            </div>
                        </div>

                        {/* Delivery Note */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Instructions</label>
                            <textarea
                                value={formData.delivery_note}
                                onChange={(e) => setFormData({ ...formData, delivery_note: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[80px]"
                                placeholder="Any specific delivery guidelines for this vendor..."
                            />
                        </div>

                        {/* Description */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[100px]"
                                placeholder="What makes this restaurant special?"
                            />
                        </div>

                        {/* Logo Upload */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant Logo</label>
                            <div
                                className={`
                                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group
                                    ${logoPreview ? 'border-primary/30 bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
                                `}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    required={!editingRestaurant && !logoPreview}
                                />
                                {logoPreview ? (
                                    <div className="relative h-40 flex items-center justify-center">
                                        <img src={logoPreview} alt="Preview" className="h-full object-contain drop-shadow-sm" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg text-white font-medium">
                                            Change Logo
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-4">
                                        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-primary group-hover:shadow-md transition-all">
                                            <Plus className="w-8 h-8" />
                                        </div>
                                        <p className="text-gray-900 font-medium">Click to upload logo</p>
                                        <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-semibold transition-colors focus:ring-4 focus:ring-gray-100"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 bg-primary hover:bg-orange-600 text-white rounded-xl shadow-lg shadow-primary/30 transform active:scale-95 transition-all font-semibold focus:ring-4 focus:ring-primary/20"
                        >
                            {editingRestaurant ? 'Save Changes' : 'Create Restaurant'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

