import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Package, Users, LayoutDashboard, ShoppingBag, DollarSign, TrendingUp, Tag, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { PRODUCT_CATEGORIES, CATEGORY_LABELS } from '@/lib/types';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { API_URL } from '@/config';

export default function Admin() {
  const { user, isAdmin, isLoading } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPromoDialogOpen, setIsPromoDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editingPromo, setEditingPromo] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', category: 'fresh_produce', stock: '', unit: 'stock', image_url: '', imageFile: null });
  const [promoForm, setPromoForm] = useState({ name: '', target: 'All', targetValue: 'fresh_produce', discountPercent: '', minQuantity: '0', endDate: '' });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);

  // Store Setting State
  const [storeOnline, setStoreOnline] = useState(true);
  const [offlineDate, setOfflineDate] = useState('');
  const [offlineHour, setOfflineHour] = useState('12');
  const [offlineMinute, setOfflineMinute] = useState('00');
  const [offlineAmPm, setOfflineAmPm] = useState('PM');
  const [isStoreSettingsOpen, setIsStoreSettingsOpen] = useState(false);

  // Filter and Search States
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('all');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    await Promise.all([
      fetchSettings(),
      fetchProducts(),
      fetchOrders(),
      fetchPromotions(),
      fetchUsers(),
    ]);
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch('${API_URL}/settings');
      if (response.ok) {
        const data = await response.json();
        setStoreOnline(data.is_online);
        if (data.offline_until) {
          const dt = new Date(data.offline_until);

          const yyyy = dt.getFullYear();
          const mm = String(dt.getMonth() + 1).padStart(2, '0');
          const dd = String(dt.getDate()).padStart(2, '0');
          setOfflineDate(`${yyyy}-${mm}-${dd}`);

          let h = dt.getHours();
          const ampm = h >= 12 ? 'PM' : 'AM';
          h = h % 12;
          if (h === 0) h = 12;
          setOfflineHour(String(h).padStart(2, '0'));

          setOfflineMinute(String(dt.getMinutes()).padStart(2, '0'));
          setOfflineAmPm(ampm);
        } else {
          setOfflineDate('');
          setOfflineHour('12');
          setOfflineMinute('00');
          setOfflineAmPm('PM');
        }
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleUpdateStoreStatus = async () => {
    try {
      let isoString = null;
      if (!storeOnline && offlineDate) {
        let hours = parseInt(offlineHour, 10);
        if (offlineAmPm === 'PM' && hours < 12) hours += 12;
        if (offlineAmPm === 'AM' && hours === 12) hours = 0;

        const dt = new Date(`${offlineDate}T${String(hours).padStart(2, '0')}:${offlineMinute}:00`);
        isoString = dt.toISOString();
      }

      const response = await fetch('${API_URL}/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          is_online: storeOnline,
          offline_until: isoString
        })
      });
      if (response.ok) {
        toast.success(`Store is now ${storeOnline ? 'Online' : 'Offline'}`);
        setIsStoreSettingsOpen(false);
        fetchSettings();
      } else {
        toast.error('Failed to update store status');
      }
    } catch (error) {
      toast.error('Failed to update store status');
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('${API_URL}/auth/admin/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        console.error('Failed to fetch users, status:', response.status);
        setUsers([]);
        return;
      }
      const data = await response.json();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch('${API_URL}/products');
      const data = await response.json();
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('${API_URL}/orders/admin/all', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        console.error('Failed to fetch orders, status:', response.status);
        setOrders([]);
        return;
      }
      const data = await response.json();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    }
  };

  const handleSaveProduct = async () => {
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('description', form.description);
    formData.append('price', form.price);
    formData.append('category', form.category);
    formData.append('stock', form.stock);
    formData.append('unit', form.unit);

    if (form.image_url) formData.append('image_url', form.image_url);
    if (form.imageFile) formData.append('image', form.imageFile);

    try {
      const url = editingProduct
        ? `${API_URL}/products/${editingProduct.id}`
        : '${API_URL}/products';

      const response = await fetch(url, {
        method: editingProduct ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData,
      });

      if (response.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product added!');
        setIsDialogOpen(false);
        setEditingProduct(null);
        setForm({ name: '', description: '', price: '', category: 'fresh_produce', stock: '', unit: 'stock', image_url: '', imageFile: null });
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
      const response = await fetch(`${API_URL}/products/${id}`, {
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

  const handleDownloadBill = async (orderId) => {
    try {
      const response = await fetch(`${API_URL}/orders/${orderId}/bill`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to download bill');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill_${orderId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('Bill downloaded successfully!');
    } catch (error) {
      console.error('Error downloading bill:', error);
      toast.error('Failed to download bill');
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      const response = await fetch(`${API_URL}/orders/${id}/status`, {
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
    try {
      const newRole = currentRole === 'admin' ? 'customer' : 'admin';
      const response = await fetch(`${API_URL}/auth/admin/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) {
        toast.success(`User role updated to ${newRole}!`);
        fetchUsers();
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to update user role');
      }
    } catch (error) {
      toast.error('Failed to update user role');
    }
  };

  const fetchPromotions = async () => {
    try {
      const response = await fetch('${API_URL}/promotions/admin', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) {
        console.error('Failed to fetch promotions, status:', response.status);
        setPromotions([]);
        return;
      }
      const data = await response.json();
      setPromotions(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching promotions:', error);
      setPromotions([]);
    }
  };

  const handleSavePromotion = async () => {
    const promoData = {
      name: promoForm.name,
      target: promoForm.target,
      targetValue: promoForm.target === 'All' ? null : promoForm.targetValue,
      discountPercent: parseFloat(promoForm.discountPercent),
      minQuantity: parseInt(promoForm.minQuantity) || 0,
      isActive: true,
    };
    if (promoForm.endDate) {
      promoData.endDate = new Date(promoForm.endDate).toISOString();
    }

    try {
      const url = editingPromo
        ? `${API_URL}/promotions/${editingPromo.id}`
        : '${API_URL}/promotions';

      const response = await fetch(url, {
        method: editingPromo ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(promoData),
      });

      if (response.ok) {
        toast.success(editingPromo ? 'Promotion updated!' : 'Promotion added!');
        setIsPromoDialogOpen(false);
        setEditingPromo(null);
        setPromoForm({ name: '', target: 'All', targetValue: 'fresh_produce', discountPercent: '', minQuantity: '0', endDate: '' });
        fetchPromotions();
      } else {
        throw new Error('Failed to save promotion');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDeletePromotion = async (id) => {
    try {
      const response = await fetch(`${API_URL}/promotions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (response.ok) {
        toast.success('Promotion deleted!');
        fetchPromotions();
      }
    } catch (error) {
      toast.error('Failed to delete promotion');
    }
  };

  const openPromoEditDialog = (promo) => {
    setEditingPromo(promo);
    setPromoForm({
      name: promo.name,
      target: promo.target,
      targetValue: promo.targetValue || 'fresh_produce',
      discountPercent: promo.discountPercent.toString(),
      minQuantity: (promo.minQuantity || 0).toString(),
      endDate: promo.endDate ? new Date(promo.endDate).toISOString().split('T')[0] : '',
    });
    setIsPromoDialogOpen(true);
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
      imageFile: null
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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your store, products, and customers.</p>
          </div>
          <Popover open={isStoreSettingsOpen} onOpenChange={setIsStoreSettingsOpen}>
            <PopoverTrigger asChild>
              <button className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all hover:opacity-80 ${storeOnline ? 'bg-primary/10 text-primary border-primary/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-semibold">Store is {storeOnline ? 'Online' : 'Offline'}</span>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium leading-none">Store Access Settings</h4>
                <p className="text-sm text-muted-foreground">Toggle whether customers can place orders right now.</p>

                <div className="flex items-center justify-between border-t border-white/10 pt-4">
                  <Label htmlFor="store-status">Store Status</Label>
                  <Select value={storeOnline ? 'online' : 'offline'} onValueChange={(val) => setStoreOnline(val === 'online')}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="online" className="text-green-500">Online</SelectItem>
                      <SelectItem value="offline" className="text-red-500">Offline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {!storeOnline && (
                  <div className="space-y-3">
                    <Label>Offline Until (Optional)</Label>
                    <Input
                      type="date"
                      value={offlineDate}
                      onChange={(e) => setOfflineDate(e.target.value)}
                    />

                    {offlineDate && (
                      <div className="flex gap-2 items-center text-sm">
                        <Select value={offlineHour} onValueChange={setOfflineHour}>
                          <SelectTrigger className="w-[75px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map(h => (
                              <SelectItem key={h} value={h}>{h}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <span className="font-bold">:</span>
                        <Select value={offlineMinute} onValueChange={setOfflineMinute}>
                          <SelectTrigger className="w-[75px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {['00', '15', '30', '45'].map(m => (
                              <SelectItem key={m} value={m}>{m}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Select value={offlineAmPm} onValueChange={setOfflineAmPm}>
                          <SelectTrigger className="w-[75px]"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AM">AM</SelectItem>
                            <SelectItem value="PM">PM</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">Leave date blank to stay offline indefinitely.</p>
                  </div>
                )}

                <Button className="w-full mt-2" onClick={handleUpdateStoreStatus}>Save Settings</Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card/30 backdrop-blur-xl border border-white/5 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-500/20 rounded-xl text-green-500"><DollarSign className="h-6 w-6" /></div>
              <span className="text-2xl font-bold price-tag">₹{stats.totalSales.toFixed(2)}</span>
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
            <TabsTrigger value="promotions" className="flex items-center gap-2"><Tag className="h-4 w-4" /> Promotions</TabsTrigger>
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
                <DialogTrigger asChild><Button onClick={() => { setEditingProduct(null); setForm({ name: '', description: '', price: '', category: 'fresh_produce', stock: '', unit: 'stock', image_url: '', imageFile: null }); }} className="w-full md:w-auto"><Plus className="mr-2 h-4 w-4" />Add Product</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingProduct ? 'Edit Product' : 'Add Product'}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Name</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><Label>Description</Label><Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                    <div className="grid grid-cols-2 gap-4">
                      <div><Label>Price (₹)</Label><Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
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
                    <div>
                      <Label>Image Upload</Label>
                      <Input type="file" accept="image/*" onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })} className="mb-3" />
                      <Label>Or Image URL</Label>
                      <Input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} placeholder="https://..." />
                    </div>
                    <Button className="w-full" onClick={handleSaveProduct}>{editingProduct ? 'Update' : 'Add'} Product</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl w-full flex">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[700px]">
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
                            {p.image_url && <img src={p.image_url} alt={p.name} className="h-10 w-10 rounded-lg object-cover border border-white/10" onError={(e) => e.target.style.display = 'none'} />}
                            <div>
                              <p className="font-medium">{p.name}</p>
                              {!p.is_active && <Badge variant="secondary" className="text-[10px] h-4">Inactive</Badge>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-sm">{CATEGORY_LABELS[p.category]}</td>
                        <td className="p-4 font-semibold price-tag">₹{p.price.toFixed(2)}</td>
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
              </div>
              {filteredProducts.length === 0 && (
                <div className="p-12 text-center text-muted-foreground italic w-full">No products found matching your criteria.</div>
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
                    <span className="font-semibold price-tag">₹{order.total_amount.toFixed(2)}</span>
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
                            <p className="text-xs text-muted-foreground">₹{item.price.toFixed(2)} x {item.quantity}</p>
                          </div>
                        </div>
                        <p className="font-semibold text-sm">₹{(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="flex justify-between font-bold text-lg mb-4">
                      <span>Total Amount</span>
                      <span className="price-tag">₹{selectedOrder?.total_amount.toFixed(2)}</span>
                    </div>
                    {selectedOrder?.payment_status === 'paid' && (
                      <Button className="w-full mt-2 gap-2" variant="outline" onClick={() => handleDownloadBill(selectedOrder.id)}>
                        <Download className="h-4 w-4" /> Download Bill (PDF)
                      </Button>
                    )}
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
            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl w-full flex">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Email</th>
                      <th className="text-left p-4">Joined</th>
                      <th className="text-left p-4">Role</th>
                      <th className="text-left p-4">Status</th>
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
                        <td className="p-4">
                          <Badge variant={u.isVerified ? 'default' : 'outline'} className={u.isVerified ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0' : 'text-muted-foreground'}>
                            {u.isVerified ? 'Registered' : 'Pending Verification'}
                          </Badge>
                        </td>
                        <td className="p-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleRole(u.id, u.role)}
                            className="text-[10px] uppercase font-bold tracking-wider"
                            disabled={u.email === 'rajarajeshwari@gmail.com' || (!u.isVerified && u.role !== 'admin')}
                            title={!u.isVerified && u.role !== 'admin' ? "User must be verified to become an admin" : ""}
                          >
                            {u.role === 'admin' ? 'Revoke Admin' : 'Make Admin'}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="promotions">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 className="text-xl font-semibold">Active Promotions ({promotions.length})</h2>
              <Dialog open={isPromoDialogOpen} onOpenChange={setIsPromoDialogOpen}>
                <DialogTrigger asChild><Button onClick={() => { setEditingPromo(null); setPromoForm({ name: '', target: 'All', targetValue: 'fresh_produce', discountPercent: '', minQuantity: '0', endDate: '' }); }} className="w-full md:w-auto"><Plus className="mr-2 h-4 w-4" />Add Promotion</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>{editingPromo ? 'Edit Promotion' : 'Add Promotion'}</DialogTitle></DialogHeader>
                  <div className="space-y-4">
                    <div><Label>Promotion Name</Label><Input value={promoForm.name} onChange={(e) => setPromoForm({ ...promoForm, name: e.target.value })} placeholder="e.g. Summer Sale" /></div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label>Target</Label>
                        <Select value={promoForm.target} onValueChange={(v) => setPromoForm({ ...promoForm, target: v })}>
                          <SelectTrigger><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="All">All Products</SelectItem>
                            <SelectItem value="Category">Specific Category</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {promoForm.target === 'Category' && (
                        <div>
                          <Label>Category</Label>
                          <Select value={promoForm.targetValue} onValueChange={(v) => setPromoForm({ ...promoForm, targetValue: v })}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>{PRODUCT_CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
                          </Select>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div><Label>Discount (%)</Label><Input type="number" min="1" max="100" value={promoForm.discountPercent} onChange={(e) => setPromoForm({ ...promoForm, discountPercent: e.target.value })} /></div>
                      <div><Label>Min. Quantity</Label><Input type="number" min="0" value={promoForm.minQuantity} onChange={(e) => setPromoForm({ ...promoForm, minQuantity: e.target.value })} placeholder="0 for any" /></div>
                      <div><Label>End Date</Label><Input type="date" value={promoForm.endDate} onChange={(e) => setPromoForm({ ...promoForm, endDate: e.target.value })} /></div>
                    </div>

                    <Button className="w-full" onClick={handleSavePromotion}>{editingPromo ? 'Update' : 'Add'} Promotion</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="bg-card/30 backdrop-blur-xl border border-white/5 rounded-2xl overflow-hidden shadow-xl w-full flex">
              <div className="w-full overflow-x-auto">
                <table className="w-full min-w-[650px]">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="text-left p-4">Name</th>
                      <th className="text-left p-4">Discount</th>
                      <th className="text-left p-4">Target</th>
                      <th className="text-left p-4">Status & End Date</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {promotions.map(promo => (
                      <tr key={promo.id} className="hover:bg-white/5 transition-colors">
                        <td className="p-4 font-medium">{promo.name}</td>
                        <td className="p-4">
                          <span className="font-semibold text-green-500">{promo.discountPercent}% OFF</span>
                          {promo.minQuantity > 1 && <span className="text-xs text-muted-foreground block mt-1">Min. {promo.minQuantity} items</span>}
                        </td>
                        <td className="p-4 text-sm">
                          {promo.target === 'All' ? 'All Products' : `Category: ${CATEGORY_LABELS[promo.targetValue] || promo.targetValue}`}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-1">
                            <Badge variant={promo.isActive ? 'default' : 'secondary'} className="w-fit mb-1">{promo.isActive ? 'Active' : 'Inactive'}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {promo.endDate ? `Ends ${format(new Date(promo.endDate), 'MMM d, yyyy')}` : 'No end date'}
                            </span>
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="icon" onClick={() => openPromoEditDialog(promo)} className="hover:bg-primary/20 hover:text-primary"><Pencil className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/20" onClick={() => handleDeletePromotion(promo.id)}><Trash2 className="h-4 w-4" /></Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {promotions.length === 0 && (
                <div className="p-12 text-center text-muted-foreground italic w-full">No active promotions.</div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout >
  );
}
