
import { Edit, Image as ImageIcon, Package, Plus, Search, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../api';
import Modal from '../components/Modal';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    image: string;
    is_available: boolean;
    category: number;
    category_data?: { id: number; name: string };
    restaurant: number | null;
    restaurant_data?: { id: number; name: string };
}

interface Category {
    id: number;
    name: string;
}

interface Restaurant {
    id: number;
    name: string;
}

export default function Products() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        restaurant: '',
        is_available: true,
        image: '',
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchRestaurants();
    }, []);

    useEffect(() => {
        const results = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredProducts(results);
    }, [searchTerm, products]);

    const fetchProducts = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
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
            data.append('description', formData.description);
            data.append('price', formData.price);
            data.append('category', formData.category);
            if (formData.restaurant) {
                data.append('restaurant', formData.restaurant);
            }
            data.append('is_available', String(formData.is_available));
            if (imageFile) {
                data.append('image', imageFile);
            }

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            if (editingProduct) {
                await api.patch(`/products/${editingProduct.id}/`, data, config);
            } else {
                await api.post('/products/', data, config);
            }
            fetchProducts();
            closeModal();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}/`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const openModal = (product?: Product) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                category: product.category.toString(),
                restaurant: product.restaurant?.toString() || '',
                is_available: product.is_available,
                image: product.image,
            });
            setImagePreview(product.image ? getImageUrl(product.image) : '');
            setImageFile(null);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                description: '',
                price: '',
                category: categories[0]?.id.toString() || '',
                restaurant: '',
                is_available: true,
                image: '',
            });
            setImagePreview('');
            setImageFile(null);
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
        setFormData({
            name: '',
            description: '',
            price: '',
            category: '',
            restaurant: '',
            is_available: true,
            image: '',
        });
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
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Products</h1>
                    <p className="text-gray-500 mt-1 text-lg">Manage generic food items and menu offerings.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search products..."
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
                        Add Product
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <div key={n} className="bg-white rounded-3xl h-[400px] animate-pulse shadow-sm border border-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filteredProducts.map((product, index) => (
                        <div
                            key={product.id}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col animate-slideUp"
                            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                        >
                            {/* Product Image */}
                            <div className="relative h-64 bg-gray-50 overflow-hidden">
                                {product.image ? (
                                    <div className="w-full h-full relative">
                                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-10 transition-opacity z-10" />
                                        <img
                                            src={getImageUrl(product.image)}
                                            alt={product.name}
                                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300 bg-gray-50/50">
                                        <ImageIcon className="w-16 h-16 mb-2 opacity-50" />
                                        <span className="text-sm font-medium">No Image</span>
                                    </div>
                                )}

                                {/* Status Badge */}
                                <div className="absolute top-4 left-4 z-20">
                                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm backdrop-blur-md ${product.is_available
                                        ? 'bg-green-500/90 text-white'
                                        : 'bg-red-500/90 text-white'
                                        }`}>
                                        {product.is_available ? 'Available' : 'Out of Stock'}
                                    </span>
                                </div>

                                {/* Overlay Actions */}
                                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-20">
                                    <button
                                        onClick={() => openModal(product)}
                                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-black/5 text-gray-700 hover:text-blue-600 hover:scale-110 active:scale-95 transition-all"
                                        title="Edit"
                                        aria-label="Edit product"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="p-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-lg shadow-black/5 text-gray-700 hover:text-red-600 hover:scale-110 active:scale-95 transition-all"
                                        title="Delete"
                                        aria-label="Delete product"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Price Tag */}
                                <div className="absolute bottom-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2 rounded-xl shadow-lg font-bold text-gray-900 border border-gray-100">
                                    KSh {product.price}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 flex-1 flex flex-col">
                                <div className="mb-2">
                                    <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-1" title={product.name}>{product.name}</h3>
                                    <div className="flex items-center gap-2">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-orange-50 text-orange-700 text-xs font-medium border border-orange-100">
                                            {categories.find(c => c.id === product.category)?.name || 'Uncategorized'}
                                        </span>
                                        {product.restaurant && (
                                            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100 truncate max-w-[150px]">
                                                {restaurants.find(r => r.id === product.restaurant)?.name}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mt-2 mb-4">
                                    {product.description || <span className="text-gray-400 italic">No description provided.</span>}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredProducts.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <Package className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Products Found</h3>
                    <p className="text-gray-500 max-w-sm text-center mb-8">
                        {searchTerm ? `No matches found for "${searchTerm}".` : "Get started by adding your first product to the menu."}
                    </p>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 font-semibold transition-all"
                    >
                        Add Product
                    </button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingProduct ? 'Edit Product' : 'Add New Product'}
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                placeholder="e.g. Double Cheeseburger"
                                required
                            />
                        </div>

                        {/* Price */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (KSh)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">KSh</span>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all font-medium"
                                    placeholder="0.00"
                                    required
                                />
                            </div>
                        </div>

                        {/* Category */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Restaurant */}
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

                        {/* Availability Toggle */}
                        <div className="flex items-center pt-8">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={formData.is_available}
                                    onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-500"></div>
                                <span className="ml-3 text-sm font-semibold text-gray-700">
                                    {formData.is_available ? 'Available for ordering' : 'Mark as Unavailable'}
                                </span>
                            </label>
                        </div>

                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all min-h-[100px]"
                                placeholder="Describe the ingredients and flavors..."
                            />
                        </div>

                        {/* Image Upload */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Image</label>
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
                                    required={!editingProduct && !imagePreview}
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
                            {editingProduct ? 'Save Changes' : 'Create Product'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

