import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setItems(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      toast.error('Please sign in to add items to cart');
      return;
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product_id === product.id);
      if (existingItem) {
        toast.success('Cart updated!');
        return prevItems.map(item =>
          item.product_id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        toast.success('Added to cart!');
        return [...prevItems, {
          product_id: product.id,
          product: product,
          quantity
        }];
      }
    });
  };

  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setItems(prevItems =>
      prevItems.map(item =>
        item.product_id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = async (productId) => {
    setItems(prevItems => prevItems.filter(item => item.product_id !== productId));
    toast.success('Item removed from cart');
  };

  const clearCart = async () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce((sum, item) => {
    const price = item.product?.price || 0;
    return sum + price * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        itemCount,
        totalPrice,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: () => { }, // No-op for now
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
