
import { CheckCircle, Clock, Eye, MapPin, Package, Search, Truck } from 'lucide-react';
import { useEffect, useState } from 'react';
import api from '../api';

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
}

interface Order {
    id: number;
    user_name: string;
    status: string;
    total_amount: string;
    delivery_address: string;
    payment_method: string;
    created_at: string;
    items: OrderItem[];
}

export default function Orders() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        const results = orders.filter(order =>
            (order.user_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm)
        );
        setFilteredOrders(results);
    }, [searchTerm, orders]);

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const response = await api.get('/orders/');
            setOrders(response.data);
            if (response.data && response.data.length > 0 && !selectedOrder) {
                // Optionally select the first order
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const updateStatus = async (id: number, status: string) => {
        try {
            await api.patch(`/orders/${id}/`, { status });
            fetchOrders();
            if (selectedOrder && selectedOrder.id === id) {
                setSelectedOrder({ ...selectedOrder, status });
            }
        } catch (error) {
            console.error('Error updating order status:', error);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'received': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'preparing': return 'bg-yellow-50 text-yellow-700 border-yellow-100';
            case 'ready': return 'bg-purple-50 text-purple-700 border-purple-100';
            case 'out_for_delivery': return 'bg-orange-50 text-orange-700 border-orange-100';
            case 'delivered': return 'bg-green-50 text-green-700 border-green-100';
            default: return 'bg-gray-50 text-gray-700 border-gray-100';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'received': return <Eye className="w-4 h-4" />;
            case 'preparing': return <Clock className="w-4 h-4" />;
            case 'ready': return <Package className="w-4 h-4" />;
            case 'out_for_delivery': return <Truck className="w-4 h-4" />;
            case 'delivered': return <CheckCircle className="w-4 h-4" />;
            default: return null;
        }
    };

    return (
        <div className="flex h-[calc(100vh-6rem)] gap-8 animate-fadeIn">
            {/* Orders List */}
            <div className="flex-1 bg-white rounded-3xl shadow-lg shadow-gray-100/50 border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 bg-white z-10">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Orders</h2>
                            <p className="text-sm text-gray-500 font-medium">Manage and track deliveries</p>
                        </div>
                        <div className="bg-gray-100 px-3 py-1 rounded-full text-xs font-bold text-gray-500">
                            {orders.length} Total
                        </div>
                    </div>

                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search order ID or customer..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-xl focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all outline-none text-sm font-medium"
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-3 custom-scrollbar">
                    {isLoading ? (
                        <div className="space-y-3">
                            {[1, 2, 3].map(n => <div key={n} className="h-24 bg-gray-50 rounded-xl animate-pulse" />)}
                        </div>
                    ) : filteredOrders.length > 0 ? (
                        <div className="space-y-3">
                            {filteredOrders.map((order) => (
                                <div
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`group p-5 rounded-2xl cursor-pointer transition-all border relative overflow-hidden ${selectedOrder?.id === order.id
                                        ? 'bg-orange-50/60 border-orange-200 shadow-md shadow-orange-500/5'
                                        : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100 hover:shadow-sm'
                                        }`}
                                >
                                    {selectedOrder?.id === order.id && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500 rounded-r-full" />
                                    )}
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">Order #{order.id}</div>
                                            <div className="text-xs text-gray-400 font-medium mt-0.5">{new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${getStatusColor(order.status)}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="text-sm font-medium text-gray-600 truncate max-w-[150px]">
                                            {order.user_name}
                                        </div>
                                        <div className="font-bold text-gray-900 bg-gray-100 px-2 py-1 rounded-lg text-sm">KSh {order.total_amount}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <Search className="w-8 h-8 mb-2 opacity-50" />
                            <p className="text-sm">No orders found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Order Details Panel */}
            <div className={`w-[500px] bg-white rounded-3xl shadow-xl shadow-gray-200/50 border border-gray-100 overflow-hidden flex flex-col transition-all duration-300 ${!selectedOrder ? 'opacity-50 grayscale-[0.5]' : 'opacity-100'}`}>
                {selectedOrder ? (
                    <>
                        <div className="p-8 border-b border-gray-100 bg-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -mr-8 -mt-8 opacity-50 pointer-events-none" />
                            <div className="flex justify-between items-start relative z-10">
                                <div>
                                    <h2 className="text-3xl font-black text-gray-900">Order #{selectedOrder.id}</h2>
                                    <p className="text-gray-500 font-medium mt-1">{new Date(selectedOrder.created_at).toLocaleString()}</p>
                                </div>
                                <span className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold border shadow-sm ${getStatusColor(selectedOrder.status)}`}>
                                    {getStatusIcon(selectedOrder.status)}
                                    <span className="capitalize">{selectedOrder.status.replace(/_/g, ' ')}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                            {/* Detailed Status Actions */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Update Status</h3>
                                <div className="grid grid-cols-5 gap-2">
                                    {['received', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status) => {
                                        const isActive = selectedOrder.status === status;
                                        return (
                                            <button
                                                key={status}
                                                onClick={() => updateStatus(selectedOrder.id, status)}
                                                disabled={isActive}
                                                className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all duration-200 gap-1 group
                                                    ${isActive
                                                        ? 'bg-gray-900 text-white border-gray-900 shadow-md ring-2 ring-offset-2 ring-gray-900'
                                                        : 'bg-white hover:bg-orange-50 hover:border-orange-200 border-gray-100 text-gray-400 hover:text-orange-600'
                                                    }`}
                                                title={status.replace(/_/g, ' ')}
                                            >
                                                <div className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center transition-colors
                                                    ${isActive ? 'bg-white/20' : 'bg-gray-100 group-hover:bg-orange-100'}
                                                `}>
                                                    {getStatusIcon(status)}
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                                <div className="text-center mt-2 text-xs font-medium text-gray-400">
                                    Current Status: <span className="text-gray-900 font-bold uppercase">{selectedOrder.status.replace(/_/g, ' ')}</span>
                                </div>
                            </div>

                            {/* Customer & Delivery */}
                            <div className="bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Details</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-400 shadow-sm shrink-0">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Customer</p>
                                            <p className="font-bold text-gray-900">{selectedOrder.user_name}</p>
                                            <p className="text-sm text-gray-500 capitalize">{selectedOrder.payment_method}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center border border-gray-100 text-gray-400 shadow-sm shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400 font-bold uppercase">Address</p>
                                            <p className="font-medium text-gray-900 leading-relaxed">
                                                {selectedOrder.delivery_address || 'No address provided'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Order Items */}
                            <div>
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Items Ordered</h3>
                                <div className="space-y-3">
                                    {selectedOrder.items.map((item) => (
                                        <div key={item.id} className="flex justify-between items-center p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                                            <div className="flex items-center gap-4">
                                                <div className="bg-orange-50 text-orange-600 w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm border border-orange-100">
                                                    {item.quantity}x
                                                </div>
                                                <span className="font-bold text-gray-900">{item.product_name}</span>
                                            </div>
                                            <div className="font-mono font-medium text-gray-600">KSh {item.price}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-500">Total Amount</span>
                                        <span className="font-black text-3xl text-gray-900">KSh {selectedOrder.total_amount}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-gray-50/30">
                        <div className="bg-white p-6 rounded-full shadow-lg shadow-gray-200 mb-6 animate-bounce-slow">
                            <Package className="w-16 h-16 text-gray-300" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">No Order Selected</h3>
                        <p className="text-gray-500 max-w-xs leading-relaxed">Select an order from the list on the left to view full details and manage delivery status.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
