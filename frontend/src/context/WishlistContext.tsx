import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlistIds: number[];
  isInWishlist: (productId: number) => boolean;
  toggleWishlist: (productId: number) => boolean;
  removeFromWishlist: (productId: number) => void;
  clearWishlist: () => void;
  totalWishlist: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

function getWishlistKey(userId?: number | null): string {
  return userId ? `flembe_wishlist_user_${userId}` : 'flembe_wishlist_guest';
}

function loadWishlistFromStorage(key: string): number[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentKey = getWishlistKey(user?.id);
  const prevUserRef = useRef<number | null | undefined>(user?.id);

  // Initialize: if logged in, load user's wishlist; clean any legacy key
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => {
    localStorage.removeItem('flembe_wishlist_ids');
    return loadWishlistFromStorage(currentKey);
  });

  // Whenever user changes (login, logout, switch account)
  useEffect(() => {
    const prevId = prevUserRef.current;
    const currentId = user?.id;
    prevUserRef.current = currentId;

    if (prevId !== currentId) {
      if (!currentId) {
        // User logged out: completely reset wishlist to empty
        setWishlistIds([]);
        localStorage.removeItem('flembe_wishlist_guest');
        localStorage.removeItem('flembe_wishlist_ids');
        return;
      }

      // User logged in: load their user-specific wishlist
      const newKey = getWishlistKey(currentId);
      const userWishlist = loadWishlistFromStorage(newKey);
      setWishlistIds(userWishlist);
      localStorage.removeItem('flembe_wishlist_guest');
      localStorage.removeItem('flembe_wishlist_ids');
    }
  }, [user?.id]);

  // Persist current user's wishlist
  useEffect(() => {
    try {
      if (wishlistIds.length > 0) {
        localStorage.setItem(currentKey, JSON.stringify(wishlistIds));
      } else {
        localStorage.removeItem(currentKey);
      }
    } catch {
      // ignore
    }
  }, [wishlistIds, currentKey]);

  const isInWishlist = useCallback((productId: number) => {
    return wishlistIds.includes(productId);
  }, [wishlistIds]);

  const toggleWishlist = useCallback((productId: number): boolean => {
    let newState = false;
    setWishlistIds(prev => {
      const exists = prev.includes(productId);
      newState = !exists;
      if (exists) {
        toast('Removed from Wishlist', { icon: '💔' });
        return prev.filter(id => id !== productId);
      } else {
        toast('Added to Wishlist!', { icon: '❤️' });
        return [...prev, productId];
      }
    });
    return newState;
  }, []);

  const removeFromWishlist = useCallback((productId: number) => {
    setWishlistIds(prev => prev.filter(id => id !== productId));
    toast('Removed from Wishlist', { icon: '💔' });
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlistIds([]);
    localStorage.removeItem(currentKey);
    toast('Wishlist cleared', { icon: '💔' });
  }, [currentKey]);

  const totalWishlist = wishlistIds.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        isInWishlist,
        toggleWishlist,
        removeFromWishlist,
        clearWishlist,
        totalWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error('useWishlist must be used within WishlistProvider');
  return ctx;
};
