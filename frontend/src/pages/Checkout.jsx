import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Package, ShoppingCart } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export default function Checkout() {
  const { user, addAddress } = useAuth();
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (!user || !address.trim()) {
      toast.error('Please fill in your address');
      return;
    }
    setIsProcessing(true);

    try {
      const shippingCost = 2.99;
      const totalAmount = totalPrice + shippingCost;

      const orderData = {
        items: items.map(item => ({
          product_id: item.product_id,
          name: item.product?.name || '',
          price: item.product?.price || 0,
          quantity: item.quantity,
          image_url: item.product?.image_url || null,
        })),
        total_amount: totalAmount,
        shipping_address: address,
        payment_status: 'paid', // Simulating successful payment
        order_status: 'pending',
        user_id: user.id, // Include user_id for the backend
      };

      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      await clearCart();
      toast.success('Order placed successfully!');
      navigate('/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.message || 'Failed to place order');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <Layout>
      <div className="container py-8 max-w-3xl">
        <h1 className="font-display text-4xl font-bold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" /> Delivery Address
              </h2>

              {/* Saved Addresses */}
              {user?.saved_addresses?.length > 0 && (
                <div className="grid gap-4 mb-6">
                  {user.saved_addresses.map((addr, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${address === addr.address_line ? 'border-primary bg-primary/10' : 'border-white/10 hover:bg-white/5'}`}
                      onClick={() => setAddress(addr.address_line)}
                    >
                      <div className="font-semibold text-sm mb-1">{addr.label || 'Saved Address'}</div>
                      <div className="text-sm text-muted-foreground">
                        {addr.address_line}, {addr.city} - {addr.pincode}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Address Trigger */}
              <div className="space-y-4">
                <Label className="text-sm font-medium">Add New Address</Label>
                <div className="grid gap-4 p-4 border border-white/10 rounded-xl bg-black/20">
                  <Input
                    placeholder="Label (e.g., Home, Work)"
                    id="new-addr-label"
                    className="bg-card/20 border-white/10"
                  />
                  <Input
                    placeholder="Address Line"
                    id="new-addr-line"
                    className="bg-card/20 border-white/10"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="City"
                      id="new-addr-city"
                      defaultValue="Tiruvannamalai"
                      readOnly
                      className="bg-card/20 border-white/10 opacity-70 cursor-not-allowed"
                    />
                    <Input
                      placeholder="Pincode"
                      id="new-addr-pin"
                      className="bg-card/20 border-white/10"
                    />
                  </div>
                  <Button variant="secondary" size="sm" onClick={async () => {
                    const label = document.getElementById('new-addr-label').value;
                    const line = document.getElementById('new-addr-line').value;
                    const city = document.getElementById('new-addr-city').value;
                    const pin = document.getElementById('new-addr-pin').value;

                    if (!line || !city || !pin) return toast.error("Please fill address details");
                    if (city !== "Tiruvannamalai") return toast.error("We only serve within Tiruvannamalai");

                    const { error } = await addAddress({ label, address_line: line, city, pincode: pin }); // Using context function
                    if (!error) {
                      toast.success("Address added!");
                      setAddress(line); // Auto-select
                      // clear fields
                      document.getElementById('new-addr-label').value = '';
                      document.getElementById('new-addr-line').value = '';
                      document.getElementById('new-addr-pin').value = '';
                    } else {
                      toast.error(error.message || "Failed to save address");
                    }
                  }}>
                    Save & Use Address
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" /> Order Summary
              </h2>
              <div className="space-y-4 mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-3">
                      <span className="font-medium">{item.product?.name}</span>
                      <span className="text-muted-foreground">x{item.quantity}</span>
                    </div>
                    <span className="font-semibold">₹{(item.product?.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-white/10 space-y-2">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Subtotal</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Shipping</span>
                  <span>₹29.00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl sticky top-24">
              <h2 className="text-xl font-semibold mb-6">Payment (Demo)</h2>
              <div className="space-y-4 mb-8">
                <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Card Number</Label><Input placeholder="4242 4242 4242 4242" disabled className="bg-card/20 border-white/10" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">Expiry</Label><Input placeholder="12/28" disabled className="bg-card/20 border-white/10" /></div>
                  <div><Label className="text-xs uppercase tracking-wider text-muted-foreground">CVC</Label><Input placeholder="123" disabled className="bg-card/20 border-white/10" /></div>
                </div>
                <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
                  <p className="text-[10px] text-primary font-medium leading-tight">This is a demonstration environment. No real charges will be applied to your card.</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-lg text-muted-foreground">Order Total</span>
                  <span className="text-2xl font-bold price-tag">₹{(totalPrice + 29).toFixed(2)}</span>
                </div>
                <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? 'Processing Order...' : 'Submit Payment'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
