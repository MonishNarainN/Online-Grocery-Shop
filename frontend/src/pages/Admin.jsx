import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, Users, LayoutDashboard, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'fresh_produce', stock: '', unit: 'stock', image_url: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Filter and Search States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchProducts(),
      fetchOrders(),
      // Users fetching would need a new admin route
    ]);
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/products');
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/orders/admin/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleSaveProduct = async () => {
    const productData = {
      name: form.name,
      description: form.description,
      price: parseFloat(form.price),
      category: form.category,
      stock: parseInt(form.stock),
      unit: form.unit,
      image_url: form.image_url || null,
    };

    try {
      const url = editingProduct
        ? `http://localhost:5000/api/products/${editingProduct.id}`
        : 'http://localhost:5000/api/products';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(productData),
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product added!');
        setIsDialogOpen(false);
        setEditingProduct(null);
        setForm({ name: '', description: '', price: '', category: 'fresh_produce', stock: '', unit: 'stock', image_url: '' });
        fetchProducts();
      } else {
        throw new Error('Failed to save product');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeleteProduct = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Product deleted!');
        fetchProducts();
      }
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ order_status: status }),
      });
      if (response.ok) {
        toast.success('Order updated!');
        fetchOrders();
      }
    } catch (error) {
      toast.error('Failed to update order');
    }
  };

  const handleToggleRole = async (userId, currentRole) => {
    // Note: This would require a specific user management route in the backend
    toast.error('User management API not yet implemented');
  };

  const openEditDialog = (product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      category: product.category,
      stock: product.stock.toString(),
      unit: product.unit || 'stock',
      image_url: product.image_url || '',
    });
    setIsDialogOpen(true);
  };

  const stats = {
    totalSales: orders.filter(o => o.payment_status === 'paid').reduce((acc, curr) => acc + curr.total_amount, 0),
    totalOrders: orders.length,
    activeProducts: products.filter(p => p.is_active).length,
    totalUsers: users.length
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.description?.toLowerCase().includes(productSearch.toLowerCase());
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredOrders = orders.filter(o => {
    const matchesSearch = o.id.toLowerCase().includes(orderSearch.toLowerCase());
    const matchesStatus = orderStatusFilter === 'all' || o.order_status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredUsers = users.filter(u => {
    return u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email.toLowerCase().includes(userSearch.toLowerCase());
  });

  if (isLoading) return <Layout><div className="container py-16 text-center">Loading Admin Panel...</div></Layout>;

  const isMasterAdmin = user?.email?.toLowerCase().trim() === 'rajarajeshwari@gmail.com';
  if (!user || (!isAdmin && !isMasterAdmin)) return <Navigate to="/auth" replace />;

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your store, products, and customers.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary border border-primary/20">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-semibold">Store is Online</span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-500"><DollarSign className="h-6 w-6" /></div>
              <span className="text-2xl font-bold price-tag">${stats.totalSales.toFixed(2)}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Revenue</p>
          </div>
          <div className="bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-500/20 rounded-xl text-blue-500"><ShoppingBag className="h-6 w-6" /></div>
              <span className="text-2xl font-bold">{stats.totalOrders}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
          </div>
          <div className="bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-500/20 rounded-xl text-purple-500"><Package className="h-6 w-6" /></div>
              <span className="text-2xl font-bold">{stats.activeProducts}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Active Products</p>
          </div>
          <div className="bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-500/20 rounded-xl text-orange-500"><Users className="h-6 w-6" /></div>
              <span className="text-2xl font-bold">{stats.totalUsers}</span>
            </div>
            <p className="text-sm text-muted-foreground font-medium">Customers</p>
          </div>
        </div>

        <Tabs defaultValue="products" className="space-y-6">
          <TabsList className="bg-card/30 backdrop-blur-xl border border-white/5 p-1">
            <TabsTrigger value="products" className="flex items-center gap-2"><Package className="h-4 w-4" /> Products</TabsTrigger>
            <TabsTrigger value="orders" className="flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Orders</TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2"><Users className="h-4 w-4" /> Customers</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                  <Input
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="bg-card/20 border-white/10"
                  />
                </div>
                <Select value={productCategoryFilter} onValueChange={setProductCategoryFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-card/20 border-white/10">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild><Button onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', price: '', category: 'fresh_produce', stock: '', unit: 'stock', image_url: '' }); }} className="w-full md:w-auto"><Plus className="mr-2 h-4 w-4" />Add Product</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Price ($)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                      <div>
                        <Label>Stock</Label>
                        <div className="flex gap-2">
                          <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="flex-1" />
                          <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v })}>
                            <SelectTrigger className="w-24"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="stock">Count</SelectItem>
                              <SelectItem value="kg">Kg</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <div><Label>Category</Label>
                      <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div><Label>Image URL</Label><Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." /></div>
                    <Button className="w-full" onClick={handleSaveProduct}>{editingProduct ? 'Update' : 'Add'} Product</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4">Product</th>
                    <th className="text-left p-4">Category</th>
                    <th className="text-left p-4">Price</th>
                    <th className="text-left p-4">Stock</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredProducts.map(p => (
                    <tr key={p.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          {p.image_url && <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-white/10" />}
                          <div>
                            <p className="font-medium">{p.name}</p>
                            {!p.is_active && <Badge variant="secondary" className="text-[10px] h-4">Inactive</Badge>}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-sm">{CATEGORY_LABELS[p.category]}</td>
                      <td className="p-4 font-semibold price-tag">${p.price.toFixed(2)}</td>
                      <td className="p-4">
                        <Badge variant={p.stock < 10 ? 'destructive' : 'outline'} className="font-mono">
                          {p.stock} {p.unit === 'kg' ? 'kg' : ''}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(p)} className="hover:bg-primary/20 hover:text-primary"><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={() => handleDeleteProduct(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="p-12 text-center text-muted-foreground italic">No products found matching your criteria.</div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Customer Orders ({orders.length})</h2>
              <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative w-full md:w-72">
                  <Input
                    placeholder="Search Order ID..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    className="bg-card/20 border-white/10"
                  />
                </div>
                <Select value={orderStatusFilter} onValueChange={setOrderStatusFilter}>
                  <SelectTrigger className="w-full md:w-48 bg-card/20 border-white/10">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-4">
              {filteredOrders.map(order => (
                <div key={order.id} className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-xl hover:border-primary/30 transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="font-semibold">Order #{order.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">{format(new Date(order.created_at), 'PPP')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={order.order_status} onValueChange={(v) => handleUpdateOrderStatus(order.id, v)}>
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="processing">Processing</SelectItem>
                          <SelectItem value="shipped">Shipped</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span>{order.items.length} items</span>
                      <Button variant="link" size="sm" onClick={() => { setSelectedOrder(order); setIsOrderDetailsOpen(true); }} className="p-0 h-auto text-primary">View Details</Button>
                    </div>
                    <span className="font-semibold price-tag">${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            <Dialog open={isOrderDetailsOpen} onOpenChange={setIsOrderDetailsOpen}>
              <DialogContent className="max-w-xl">
                <DialogHeader>
                  <DialogTitle>Order Details - #{selectedOrder?.id.slice(0, 8).toUpperCase()}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="bg-secondary/20 p-4 rounded-xl space-y-2">
                    <p className="text-sm"><strong>Customer ID:</strong> {selectedOrder?.user_id}</p>
                    <p className="text-sm"><strong>Shipping Address:</strong> {selectedOrder?.shipping_address}</p>
                    <p className="text-sm"><strong>Date:</strong> {selectedOrder && format(new Date(selectedOrder.created_at), 'PPP p')}</p>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto space-y-3 pr-2">
                    {selectedOrder?.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-card/50 border border-white/5 rounded-lg">
                        <div className="flex items-center gap-3">
                          {item.image_url && <img src={item.image_url} alt={item.name} className="h-10 w-10 rounded-md object-cover" />}
                          <div>
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount</span>
                      <span className="price-tag">${selectedOrder?.total_amount.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="users">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Registered Customers ({users.length})</h2>
              <div className="relative w-full md:w-72">
                <Input
                  placeholder="Search by name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="bg-card/20 border-white/10"
                />
              </div>
            </div>
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl">
              <table className="w-full">
                <thead className="bg-white/5">
                  <tr>
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Joined</th>
                    <th className="text-left p-4">Role</th>
                    <th className="p-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-medium">{u.name}</td>
                      <td className="p-4 text-muted-foreground">{u.email}</td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {format(new Date(u.created_at), 'MMM d, yyyy')}
                      </td>
                      <td className="p-4">
                        <Badge variant={u.role === 'admin' ? 'default' : 'secondary'} className="capitalize">
                          {u.role}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleRole(u.user_id, u.role)}
                          className="text-[10px] uppercase font-bold tracking-wider"
                          disabled={u.email === 'rajarajeshwari@gmail.com'}
                        >
                          {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}
