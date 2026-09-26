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
    if (raw) return JSON.parse(raw);
    // Legacy migration: check 'flembe_wishlist_ids' if key is guest
    if (key === 'flembe_wishlist_guest') {
      const legacy = localStorage.getItem('flembe_wishlist_ids');
      if (legacy) return JSON.parse(legacy);
    }
    return [];
  } catch {
    return [];
  }
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const currentKey = getWishlistKey(user?.id);
  const prevUserRef = useRef<number | null | undefined>(user?.id);

  const [wishlistIds, setWishlistIds] = useState<number[]>(() => loadWishlistFromStorage(currentKey));

  // Switch wishlist when user logs in, logs out, or switches accounts
  useEffect(() => {
    const prevId = prevUserRef.current;
    const currentId = user?.id;
    prevUserRef.current = currentId;

    if (prevId !== currentId) {
      const newKey = getWishlistKey(currentId);
      let userWishlist = loadWishlistFromStorage(newKey);

      // If user just logged in from guest session, merge guest items into user account
      if (!prevId && currentId) {
        const guestWishlist = loadWishlistFromStorage('flembe_wishlist_guest');
        if (guestWishlist.length > 0) {
          userWishlist = Array.from(new Set([...userWishlist, ...guestWishlist]));
          localStorage.setItem(newKey, JSON.stringify(userWishlist));
          localStorage.removeItem('flembe_wishlist_guest');
          localStorage.removeItem('flembe_wishlist_ids');
        }
      }

      setWishlistIds(userWishlist);
    }
  }, [user?.id]);

  // Persist current user's wishlist
  useEffect(() => {
    try {
      localStorage.setItem(currentKey, JSON.stringify(wishlistIds));
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
    toast('Wishlist cleared', { icon: '💔' });
  }, []);

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
