
import { Edit, Image as ImageIcon, Plus, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../api';
import Modal from '../components/Modal';

interface Category {
    id: number;
    name: string;
    image: string;
    restaurant: number | null;
}

interface Restaurant {
    id: number;
    name: string;
}

export default function Categories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState({ name: '', image: '', restaurant: '' });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
        fetchRestaurants();
    }, []);

    const fetchCategories = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRestaurants = async () => {
        try {
            const response = await api.get('/restaurants/');
            setRestaurants(response.data);
        } catch (error) {
            console.error('Error fetching restaurants:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = new FormData();
            data.append('name', formData.name);
            if (formData.restaurant) {
                data.append('restaurant', formData.restaurant);
            }
            if (imageFile) {
                data.append('image', imageFile);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (editingCategory) {
                await api.patch(`/categories/${editingCategory.id}/`, data, config);
            } else {
                await api.post('/categories/', data, config);
            }
            fetchCategories();
            closeModal();
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this category?')) {
            try {
                await api.delete(`/categories/${id}/`);
                fetchCategories();
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const openModal = (category?: Category) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                name: category.name,
                image: category.image,
                restaurant: category.restaurant?.toString() || ''
            });
            setImagePreview(category.image ? getImageUrl(category.image) : '');
            setImageFile(null);
        } else {
            setEditingCategory(null);
            setFormData({
                name: '',
                image: '',
                restaurant: restaurants[0]?.id.toString() || ''
            });
            setImagePreview('');
            setImageFile(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCategory(null);
        setFormData({ name: '', image: '', restaurant: '' });
        setImagePreview('');
        setImageFile(null);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const getImageUrl = (url: string) => {
        if (!url) return '';
        if (url.startsWith('http')) return url;
        return `${BASE_URL}${url}`;
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Categories</h1>
                    <p className="text-gray-500 mt-1 text-lg">Organize your menu structure.</p>
                </div>

                <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2 transform active:scale-95 transition-all font-semibold w-full md:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Add Category
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 animate-fadeIn">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white rounded-3xl h-64 animate-pulse shadow-sm border border-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-20">
                    {categories.map((category, index) => (
                        <div
                            key={category.id}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 overflow-hidden border border-gray-100 relative animate-slideUp"
                            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                        >
                            <div className="h-64 overflow-hidden relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10 opacity-70 transition-opacity group-hover:opacity-60" />
                                {category.image ? (
                                    <img
                                        src={getImageUrl(category.image)}
                                        alt={category.name}
                                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                        <ImageIcon className="w-16 h-16 text-gray-400 opacity-50" />
                                    </div>
                                )}

                                <div className="absolute bottom-0 left-0 w-full p-6 z-20">
                                    <h3 className="text-white font-bold text-3xl shadow-black/20 text-shadow-sm mb-1">{category.name}</h3>
                                    {category.restaurant && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md bg-white/20 backdrop-blur-md text-white text-xs font-medium border border-white/10">
                                            {restaurants.find(r => r.id === category.restaurant)?.name}
                                        </span>
                                    )}
                                </div>

                                <div className="absolute top-4 right-4 flex gap-2 z-20 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                                    <button
                                        onClick={() => openModal(category)}
                                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-black/10 text-gray-700 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(category.id)}
                                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-black/10 text-gray-700 hover:text-red-600 hover:scale-110 active:scale-95 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {categories.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <ImageIcon className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Categories Found</h3>
                    <p className="text-gray-500 max-w-sm text-center mb-8">
                        Get started by organizing your products into categories.
                    </p>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 font-semibold transition-all"
                    >
                        Add Category
                    </button>
                </div>
            )}


            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingCategory ? 'Edit Category' : 'Add New Category'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                            placeholder="e.g. Burgers, Pizza"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Restaurant (Optional)</label>
                        <select
                            value={formData.restaurant}
                            onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                        >
                            <option value="">Select Restaurant</option>
                            {restaurants.map(rest => (
                                <option key={rest.id} value={rest.id}>{rest.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Category Cover Image</label>
                        <div
                            className={`
                                    relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer group
                                    ${imagePreview ? 'border-primary/30 bg-primary/5' : 'border-gray-300 hover:border-primary hover:bg-gray-50'}
                                `}
                        >
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                required={!editingCategory && !imagePreview}
                            />
                            {imagePreview ? (
                                <div className="relative h-64 flex items-center justify-center">
                                    <img src={imagePreview} alt="Preview" className="h-full object-contain drop-shadow-sm rounded-lg" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg text-white font-medium">
                                        Change Image
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-4">
                                    <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-white group-hover:text-primary group-hover:shadow-md transition-all">
                                        <ImageIcon className="w-8 h-8" />
                                    </div>
                                    <p className="text-gray-900 font-medium">Click to upload image</p>
                                    <p className="text-sm text-gray-500 mt-1">SVG, PNG, JPG or GIF (max. 800x400px)</p>
                                </div>
                            )}
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
                            {editingCategory ? 'Save Changes' : 'Create Category'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
