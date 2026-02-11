import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';



const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  processing: 'bg-blue-100 text-blue-800 border-blue-200',
  shipped: 'bg-purple-100 text-purple-800 border-purple-200',
  delivered: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

const paymentColors = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  paid: 'bg-green-100 text-green-800 border-green-200',
  failed: 'bg-red-100 text-red-800 border-red-200',
};

export function OrderCard({ order }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(order.created_at), 'PPP')}
            </p>
          </div>
          <div className="flex gap-2">
            <Badge className={statusColors[order.order_status]}>
              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
            </Badge>
            <Badge className={paymentColors[order.payment_status]}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Items Preview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {order.items.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className="h-12 w-12 rounded-lg bg-secondary overflow-hidden"
            >
              {item.image_url ? (
                <img
                  src={item.image_url}
                  alt={item.name}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = '<div class="h-full w-full flex items-center justify-center text-lg">🛒</div>';
                  }}
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-lg">
                  🛒
                </div>
              )}
            </div>
          ))}
          {order.items.length > 3 && (
            <div className="h-12 w-12 rounded-lg bg-secondary flex items-center justify-center text-sm font-medium">
              +{order.items.length - 3}
            </div>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
          <p className="font-semibold price-tag text-lg">
            ₹{order.total_amount.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
