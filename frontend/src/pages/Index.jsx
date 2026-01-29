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
      {/* Hero Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="container relative z-10">
          <div className="max-w-4xl mx-auto p-8 md:p-12 rounded-3xl bg-card/30 border border-white/5 backdrop-blur-xl shadow-2xl animate-fade-in">
            <h1 className="font-display text-4xl md:text-6xl font-bold mb-6">
              Fresh Groceries,<br /><span className="text-primary">Delivered Fresh</span>
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto text-foreground/90 font-medium">
              Shop from your local grocery store online. Quality products, fair prices,
              and convenient delivery to your doorstep.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="btn-primary-hover min-w-[160px]" asChild>
                <Link to="/products">
                  Shop Now <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="min-w-[160px]" asChild>
                <Link to="/auth">Create Account</Link>
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
