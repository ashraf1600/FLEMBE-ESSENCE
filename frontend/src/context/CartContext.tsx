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
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentKey = getCartKey(user?.id);
  const prevUserRef = useRef<number | null | undefined>(user?.id);

  // Initialize: if logged in, load user's cart; if not logged in, start with guest cart (or empty)
  const [cart, setCart] = useState<CartItem[]>(() => {
    // Clean any old legacy key
    localStorage.removeItem('flembe_cart');
    return loadCartFromStorage(currentKey);
  });

  // Whenever user changes (login, logout, switch account)
  useEffect(() => {
    const prevId = prevUserRef.current;
    const currentId = user?.id;
    prevUserRef.current = currentId;

    if (prevId !== currentId) {
      if (!currentId) {
        // User logged out: completely reset cart to empty
        setCart([]);
        localStorage.removeItem('flembe_cart_guest');
        localStorage.removeItem('flembe_cart');
        return;
      }

      // User logged in: load their user-specific cart and merge any guest cart items
      const newKey = getCartKey(currentId);
      const userCart = loadCartFromStorage(newKey);
      const guestCart = loadCartFromStorage('flembe_cart_guest');

      let mergedCart = [...userCart];
      if (guestCart.length > 0) {
        guestCart.forEach(gItem => {
          const idx = mergedCart.findIndex(uItem => uItem.product.id === gItem.product.id);
          if (idx >= 0) {
            mergedCart[idx] = {
              ...mergedCart[idx],
              quantity: mergedCart[idx].quantity + gItem.quantity,
            };
          } else {
            mergedCart.push(gItem);
          }
        });
        localStorage.removeItem('flembe_cart_guest');
      }

      setCart(mergedCart);
      try {
        if (mergedCart.length > 0) {
          localStorage.setItem(newKey, JSON.stringify(mergedCart));
        }
      } catch {
        // ignore
      }
      localStorage.removeItem('flembe_cart');
    }
  }, [user?.id]);

  // Persist cart to active key only if there are items or key exists
  useEffect(() => {
    try {
      if (cart.length > 0) {
        localStorage.setItem(currentKey, JSON.stringify(cart));
      } else {
        localStorage.removeItem(currentKey);
      }
    } catch {
      // ignore
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

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(currentKey);
  }, [currentKey]);

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
