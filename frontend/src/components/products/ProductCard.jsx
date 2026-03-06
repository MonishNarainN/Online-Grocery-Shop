import { ShoppingCart, Plus, Minus, Heart, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORY_LABELS } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { ProductDetailsDialog } from './ProductDetailsDialog';

export function ProductCard({ product }) {
  const { user, wishlist, toggleWishlist } = useAuth();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  const cartItem = items.find(item => item.product_id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

  const isWishlisted = user && wishlist && wishlist.some(item => item.id === product.id || item === product.id);

  const handleAddToCart = () => {
    addToCart(product, 1);
  };

  const handleIncrement = () => {
    if (cartItem) {
      updateQuantity(cartItem.id, quantityInCart + 1);
    }
  };

  const handleDecrement = () => {
    if (cartItem && quantityInCart > 1) {
      updateQuantity(cartItem.id, quantityInCart - 1);
    } else if (cartItem) {
      removeFromCart(cartItem.id);
    }
  };

  const handleWishlistClick = (e) => {
    e.preventDefault();
    if (user) {
      toggleWishlist(product.id);
    }
  };

  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  return (
    <Card className="product-card group overflow-hidden fade-in border-none bg-card/50 backdrop-blur-sm relative">
      {/* Wishlist Button */}
      {user && (
        <button
          onClick={handleWishlistClick}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-background/80 backdrop-blur-sm border shadow-sm transition-all hover:scale-110 group/wishlist"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isWishlisted
              ? 'fill-red-500 text-red-500'
              : 'text-muted-foreground group-hover/wishlist:text-red-500'
              }`}
          />
        </button>
      )}

      {/* Image */}
      <ProductDetailsDialog product={product}>
        <div className="aspect-square overflow-hidden bg-secondary cursor-pointer border-b">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/400x400?text=No+Image";
                e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center text-4xl bg-secondary">🛒</div>';
              }}
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-4xl">
              🛒
            </div>
          )}
        </div>
      </ProductDetailsDialog>

      <CardContent className="p-4">
        {/* Category & Badge */}
        <div className="flex justify-between items-start gap-2 mb-2">
          <span className="inline-block text-xs font-medium text-muted-foreground line-clamp-1">
            {categoryLabel}
          </span>
          {product.discountPercent && (
            <Badge variant="destructive" className="whitespace-nowrap flex-shrink-0 text-[10px] h-5 bg-red-500 hover:bg-red-600 border-none font-bold px-1.5 shadow-sm shadow-red-500/20">
              {product.discountPercent}% OFF {product.discountMinQuantity > 1 ? `(Buy ${product.discountMinQuantity}+)` : ''}
            </Badge>
          )}
        </div>

        {/* Name and Rating */}
        <div className="mb-2">
          <ProductDetailsDialog product={product}>
            <h3 className="font-semibold text-foreground line-clamp-1 mb-1 cursor-pointer hover:underline">
              {product.name}
            </h3>
          </ProductDetailsDialog>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Star className={`w-3.5 h-3.5 ${product.averageRating > 0 ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'}`} />
            <span className="font-medium text-foreground">{product.averageRating ? product.averageRating.toFixed(1) : 'New'}</span>
            {product.numReviews > 0 && <span>({product.numReviews})</span>}
          </div>
        </div>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Price & Stock */}
        <div className="flex items-end justify-between mb-3">
          <div className="flex flex-col">
            {product.discountedPrice && (!product.discountMinQuantity || product.discountMinQuantity <= 1) ? (
              <>
                <span className="text-xs text-muted-foreground line-through font-medium">₹{product.price.toFixed(2)}</span>
                <span className="price-tag text-lg font-bold">₹{product.discountedPrice.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/ {product.unit || 'unit'}</span></span>
              </>
            ) : (
              <span className="price-tag text-lg font-bold">₹{product.price.toFixed(2)} <span className="text-xs text-muted-foreground font-normal">/ {product.unit || 'unit'}</span></span>
            )}
          </div>
          {product.stock > 0 ? (
            <span className="text-xs text-success font-medium">
              In Stock ({product.stock})
            </span>
          ) : (
            <span className="text-xs text-destructive font-medium">
              Out of Stock
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        {user ? (
          product.stock > 0 ? (
            quantityInCart > 0 ? (
              <div className="flex items-center justify-between bg-secondary rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleDecrement}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-semibold">{quantityInCart}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleIncrement}
                  disabled={quantityInCart >= product.stock}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button
                className="w-full add-btn"
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                Add to Cart
              </Button>
            )
          ) : (
            <Button className="w-full" disabled>
              Out of Stock
            </Button>
          )
        ) : (
          <Button className="w-full" variant="secondary" asChild>
            <a href="/auth">Sign in to Shop</a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
