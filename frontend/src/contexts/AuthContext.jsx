import { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(undefined);
import { API_URL } from '../config';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') return;

      const response = await fetch(`${API_URL}/auth/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlist(data || []);
      }
    } catch (error) {
      console.error('Error fetching wishlist:', error);
    }
  };

  useEffect(() => {
    // Check for existing session in localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAdmin(userData.role === 'admin');
      fetchWishlist();
    }
    setIsLoading(false);
  }, []);

  const signUp = async (email, password, name) => {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Signup failed');

      if (data.requireVerification) {
        return { requireVerification: true, email: data.email };
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      await fetchWishlist();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const signIn = async (email, password) => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 403 && data.requireVerification) {
          return { requireVerification: true, email: data.email };
        }
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      await fetchWishlist();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const verifyEmail = async (email, code) => {
    try {
      const response = await fetch(`${API_URL}/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Verification failed');

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setUser(data.user);
      setIsAdmin(data.user.role === 'admin');
      await fetchWishlist();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const forgotPassword = async (email) => {
    try {
      const response = await fetch(`${API_URL}/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Forgot password failed');
      return { error: null, message: data.message };
    } catch (error) {
      return { error };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    try {
      const response = await fetch(`${API_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code, newPassword }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Reset password failed');
      return { error: null, message: data.message };
    } catch (error) {
      return { error };
    }
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAdmin(false);
    setWishlist([]);
  };

  const addAddress = async (addressData) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/auth/add-address`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(addressData),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || 'Failed to add address');

      // Update local state
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const toggleWishlist = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { error: 'Not authenticated' };

      // Optimistic update
      const isWishlisted = wishlist.some(item => item.id === productId || item === productId);

      if (isWishlisted) {
        setWishlist(prev => prev.filter(item => item.id !== productId && item !== productId));
        await fetch(`${API_URL}/auth/wishlist/${productId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        // Just push ID optimistically, actual items will be populated on next fetch
        setWishlist(prev => [...prev, productId]);
        await fetch(`${API_URL}/auth/wishlist`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ productId })
        });
      }

      // Sync with server
      await fetchWishlist();
      return { error: null };
    } catch (error) {
      // Revert optimistic update on error
      await fetchWishlist();
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, isAdmin, wishlist, signUp, signIn, signOut, addAddress, verifyEmail, forgotPassword, resetPassword, toggleWishlist }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
