import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Download, Calendar, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { getAuthToken } from '@/lib/mockAuth';
import { API_URL } from '@/lib/config';
import type { CustomerOrder } from '@/types/order';
import { generateInvoicePdf } from '@/customer/utils/invoice';
import { toast } from '@/hooks/use-toast';

const statusVariants: Record<string, 'secondary' | 'outline' | 'default' | 'destructive'> = {
  Pending: 'secondary',
  Processing: 'secondary',
  Scheduled: 'outline',
  'In Transit': 'default',
  Delivered: 'default',
  Cancelled: 'destructive',
};

const StatusBadge = ({ status }: { status: string }) => {
  const normalized = status || 'Processing';
  return (
    <Badge variant={statusVariants[normalized] ?? 'secondary'} className="whitespace-nowrap">
      {normalized}
    </Badge>
  );
};

const parseOrderDate = (order: CustomerOrder): number => {
  const iso =
    order.orderDate ||
    order.date ||
    order.required_date ||
    order.deliveryDate ||
    null;
  if (!iso) return 0;
  const timestamp = new Date(iso).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

type OrderCardProps = {
  order: CustomerOrder;
  onDownloadInvoice: (orderId: string) => void;
  isDownloading: boolean;
};

const OrderCard = ({ order, onDownloadInvoice, isDownloading }: OrderCardProps) => {
  const itemCount =
    order.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  const iso =
    order.orderDate || order.date || order.required_date || order.deliveryDate;
  const orderDate = iso ? new Date(iso) : null;
  const dateLabel =
    orderDate && !Number.isNaN(orderDate.getTime())
      ? orderDate.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        })
      : 'Unknown date';

  const total =
    typeof order.total === 'number'
      ? order.total
      : Number(order.total_value ?? 0);
  const orderId = order.order_id || order.id || 'Order';
  const downloadLabel = isDownloading ? 'Preparing...' : 'Invoice';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-semibold">{orderId}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {dateLabel} - {itemCount} item{itemCount !== 1 ? 's' : ''}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div>
          <p className="text-2xl font-bold">
            Rs{' '}
            {total.toLocaleString(undefined, {
              minimumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            Deliver to: {order.customer?.address?.city || '-'}
          </p>
          {order.paymentMethod && (
            <p className="text-xs text-muted-foreground mt-1">
              Payment: {order.paymentMethod}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline" size="sm" className="flex-1">
            <Link to={`/customer/orders/${orderId}`}>
              <Package className="w-4 h-4 mr-2" />
              View Details
            </Link>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onDownloadInvoice(orderId)}
            disabled={isDownloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloadLabel}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<CustomerOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const auth = getAuthToken();

  useEffect(() => {
    const loadOrders = async () => {
      if (!auth?.token) return;

      try {
        setIsLoading(true);
        const response = await fetch(`${API_URL}/orders`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Failed to load orders');
        }

        const history: CustomerOrder[] = payload.orders ?? [];
        setOrders(history);
        setFilteredOrders(history);
      } catch (error) {
        console.error('Failed to load orders:', error);
        toast({
          title: 'Error loading orders',
          description: error instanceof Error ? error.message : 'Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrders();
  }, [auth?.token]);

  useEffect(() => {
    let next = [...orders];

    if (statusFilter !== 'all') {
      next = next.filter((order) => order.status === statusFilter);
    }

    next.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return parseOrderDate(b) - parseOrderDate(a);
        case 'date-asc':
          return parseOrderDate(a) - parseOrderDate(b);
        case 'amount-desc': {
          const aTotal =
            typeof a.total === 'number'
              ? a.total
              : Number(a.total_value ?? 0);
          const bTotal =
            typeof b.total === 'number'
              ? b.total
              : Number(b.total_value ?? 0);
          return bTotal - aTotal;
        }
        case 'amount-asc': {
          const aTotal =
            typeof a.total === 'number'
              ? a.total
              : Number(a.total_value ?? 0);
          const bTotal =
            typeof b.total === 'number'
              ? b.total
              : Number(b.total_value ?? 0);
          return aTotal - bTotal;
        }
        default:
          return 0;
      }
    });

    setFilteredOrders(next);
  }, [orders, statusFilter, sortBy]);

  const handleDownloadInvoice = async (orderId: string) => {
    if (!auth?.token || !orderId) return;

    try {
      setDownloadingId(orderId);
      const response = await fetch(`${API_URL}/orders/${orderId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.token}`,
        },
      });

      const payload = await response.json();

      if (!response.ok || !payload.success) {
        throw new Error(payload.message || 'Failed to load invoice');
      }

      generateInvoicePdf(payload.order);
      toast({
        title: 'Invoice ready',
        description: 'The invoice has been downloaded as a PDF.',
      });
    } catch (error) {
      console.error('Invoice download failed:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unable to download invoice.',
        variant: 'destructive',
      });
    } finally {
      setDownloadingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Order History</h1>
        </div>

        <div className="grid gap-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Card key={index}>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-40 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-9 flex-1" />
                  <Skeleton className="h-9 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Order History</h1>
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {orders.length} order{orders.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-4">
              Start shopping to see your orders here.
            </p>
            <Button asChild>
              <Link to="/customer/products">Browse Products</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Scheduled">Scheduled</SelectItem>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date-desc">Date (newest first)</SelectItem>
                <SelectItem value="date-asc">Date (oldest first)</SelectItem>
                <SelectItem value="amount-desc">Amount (high to low)</SelectItem>
                <SelectItem value="amount-asc">Amount (low to high)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order.order_id || order.id}
                order={order}
                onDownloadInvoice={handleDownloadInvoice}
                isDownloading={downloadingId === (order.order_id || order.id)}
              />
            ))}
          </div>

          {filteredOrders.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center">
                <p className="text-muted-foreground">
                  No orders match the current filters.
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
};

export default CustomerOrders;
