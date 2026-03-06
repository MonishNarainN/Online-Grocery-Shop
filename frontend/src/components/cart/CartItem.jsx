import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

export function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const product = item.product;

  if (!product) return null;

  const meetsBulkRequirement = product.discountMinQuantity ? item.quantity >= product.discountMinQuantity : true;
  const displayPrice = meetsBulkRequirement && product.discountedPrice ? product.discountedPrice : product.price;
  const isBulkPromoAvailable = product.discountMinQuantity > 1;

  const subtotal = displayPrice * item.quantity;

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
      {/* Image */}
      <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center text-2xl">🛒</div>';
            }}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-2xl">
            🛒
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{product.name}</h3>
        <p className="text-sm text-muted-foreground mb-1">₹{displayPrice.toFixed(2)} / {product.unit || 'unit'}</p>

        {/* Conditional Bulk Feedback */}
        {isBulkPromoAvailable && (
          meetsBulkRequirement ? (
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded border border-green-500/20 font-medium">
              Bulk Discount Applied!
            </span>
          ) : (
            <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded border bg-muted/50">
              Add {product.discountMinQuantity - item.quantity} more for {product.discountPercent}% OFF
            </span>
          )
        )}
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
          disabled={item.quantity >= product.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Subtotal */}
      <div className="text-right w-24">
        <p className="font-semibold price-tag">₹{subtotal.toFixed(2)}</p>
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => removeFromCart(item.product_id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
