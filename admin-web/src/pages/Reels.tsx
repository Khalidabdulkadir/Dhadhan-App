
import { Edit2, Eye, Play, Plus, Search, Trash2, Video } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import api, { BASE_URL } from '../api';
import Modal from '../components/Modal';

const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    return `${BASE_URL}${url}`;
};

export default function Reels() {
    const [reels, setReels] = useState<any[]>([]);
    const [filteredReels, setFilteredReels] = useState<any[]>([]);
    const [products, setProducts] = useState<any[]>([]);
    const [restaurants, setRestaurants] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReel, setEditingReel] = useState<any>(null);
    const [formData, setFormData] = useState({
        product: '',
        restaurant: '',
        caption: '',
        video: null as File | null,
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [videoPreview, setVideoPreview] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchReels();
        fetchProducts();
        fetchRestaurants();
    }, []);

    useEffect(() => {
        const results = reels.filter(reel =>
            reel.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reel.product_details?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredReels(results);
    }, [searchTerm, reels]);

    const fetchReels = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/reels/');
            setReels(response.data);
        } catch (error) {
            console.error('Error fetching reels:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products/');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        if (file) {
            setFormData({ ...formData, video: file });
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
        }
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingReel(null);
        setFormData({ product: '', caption: '', video: null, restaurant: '' });
        setVideoPreview(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        data.append('product', formData.product);
        data.append('caption', formData.caption);
        if (formData.restaurant) {
            data.append('restaurant', formData.restaurant);
        }
        if (formData.video) {
            data.append('video', formData.video);
        }

        try {
            if (editingReel) {
                await api.patch(`/reels/${editingReel.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/reels/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }
            closeModal();
            fetchReels();
        } catch (error) {
            console.error('Error saving reel:', error);
        }
    };

    const handleDelete = async (id: number) => {
        if (window.confirm('Are you sure you want to delete this reel?')) {
            try {
                await api.delete(`/reels/${id}/`);
                fetchReels();
            } catch (error) {
                console.error('Error deleting reel:', error);
            }
        }
    };

    const openModal = (reel?: any) => {
        if (reel) {
            setEditingReel(reel);
            setFormData({
                product: reel.product.toString(),
                restaurant: reel.restaurant?.toString() || '',
                caption: reel.caption,
                video: null,
            });
            setVideoPreview(getImageUrl(reel.video));
        } else {
            setEditingReel(null);
            setFormData({ product: '', caption: '', video: null, restaurant: '' });
            setVideoPreview(null);
        }
        setIsModalOpen(true);
    };

    return (
        <div className="p-6 md:p-8 max-w-[1600px] mx-auto min-h-screen">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Reels</h1>
                    <p className="text-gray-500 mt-1 text-lg">Curate engaging video content.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 animate-slideUp" style={{ animationDelay: '0.2s' }}>
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search reels..."
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
                        Create Reel
                    </button>
                </div>
            </div>

            {/* Grid */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-fadeIn">
                    {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-white rounded-2xl h-[450px] animate-pulse shadow-sm border border-gray-100"></div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filteredReels.map((reel, index) => (
                        <div
                            key={reel.id}
                            className="group bg-white rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden flex flex-col animate-slideUp"
                            style={{ animationDelay: `${0.1 + index * 0.05}s` }}
                        >
                            <div className="relative aspect-[9/16] bg-black">
                                <video
                                    src={getImageUrl(reel.video)}
                                    className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                                    controls
                                    muted={false} // Allow sound for admin preview
                                />
                                <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-xs font-semibold flex items-center gap-1.5 border border-white/10">
                                    <Eye size={12} />
                                    {reel.views}
                                </div>

                                {/* Overlay Actions */}
                                <div className="absolute top-3 left-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                    <button
                                        onClick={() => openModal(reel)}
                                        className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white hover:bg-black/70 transition-colors border border-white/10"
                                        title="Edit"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(reel.id)}
                                        className="p-2 bg-red-500/80 backdrop-blur-md rounded-full text-white hover:bg-red-600 transition-colors border border-white/10"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4 border-t border-gray-50">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100 bg-gray-50 flex-shrink-0">
                                        <img
                                            src={getImageUrl(reel.product_details?.image)}
                                            className="w-full h-full object-cover"
                                            alt={reel.product_details?.name}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 truncate text-sm">{reel.product_details?.name}</h3>
                                        <p className="text-xs text-gray-500 truncate">
                                            {restaurants.find(r => r.id === reel.restaurant)?.name || 'Promoted Product'}
                                        </p>
                                    </div>
                                </div>
                                <p className="text-gray-600 text-sm line-clamp-2 min-h-[2.5rem] leading-relaxed">{reel.caption || <span className="text-gray-400 italic">No caption</span>}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {filteredReels.length === 0 && !isLoading && (
                <div className="flex flex-col items-center justify-center py-20 animate-fadeIn">
                    <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6 text-gray-400">
                        <Video className="w-10 h-10" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No Reels Found</h3>
                    <p className="text-gray-500 max-w-sm text-center mb-8">
                        Upload short videos to showcase your products.
                    </p>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-orange-600 text-white px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 font-semibold transition-all"
                    >
                        Create Reel
                    </button>
                </div>
            )}


            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title={editingReel ? 'Edit Reel' : 'New Reel'}
                maxWidth="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Video Upload & Preview */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Video Content
                        </label>
                        <div className="relative group">
                            {videoPreview ? (
                                <div className="relative rounded-2xl overflow-hidden bg-black aspect-[9/16] shadow-md border border-gray-200 max-h-[400px] mx-auto w-2/3">
                                    <video
                                        src={videoPreview}
                                        className="w-full h-full object-cover"
                                        controls
                                        autoPlay
                                        loop
                                        muted
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setVideoPreview(null);
                                            setFormData({ ...formData, video: null });
                                        }}
                                        className="absolute top-3 right-3 bg-red-500/90 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-sm backdrop-blur-sm"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ) : (
                                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer hover:bg-orange-50 hover:border-orange-300 transition-all group-hover:scale-[1.01]">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <div className="p-4 bg-orange-100 text-orange-600 rounded-full mb-3 group-hover:scale-110 transition-transform">
                                            <Play size={24} fill="currentColor" />
                                        </div>
                                        <p className="mb-2 text-sm text-gray-600"><span className="font-semibold text-gray-900">Click to upload video</span></p>
                                        <p className="text-xs text-gray-500">MP4, WebM (9:16 recommended)</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="video/*"
                                        onChange={handleFileChange}
                                        required={!editingReel}
                                    />
                                </label>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Product Selection */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Linked Product
                            </label>
                            <select
                                required
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                value={formData.product}
                                onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                            >
                                <option value="">Select a product to feature...</option>
                                {products.map(p => (
                                    <option key={p.id} value={p.id}>{p.name} - KSh {p.price}</option>
                                ))}
                            </select>
                            <p className="text-xs text-gray-500 mt-2 ml-1">
                                This product will appear as a "Shop Now" card in the reel.
                            </p>
                        </div>

                        {/* Restaurant Selection */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Restaurant
                            </label>
                            <select
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                value={formData.restaurant}
                                onChange={(e) => setFormData({ ...formData, restaurant: e.target.value })}
                            >
                                <option value="">Select Restaurant (Optional)</option>
                                {restaurants.map(r => (
                                    <option key={r.id} value={r.id}>{r.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Caption */}
                        <div className="col-span-1 md:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Caption
                            </label>
                            <textarea
                                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:border-primary/50 focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                                rows={3}
                                placeholder="Write a catchy caption..."
                                value={formData.caption}
                                onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                            />
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
                            {editingReel ? 'Save Changes' : 'Publish Reel'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
