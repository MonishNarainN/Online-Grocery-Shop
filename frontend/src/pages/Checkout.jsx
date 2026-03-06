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
import { API_URL } from '@/config';

// Utility to load external scripts dynamically
function loadScript(src) {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

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
      const totalAmount = totalPrice + shippingCost; // Add any tax logic here

      // 1. Load Razorpay script
      const res = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setIsProcessing(false);
        return;
      }

      // 2. Fetch Razorpay key
      const configRes = await fetch('${API_URL}/payment/config');
      if (!configRes.ok) throw new Error('Could not fetch payment config');
      const { key_id } = await configRes.json();

      // 3. Create Razorpay order on backend
      const orderRes = await fetch('${API_URL}/payment/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ amount: totalAmount }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        // If the backend says the store is offline, alert the user and stop
        if (orderRes.status === 400 && errorData.message && errorData.message.includes('store is offline')) {
          toast.error(errorData.message, { duration: 8000 });
          setIsProcessing(false);
          return;
        }
        throw new Error(errorData.message || 'Failed to create payment order');
      }

      const orderData = await orderRes.json();

      // 4. Initialize Razorpay options
      const options = {
        key: key_id,
        amount: orderData.amount, // Amount is in currency subunits (paise)
        currency: orderData.currency,
        name: 'Friendly Grocer Online',
        description: 'Test Transaction',
        image: 'https://cdn-icons-png.flaticon.com/512/3081/3081840.png', // Or your store logo
        order_id: orderData.id,
        handler: async function (response) {
          try {
            // 5. Verify Signature on backend
            const verifyRes = await fetch('${API_URL}/payment/verify', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
              },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              // 6. Create order in MongoDB (our DB)
              const dbOrderData = {
                items: items.map(item => ({
                  product_id: item.product_id,
                  name: item.product?.name || '',
                  price: item.product?.discountedPrice || item.product?.price || 0,
                  quantity: item.quantity,
                  image_url: item.product?.image_url || null,
                })),
                total_amount: totalAmount,
                shipping_address: address,
                payment_status: 'paid', // Mark as paid since razorpay succeeded
                order_status: 'pending',
                user_id: user.id,
              };

              const finalOrderRes = await fetch('${API_URL}/orders', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(dbOrderData),
              });

              if (!finalOrderRes.ok) {
                toast.error('Payment successful, but order creation failed. Please contact support.');
                return; // It might be good to save the failed creation attempt
              }

              await clearCart();
              toast.success('Order placed successfully!');
              navigate('/orders');
            } else {
              toast.error('Payment verification failed!');
            }
          } catch (err) {
            console.error("Payment Handler Error", err);
            toast.error('An error occurred while verifying the payment.');
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: user.name || 'John Doe',
          email: user.email || 'johndoe@example.com',
          contact: '9999999999' // Ideally from user profile
        },
        notes: {
          address: address
        },
        theme: {
          color: '#3399cc'
        }
      };

      const paymentObject = new window.Razorpay(options);

      paymentObject.on('payment.failed', function (response) {
        console.error("Razorpay Failure", response.error);
        toast.error(`Payment Failed: ${response.error.description}`);
        setIsProcessing(false);
      });

      paymentObject.open();

    } catch (error) {
      console.error('Error initiating checkout:', error);
      toast.error(error.message || 'Failed to initiate checkout');
      setIsProcessing(false); // Reset processing if it fails before opening Razorpay
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <h2 className="text-xl font-semibold mb-6">Payment Options</h2>
              <div className="space-y-4 mb-8">
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg flex items-center gap-3">
                  <div className="bg-white p-2 rounded">
                    <img src="https://razorpay.com/assets/razorpay-logo.svg" alt="Razorpay" className="h-4" />
                  </div>
                  <p className="text-sm font-medium">Pay securely with Cards, UPI, NetBanking, or Wallets.</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-semibold text-lg text-muted-foreground">Order Total</span>
                  <span className="text-2xl font-bold price-tag">₹{(totalPrice + 29).toFixed(2)}</span>
                </div>
                <Button className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? (
                    <div className="flex items-center gap-2 justify-center">
                      <div className="loader !w-5 !h-5 !border-2 !border-white/20 !border-t-white" />
                      <span>Processing Order...</span>
                    </div>
                  ) : (
                    'Submit Payment'
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
