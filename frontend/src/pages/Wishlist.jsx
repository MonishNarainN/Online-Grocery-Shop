import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Layout } from '@/components/layout/Layout';
import { ProductGrid } from '@/components/products/ProductGrid';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect } from 'react';
import { API_URL } from '@/config';

export default function Wishlist() {
    const { user, wishlist } = useAuth();
    const [wishlistProducts, setWishlistProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            setIsLoading(false);
            return;
        }

        const loadWishlistDetails = async () => {
            // The wishlist in AuthContext might just be populated objects, 
            // but if the backend populate('wishlist') isn't configured for all properties,
            // or if it's just IDs, we can map it here. Let's assume the backend populates correctly
            // based on our products logic. Wait, our `GET /wishlist` returns populated products, 
            // but without the manual discounts recalculation that `GET /products` has.
            // To ensure discounts are shown, it's better to fetch all products and filter locally
            // or update backend `GET /wishlist` to also apply discounts.
            // Let's just fetch all products and filter locally to guarantee consistency.

            try {
                const response = await fetch(`${API_URL}/products`);
                const allProducts = await response.json();

                // Wishlist contains either IDs or populated objects, we extract IDs
                const wishlistIds = wishlist.map(item => item.id || item._id || item);
                const filtered = (allProducts || []).filter(p => wishlistIds.includes(p.id));
                setWishlistProducts(filtered);
            } catch (error) {
                console.error("Error loading wishlist products", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadWishlistDetails();
    }, [wishlist, user]);

    if (!user) {
        return (
            <Layout>
                <div className="container py-16 text-center">
                    <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                    <h1 className="font-display text-2xl font-bold mb-2">Sign in to view wishlist</h1>
                    <Button asChild><Link to="/auth">Sign In</Link></Button>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="container py-8">
                <h1 className="font-display text-3xl font-bold mb-8 flex items-center gap-3">
                    <Heart className="h-8 w-8 text-red-500 fill-red-500" />
                    My Wishlist
                </h1>
                {isLoading ? (
                    <ProductGrid products={[]} isLoading={true} />
                ) : wishlistProducts.length === 0 ? (
                    <div className="text-center py-12 bg-card/30 rounded-3xl border border-white/5 backdrop-blur-md">
                        <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4 opacity-50" />
                        <p className="text-muted-foreground mb-6 text-lg">Your wishlist is empty.</p>
                        <Button asChild size="lg"><Link to="/products"><ShoppingBag className="mr-2" /> Start Shopping</Link></Button>
                    </div>
                ) : (
                    <ProductGrid products={wishlistProducts} isLoading={false} />
                )}
            </div>
        </Layout>
    );
}
