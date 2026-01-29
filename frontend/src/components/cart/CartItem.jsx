import { Minus, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';

export function CartItem({ item }) {
  const { updateQuantity, removeFromCart } = useCart();
  const product = item.product;

  if (!product) return null;

  const subtotal = product.price * item.quantity;

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border">
      {/* Image */}
      <div className="h-20 w-20 rounded-lg overflow-hidden bg-secondary flex-shrink-0">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover"
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
        <p className="text-sm text-muted-foreground">${product.price.toFixed(2)} each</p>
      </div>

      {/* Quantity Controls */}
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-8 text-center font-semibold">{item.quantity}</span>
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => updateQuantity(item.id, item.quantity + 1)}
          disabled={item.quantity >= product.stock}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Subtotal */}
      <div className="text-right w-24">
        <p className="font-semibold price-tag">${subtotal.toFixed(2)}</p>
      </div>

      {/* Remove */}
      <Button
        variant="ghost"
        size="icon"
        className="text-destructive hover:text-destructive"
        onClick={() => removeFromCart(item.id)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
