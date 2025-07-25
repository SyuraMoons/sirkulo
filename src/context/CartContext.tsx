import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { apiService } from '@/src/services/api';
import { useAuth } from '@/src/contexts/AuthContext';

import { CraftItem } from '@/src/constants/crafts';

export interface CartItem extends CraftItem {
  quantity: number;
  cartItemId?: number; // Backend cart item ID
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;
}

type CartAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  isLoading: false,
  error: null,
};

// Helper function to parse price string to number
const parsePrice = (priceString: string): number => {
  // Extract numbers from price string like "IDR 150,000" or "IDR 30,000 / kg"
  const match = priceString.match(/[\d,]+/);
  if (match) {
    return parseInt(match[0].replace(/,/g, ''), 10);
  }
  return 0;
};

// Helper function to calculate totals
const calculateTotals = (items: CartItem[]) => {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => sum + parsePrice(item.price) * item.quantity, 0);
  return { totalItems, totalPrice };
};

const cartReducer = (state: CartState, action: CartAction): CartState => {
  switch (action.type) {
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_CART': {
      const { totalItems, totalPrice } = calculateTotals(action.payload);
      return {
        ...state,
        items: action.payload,
        totalItems,
        totalPrice,
        isLoading: false,
        error: null,
      };
    }

    case 'ADD_ITEM': {
      const existingItem = state.items.find(item => item.id === action.payload.id);

      let newItems: CartItem[];
      if (existingItem) {
        // If item exists, increase quantity
        newItems = state.items.map(item =>
          item.id === action.payload.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // If item doesn't exist, add with quantity 1
        newItems = [...state.items, { ...action.payload, quantity: 1 }];
      }

      const { totalItems, totalPrice } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        error: null,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { totalItems, totalPrice } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        error: null,
      };
    }

    case 'UPDATE_QUANTITY': {
      const newItems = state.items
        .map(item =>
          item.id === action.payload.id ? { ...item, quantity: action.payload.quantity } : item
        )
        .filter(item => item.quantity > 0); // Remove items with 0 quantity

      const { totalItems, totalPrice } = calculateTotals(newItems);
      return {
        ...state,
        items: newItems,
        totalItems,
        totalPrice,
        error: null,
      };
    }

    case 'CLEAR_CART': {
      return {
        ...state,
        items: [],
        totalItems: 0,
        totalPrice: 0,
        error: null,
      };
    }

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CraftItem) => Promise<boolean>;
  removeItem: (id: string) => Promise<boolean>;
  updateQuantity: (id: string, quantity: number) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
  isItemInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);
  const { state: authState } = useAuth();

  // Load cart when user logs in
  useEffect(() => {
    if (authState.isAuthenticated) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [authState.isAuthenticated]);

  const refreshCart = async () => {
    if (!authState.isAuthenticated) return;

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await apiService.getCart();
      
      if (response.success && response.data) {
        // Convert backend cart items to frontend format
        const cartItems: CartItem[] = response.data.items?.map((item: any) => ({
          id: item.listing?.id?.toString() || item.id?.toString(),
          name: item.listing?.title || 'Unknown Item',
          category: 'Home Furniture', // Default category, could be mapped from backend
          rating: 4.5, // Default rating
          ratingCount: 1,
          price: `IDR ${item.listing?.pricePerUnit?.toLocaleString('id-ID') || '0'}`,
          stock: item.listing?.quantity || 0,
          seller: item.listing?.user?.fullName || 'Unknown Seller',
          details: item.listing?.wasteType || 'Unknown',
          image: require('@/assets/images/plastic-chair.jpg'), // Default image
          quantity: item.quantity,
          cartItemId: item.id,
        })) || [];
        
        dispatch({ type: 'SET_CART', payload: cartItems });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to load cart' });
      }
    } catch (error) {
      console.error('Error refreshing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load cart' });
    }
  };

  const addItem = async (item: CraftItem): Promise<boolean> => {
    if (!authState.isAuthenticated) {
      // For non-authenticated users, use local state
      dispatch({ type: 'ADD_ITEM', payload: item });
      return true;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      // Convert frontend item ID to backend listing ID
      const listingId = parseInt(item.id);
      const response = await apiService.addToCart(listingId, 1);
      
      if (response.success) {
        // Refresh cart to get updated data
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to add item' });
        return false;
      }
    } catch (error) {
      console.error('Error adding item to cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to add item' });
      return false;
    }
  };

  const removeItem = async (id: string): Promise<boolean> => {
    if (!authState.isAuthenticated) {
      // For non-authenticated users, use local state
      dispatch({ type: 'REMOVE_ITEM', payload: id });
      return true;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const cartItem = state.items.find(item => item.id === id);
      if (!cartItem?.cartItemId) {
        dispatch({ type: 'SET_ERROR', payload: 'Cart item not found' });
        return false;
      }

      const response = await apiService.removeFromCart(cartItem.cartItemId);
      
      if (response.success) {
        // Refresh cart to get updated data
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to remove item' });
        return false;
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to remove item' });
      return false;
    }
  };

  const updateQuantity = async (id: string, quantity: number): Promise<boolean> => {
    if (!authState.isAuthenticated) {
      // For non-authenticated users, use local state
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
      return true;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const cartItem = state.items.find(item => item.id === id);
      if (!cartItem?.cartItemId) {
        dispatch({ type: 'SET_ERROR', payload: 'Cart item not found' });
        return false;
      }

      const response = await apiService.updateCartItem(cartItem.cartItemId, quantity);
      
      if (response.success) {
        // Refresh cart to get updated data
        await refreshCart();
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to update quantity' });
        return false;
      }
    } catch (error) {
      console.error('Error updating cart item:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to update quantity' });
      return false;
    }
  };

  const clearCart = async (): Promise<boolean> => {
    if (!authState.isAuthenticated) {
      // For non-authenticated users, use local state
      dispatch({ type: 'CLEAR_CART' });
      return true;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await apiService.clearCart();
      
      if (response.success) {
        dispatch({ type: 'CLEAR_CART' });
        return true;
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error || 'Failed to clear cart' });
        return false;
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to clear cart' });
      return false;
    }
  };

  const isItemInCart = (id: string): boolean => {
    return state.items.some(item => item.id === id);
  };

  const getItemQuantity = (id: string): number => {
    const item = state.items.find(item => item.id === id);
    return item ? item.quantity : 0;
  };

  const value: CartContextType = {
    state,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    refreshCart,
    isItemInCart,
    getItemQuantity,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

// Helper function to format price for display
export const formatPrice = (price: number): string => {
  return `IDR ${price.toLocaleString('id-ID')}`;
};