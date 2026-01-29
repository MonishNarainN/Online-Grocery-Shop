import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { OrderCard } from '@/components/orders/OrderCard';
import { useAuth } from '@/contexts/AuthContext';
export default function Orders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      setOrders([]);
      return;
    }
    const fetchOrders = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setOrders(data || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, [user]);

  if (!user) {
    return (
      <Layout>
        <div className="container py-16 text-center">
          <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-display text-2xl font-bold mb-2">Sign in to view orders</h1>
          <Button asChild><Link to="/auth">Sign In</Link></Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="font-display text-3xl font-bold mb-8">My Orders</h1>
        {isLoading ? (
          <div className="grid gap-4">{[1, 2, 3].map(i => <div key={i} className="h-40 bg-card rounded-xl animate-pulse" />)}</div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No orders yet</p>
            <Button asChild><Link to="/products">Start Shopping</Link></Button>
          </div>
        ) : (
          <div className="grid gap-4">{orders.map(order => <OrderCard key={order.id} order={order} />)}</div>
        )}
      </div>
    </Layout>
  );
}
