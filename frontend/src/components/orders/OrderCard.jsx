import { Link } from 'react-router-dom';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { format } from 'date-fns';
import { API_URL } from '@/config';



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
  const handleDownloadBill = async (e) => {
    e.stopPropagation();
    try {
      const response = await fetch(`${API_URL}/orders/${order.id}/bill`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!response.ok) throw new Error('Failed to download bill');

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `bill_${order.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading bill:', error);
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground break-all">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {format(new Date(order.created_at), 'PPP')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge className={statusColors[order.order_status]}>
              {order.order_status.charAt(0).toUpperCase() + order.order_status.slice(1)}
            </Badge>
            <Badge className={paymentColors[order.payment_status]}>
              {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
            </Badge>
          </div>
        </div>

        {order.payment_status === 'paid' && (
          <div className="mt-4 flex justify-end">
            <Button size="sm" variant="outline" className="text-xs flex items-center gap-1" onClick={handleDownloadBill}>
              <Download className="h-3 w-3" /> Download Bill
            </Button>
          </div>
        )}
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
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
          </p>
          <p className="font-semibold price-tag text-lg">
            ₹{order.total_amount.toFixed(2)}
          </p>
        </div>

        {/* Delivery Timeline */}
        {order.order_status === 'cancelled' ? (
          <div className="mt-4 pt-4 border-t">
            <div className="text-destructive text-sm font-medium text-center">Order Canceled</div>
          </div>
        ) : (
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center relative">
              <div className="absolute left-0 top-3 w-full h-1 bg-secondary -z-10 rounded-full"></div>
              <div
                className="absolute left-0 top-3 h-1 bg-primary -z-10 rounded-full transition-all duration-500"
                style={{
                  width: `${(Math.max(0, ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.order_status)) / 3) * 100}%`
                }}
              ></div>

              {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                const currentIndex = ['pending', 'processing', 'shipped', 'delivered'].indexOf(order.order_status);
                const isCompleted = index <= currentIndex;
                const isActive = index === currentIndex;
                return (
                  <div key={status} className="flex flex-col items-center justify-start gap-1 sm:gap-2 bg-card px-1 sm:px-2 w-1/4">
                    <div className={`w-3 h-3 sm:w-4 sm:h-4 mt-1 rounded-full border-2 shrink-0 ${isCompleted ? 'bg-primary border-primary' : 'bg-background border-muted-foreground'} ${isActive ? 'ring-4 ring-primary/20' : ''}`}></div>
                    <span className={`text-[8px] sm:text-xs font-medium uppercase tracking-wider text-center break-words ${isCompleted ? 'text-primary' : 'text-muted-foreground'}`}>
                      {status}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
