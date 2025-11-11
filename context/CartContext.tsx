import { createContext, useContext, useReducer, useEffect } from 'react';
import type { CartItem, Product } from '../types';

interface CartState {
    items: CartItem[];
    totalItems: number;
    totalPrice: number;
    isOpen: boolean;
    isLoading: boolean;
}

type CartAction =
    | { type: 'ADD_ITEM'; payload: { product: Product; quantity: number } }
    | { type: 'REMOVE_ITEM'; payload: string }
    | { type: 'UPDATE_QUANTITY'; payload: { productId: string; quantity: number } }
    | { type: 'CLEAR_CART' }
    | { type: 'TOGGLE_CART' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'LOAD_CART'; payload: CartItem[] };

const initialState: CartState = {
    items: [],
    totalItems: 0,
    totalPrice: 0,
    isOpen: false,
    isLoading: false,
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
    switch (action.type) {
        case 'ADD_ITEM': {
            const { product, quantity } = action.payload;
            const existingItem = state.items.find(item => item.product.id === product.id);

            let newItems: CartItem[];
            if (existingItem) {
                newItems = state.items.map(item =>
                    item.product.id === product.id
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            } else {
                newItems = [...state.items, { product, quantity }];
            }

            return {
                ...state,
                items: newItems,
                totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
                totalPrice: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            };
        }

        case 'REMOVE_ITEM': {
            const newItems = state.items.filter(item => item.product.id !== action.payload);
            return {
                ...state,
                items: newItems,
                totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
                totalPrice: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            };
        }

        case 'UPDATE_QUANTITY': {
            const { productId, quantity } = action.payload;
            if (quantity <= 0) {
                return cartReducer(state, { type: 'REMOVE_ITEM', payload: productId });
            }

            const newItems = state.items.map(item =>
                item.product.id === productId
                    ? { ...item, quantity }
                    : item
            );

            return {
                ...state,
                items: newItems,
                totalItems: newItems.reduce((sum, item) => sum + item.quantity, 0),
                totalPrice: newItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            };
        }

        case 'CLEAR_CART':
            return {
                ...state,
                items: [],
                totalItems: 0,
                totalPrice: 0,
            };

        case 'TOGGLE_CART':
            return {
                ...state,
                isOpen: !state.isOpen,
            };

        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };

        case 'LOAD_CART':
            return {
                ...state,
                items: action.payload,
                totalItems: action.payload.reduce((sum, item) => sum + item.quantity, 0),
                totalPrice: action.payload.reduce((sum, item) => sum + (item.product.price * item.quantity), 0),
            };

        default:
            return state;
    }
};

interface CartContextType {
    state: CartState;
    addItem: (product: Product, quantity?: number) => void;
    removeItem: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

interface CartProviderProps {
    children: React.ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
    const [state, dispatch] = useReducer(cartReducer, initialState);

    // Load cart from localStorage on mount (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                const cartItems = JSON.parse(savedCart);
                dispatch({ type: 'LOAD_CART', payload: cartItems });
            } catch (error) {
                console.error('Failed to load cart from localStorage:', error);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes (client-side only)
    useEffect(() => {
        if (typeof window === 'undefined') return;
        localStorage.setItem('cart', JSON.stringify(state.items));
    }, [state.items]);

    const addItem = (product: Product, quantity: number = 1) => {
        dispatch({ type: 'ADD_ITEM', payload: { product, quantity } });
    };

    const removeItem = (productId: string) => {
        dispatch({ type: 'REMOVE_ITEM', payload: productId });
    };

    const updateQuantity = (productId: string, quantity: number) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } });
    };

    const clearCart = () => {
        dispatch({ type: 'CLEAR_CART' });
    };

    const toggleCart = () => {
        dispatch({ type: 'TOGGLE_CART' });
    };

    const getItemQuantity = (productId: string): number => {
        const item = state.items.find(item => item.product.id === productId);
        return item ? item.quantity : 0;
    };

    const value: CartContextType = {
        state,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        getItemQuantity,
    };

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
