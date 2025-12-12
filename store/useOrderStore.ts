
import { create } from 'zustand';

export type OrderStatus = 'received' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered';

interface OrderState {
    status: OrderStatus;
    setStatus: (status: OrderStatus) => void;
    resetOrder: () => void;
}

export const useOrderStore = create<OrderState>((set) => ({
    status: 'received',
    setStatus: (status) => set({ status }),
    resetOrder: () => set({ status: 'received' }),
}));
