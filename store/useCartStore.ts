
import { create } from 'zustand';

export interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    image: string;
    category: number;
    rating: number;
    calories: number;
    restaurant_data?: {
        name: string;
        whatsapp_number: string;
    };
}

export interface CartItem extends Product {
    quantity: number;
}

interface CartState {
    items: CartItem[];
    addItem: (product: Product) => void;
    removeItem: (productId: number) => void;
    incrementQuantity: (productId: number) => void;
    decrementQuantity: (productId: number) => void;
    clearCart: () => void;
    getTotal: () => number;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    addItem: (product) => {
        set((state) => {
            const existingItem = state.items.find((item) => item.id === product.id);
            if (existingItem) {
                return {
                    items: state.items.map((item) =>
                        item.id === product.id
                            ? { ...item, quantity: item.quantity + 1 }
                            : item
                    ),
                };
            }
            return { items: [...state.items, { ...product, quantity: 1 }] };
        });
    },
    removeItem: (productId: number) => {
        set((state) => ({
            items: state.items.filter((item) => item.id !== productId),
        }));
    },
    incrementQuantity: (productId: number) => {
        set((state) => ({
            items: state.items.map((item) =>
                item.id === productId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ),
        }));
    },
    decrementQuantity: (productId: number) => {
        set((state) => ({
            items: state.items.map((item) =>
                item.id === productId && item.quantity > 1
                    ? { ...item, quantity: item.quantity - 1 }
                    : item
            ),
        }));
    },
    clearCart: () => set({ items: [] }),
    getTotal: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.price * item.quantity, 0);
    },
}));
