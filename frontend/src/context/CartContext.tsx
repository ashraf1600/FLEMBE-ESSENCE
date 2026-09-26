import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type { CartItem, ProductListItem } from '../types';
import { useAuth } from './AuthContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ProductListItem, quantity?: number) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

function getCartKey(userId?: number | null): string {
  return userId ? `flembe_cart_user_${userId}` : 'flembe_cart_guest';
}

function loadCartFromStorage(key: string): CartItem[] {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
    // Legacy migration: check 'flembe_cart' if key is guest
    if (key === 'flembe_cart_guest') {
      const legacy = localStorage.getItem('flembe_cart');
      if (legacy) return JSON.parse(legacy);
    }
    return [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentKey = getCartKey(user?.id);
  const prevUserRef = useRef<number | null | undefined>(user?.id);

  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage(currentKey));

  // Whenever user changes (login, logout, switch account)
  useEffect(() => {
    const prevId = prevUserRef.current;
    const currentId = user?.id;
    prevUserRef.current = currentId;

    if (prevId !== currentId) {
      const newKey = getCartKey(currentId);
      let userCart = loadCartFromStorage(newKey);

      // If user just logged in from guest, merge guest cart into user's cart
      if (!prevId && currentId) {
        const guestCart = loadCartFromStorage('flembe_cart_guest');
        if (guestCart.length > 0) {
          const merged = [...userCart];
          guestCart.forEach(gItem => {
            const idx = merged.findIndex(m => m.product.id === gItem.product.id);
            if (idx > -1) {
              merged[idx].quantity += gItem.quantity;
            } else {
              merged.push(gItem);
            }
          });
          userCart = merged;
          localStorage.setItem(newKey, JSON.stringify(userCart));
          localStorage.removeItem('flembe_cart_guest');
          localStorage.removeItem('flembe_cart');
        }
      }

      setCart(userCart);
    }
  }, [user?.id]);

  // Persist every change back to the active user's storage key
  useEffect(() => {
    try {
      localStorage.setItem(currentKey, JSON.stringify(cart));
    } catch {
      // localStorage quota exceeded or unavailable — fail silently
    }
  }, [cart, currentKey]);

  const addToCart = useCallback((product: ProductListItem, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  }, []);

  const updateQuantity = useCallback((productId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCart(prev => prev.map(item =>
        item.product.id === productId ? { ...item, quantity } : item
      ));
    }
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce(
    (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
