import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { CartItem } from '@/components/cart/CartItem';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export default function Cart() {
  const { user } = useAuth();
  const { items, totalPrice, isLoading } = useCart();

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to view your cart</h1>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-4">Start adding some products!</p>
          <Button asChild><Link to="/products">Browse Products</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-8">Shopping Cart</h1>
        <div className="grid lg:grid-cols-3 gap-8 relative z-10">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-xl shadow-xl">
              {items.map(item => <CartItem key={item.id} item={item} />)}
            </div>
          </div>
          <div className="p-6 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-xl shadow-xl h-fit sticky top-24">
            <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 mb-4">
              <div className="flex justify-between"><span>Subtotal</span><span>₹{totalPrice.toFixed(2)}</span></div>
              <div className="flex justify-between"><span>Delivery</span><span>₹29.00</span></div>
            </div>
            <div className="border-t border-white/10 pt-4 mb-6">
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span><span className="price-tag">₹{(totalPrice + 29).toFixed(2)}</span>
              </div>
            </div>
            <Button className="w-full btn-primary-hover" size="lg" asChild><Link to="/checkout">Proceed to Checkout</Link></Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
