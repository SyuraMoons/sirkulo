import React, { createContext, useContext, useReducer, ReactNode } from 'react';

import { CraftItem } from '@/src/constants/crafts';

export interface CartItem extends CraftItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

type CartAction =
  | { type: 'ADD_ITEM'; payload: CraftItem }
  | { type: 'REMOVE_ITEM'; payload: string }
  | { type: 'UPDATE_QUANTITY'; payload: { id: string; quantity: number } }
  | { type: 'CLEAR_CART' };

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
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
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case 'REMOVE_ITEM': {
      const newItems = state.items.filter(item => item.id !== action.payload);
      const { totalItems, totalPrice } = calculateTotals(newItems);
      return {
        items: newItems,
        totalItems,
        totalPrice,
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
        items: newItems,
        totalItems,
        totalPrice,
      };
    }

    case 'CLEAR_CART': {
      return initialState;
    }

    default:
      return state;
  }
};

interface CartContextType {
  state: CartState;
  addItem: (item: CraftItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  isItemInCart: (id: string) => boolean;
  getItemQuantity: (id: string) => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const addItem = (item: CraftItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };

  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
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
