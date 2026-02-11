import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { CategoryFilter } from '@/components/products/CategoryFilter';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || 'All';

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category && category !== 'All') params.append('category', category);

        const response = await fetch(`http://localhost:5000/api/products?${params.toString()}`);
        const data = await response.json();
        setProducts(data || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, [search, category]);

  const updateSearch = (value) => {
    if (value) searchParams.set('search', value);
    else searchParams.delete('search');
    setSearchParams(searchParams);
  };

  const updateCategory = (val) => {
    if (val && val !== 'All') searchParams.set('category', val);
    else searchParams.delete('category');
    setSearchParams(searchParams);
  };

  return (
    <Layout>
      <div className="container py-8 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="mb-12 p-8 rounded-2xl bg-card/30 border border-white/5 backdrop-blur-xl shadow-xl">
            <h1 className="font-display text-3xl font-bold mb-8">All Products</h1>

            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => updateSearch(e.target.value)}
                  className="pl-10 bg-background/50 border-white/10"
                />
              </div>
            </div>

            <div className="">
              <CategoryFilter selectedCategory={category} onCategoryChange={updateCategory} />
            </div>
          </div>

          <ProductGrid products={products} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
}
