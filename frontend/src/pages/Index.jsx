import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Truck, Shield, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useAuth } from '@/contexts/AuthContext';
export default function Index() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();
        setFeaturedProducts((data || []).slice(0, 8));
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Layout>
      {/* Location Banner */}
      <div className="bg-primary/10 py-2 border-b border-primary/10">
        <div className="container flex items-center justify-center gap-2 text-sm font-medium text-primary">
          <Truck className="w-4 h-4" />
          <span>Currently Serviceable only in <span className="font-bold underline">Tiruvannamalai</span></span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="py-12 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-xl shadow-2xl animate-fade-in text-center">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Groceries.<br />
            </h1>

            {/* Search Bar */}
            <div className="max-w-xl mx-auto mb-8 relative">
              <form action="/products" className="relative flex items-center">
                <input
                  type="text"
                  name="search"
                  placeholder="Search for 'milk', 'chips'..."
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-border bg-background/50 focus:bg-background transition-all outline-none ring-2 ring-transparent focus:ring-primary/20"
                />
                <button type="submit" className="absolute right-2 p-2 bg-primary rounded-lg text-primary-foreground hover:bg-primary/90 transition-colors">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Quick Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-8">
              {['Vegetables', 'Fruits', 'Dairy', 'Snacks', 'Beverages'].map(cat => (
                <Link key={cat} to={`/products?category=${cat}`} className="px-4 py-2 rounded-full bg-secondary/50 hover:bg-secondary transition-colors text-sm font-medium">
                  {cat}
                </Link>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-primary-hover min-w-[160px]" asChild>
                <Link to="/products">
                  Shop All Products <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-card/60 hover:-translate-y-1">
              <div className="p-3 rounded-xl bg-primary/20">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Fast Delivery</h3>
                <p className="text-sm text-muted-foreground">Same-day delivery on orders before 2 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-card/60 hover:-translate-y-1">
              <div className="p-3 rounded-xl bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Quality Guaranteed</h3>
                <p className="text-sm text-muted-foreground">Fresh products or your money back</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-6 rounded-2xl bg-card/40 border border-white/5 backdrop-blur-md transition-all duration-300 hover:bg-card/60 hover:-translate-y-1">
              <div className="p-3 rounded-xl bg-primary/20">
                <ShieldCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold mb-1 text-foreground">Secure Payments</h3>
                <p className="text-sm text-muted-foreground">Safe and encrypted transactions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <h2 className="font-display text-3xl font-bold">Featured Products</h2>
            <Button variant="ghost" asChild>
              <Link to="/products">View All <ArrowRight className="ml-2 h-4 w-4" /></Link>
            </Button>
          </div>
          <ProductGrid products={featuredProducts} isLoading={isLoading} />
        </div>
      </section>
    </Layout>
  );
}
