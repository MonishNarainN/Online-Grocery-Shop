import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { CATEGORY_LABELS } from '@/lib/types';

export function ProductCard({ product }) {
  const { user } = useAuth();
  const { items, addToCart, updateQuantity, removeFromCart } = useCart();

  const cartItem = items.find(item => item.product_id === product.id);
  const quantityInCart = cartItem?.quantity || 0;

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

  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  return (
    <Card className="product-card group overflow-hidden">
      {/* Image */}
      <div className="aspect-square overflow-hidden bg-secondary">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-4xl">
            🛒
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Category Badge */}
        <span className="inline-block text-xs font-medium text-muted-foreground mb-2">
          {categoryLabel}
        </span>

        {/* Name */}
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
          {product.name}
        </h3>

        {/* Description */}
        {product.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {product.description}
          </p>
        )}

        {/* Price & Stock */}
        <div className="flex items-center justify-between mb-3">
          <span className="price-tag text-lg">${product.price.toFixed(2)}</span>
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
                className="w-full"
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
