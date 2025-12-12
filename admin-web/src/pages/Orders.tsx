import { CheckCircle, Clock, Eye, Package, Truck } from 'lucide-react';
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
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const response = await api.get('/orders/');
            setOrders(response.data);
        } catch (error) {
            console.error('Error fetching orders:', error);
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
            case 'received': return 'bg-blue-100 text-blue-800';
            case 'preparing': return 'bg-yellow-100 text-yellow-800';
            case 'ready': return 'bg-purple-100 text-purple-800';
            case 'out_for_delivery': return 'bg-orange-100 text-orange-800';
            case 'delivered': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
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
        <div className="flex h-[calc(100vh-4rem)] gap-6">
            {/* Orders List */}
            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b">
                    <h2 className="text-xl font-bold">Orders</h2>
                </div>
                <div className="overflow-y-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50 sticky top-0">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {orders.map((order) => (
                                <tr
                                    key={order.id}
                                    onClick={() => setSelectedOrder(order)}
                                    className={`cursor-pointer hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-orange-50' : ''}`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.user_name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KSh {order.total_amount}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Order Details Panel */}
            {selectedOrder ? (
                <div className="w-96 bg-white rounded-lg shadow-sm p-6 overflow-y-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold">Order #{selectedOrder.id}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedOrder.status)}`}>
                            {selectedOrder.status.replace(/_/g, ' ')}
                        </span>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Update Status</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['received', 'preparing', 'ready', 'out_for_delivery', 'delivered'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => updateStatus(selectedOrder.id, status)}
                                    disabled={selectedOrder.status === status}
                                    className={`flex items-center justify-center p-2 rounded text-xs font-medium border transition-colors
                    ${selectedOrder.status === status
                                            ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                            : 'hover:bg-orange-50 hover:text-primary hover:border-primary border-gray-200'
                                        }`}
                                >
                                    {getStatusIcon(status)}
                                    <span className="ml-1 capitalize">{status.replace(/_/g, ' ')}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Customer Details</h3>
                        <p className="font-medium">{selectedOrder.user_name}</p>
                        <p className="text-sm text-gray-600 mt-1">{selectedOrder.delivery_address || 'No address provided'}</p>
                        <p className="text-sm text-gray-600 mt-1 capitalize">Payment: {selectedOrder.payment_method}</p>
                    </div>

                    <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Order Items</h3>
                        <div className="space-y-3">
                            {selectedOrder.items.map((item) => (
                                <div key={item.id} className="flex justify-between text-sm">
                                    <div>
                                        <span className="font-medium">{item.quantity}x</span> {item.product_name}
                                    </div>
                                    <div className="text-gray-600">KSh {item.price}</div>
                                </div>
                            ))}
                            <div className="border-t pt-3 mt-3 flex justify-between font-bold">
                                <span>Total</span>
                                <span>KSh {selectedOrder.total_amount}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="w-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400">
                    Select an order to view details
                </div>
            )}
        </div>
    );
}
