import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, RefreshCw, ArrowLeft, CheckCircle, Clock, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getAuthToken } from '@/lib/mockAuth';
import { API_URL } from '@/lib/config';
import type { CustomerOrder, OrderTimelineEntry } from '@/types/order';
import { generateInvoicePdf } from '@/customer/utils/invoice';

const TimelineItem = ({
  status,
  timestamp,
  completed,
}: {
  status: string;
  timestamp?: string;
  completed: boolean;
}) => (
  <div className="flex items-start space-x-3">
    <div
      className={`mt-1 w-4 h-4 rounded-full border-2 ${
        completed ? 'bg-primary border-primary' : 'border-muted-foreground'
      }`}
    >
      {completed && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
    </div>
    <div className="flex-1">
      <p
        className={`text-sm font-medium ${
          completed ? 'text-foreground' : 'text-muted-foreground'
        }`}
      >
        {status}
      </p>
      {timestamp && (
        <p className="text-xs text-muted-foreground">
          {format(new Date(timestamp), 'MMM dd, yyyy • hh:mm a')}
        </p>
      )}
    </div>
  </div>
);

const simplifyTimelineStatus = (status?: string) => {
  if (!status) return '';
  let result = status;

  result = result.replace(/Scheduled on Train[^\n\r]*/i, 'Scheduled');
  result = result.replace(/Out for delivery\s*\([^)]*\)/i, 'Out for delivery');
  result = result.replace(/\s+/g, ' ');

  return result.trim();
};

const CustomerOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<CustomerOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);

  const auth = getAuthToken();

  const fetchOrderDetails = useCallback(
    async (orderId: string, withSpinner: boolean = true) => {
      if (!auth?.token) return;

      if (withSpinner) setIsLoading(true);

      try {
        const response = await fetch(`${API_URL}/orders/${orderId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const payload = await response.json();

        if (!response.ok || !payload.success) {
          throw new Error(payload.message || 'Failed to load order');
        }

        setOrder(payload.order ?? null);
      } catch (error) {
        console.error('Failed to load order:', error);
        toast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to load order details.',
          variant: 'destructive',
        });
      } finally {
        if (withSpinner) setIsLoading(false);
      }
    },
    [auth?.token]
  );

  useEffect(() => {
    if (id) {
      fetchOrderDetails(id);
    }
  }, [id, fetchOrderDetails]);

  const handleRefreshStatus = async () => {
    if (!id) return;
    setIsRefreshing(true);
    await fetchOrderDetails(id, false);
    setIsRefreshing(false);
    toast({
      title: 'Status refreshed',
      description: 'Latest status pulled from the server.',
    });
  };

  const handleDownloadInvoice = () => {
    if (!order) return;

    try {
      setIsGeneratingInvoice(true);
      generateInvoicePdf(order);
      toast({
        title: 'Invoice ready',
        description: 'The invoice has been downloaded as a PDF.',
      });
    } catch (error) {
      console.error('Invoice generation failed:', error);
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unable to generate invoice.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingInvoice(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/customer/orders">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Orders
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="h-6 bg-muted rounded animate-pulse" />
              <div className="h-4 bg-muted rounded animate-pulse w-2/3" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
                <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/customer/orders">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <Card>
          <CardHeader>
            <CardTitle>Order not found</CardTitle>
            <CardDescription>
              We couldn&apos;t find the order you were looking for.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/customer/orders">View all orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const total =
    typeof order.total === 'number'
      ? order.total
      : Number(order.total_value ?? 0);
  const deliveryDateLabel =
    order.deliveryDate && !Number.isNaN(new Date(order.deliveryDate).getTime())
      ? format(new Date(order.deliveryDate), 'MMMM dd, yyyy')
      : 'Not scheduled';
  const orderDateLabel =
    order.orderDate && !Number.isNaN(new Date(order.orderDate).getTime())
      ? format(new Date(order.orderDate), 'PPP')
      : 'Unknown date';

  const timeline: OrderTimelineEntry[] = order.timeline ?? [];
  const customer = order.customer;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/customer/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Order {order.order_id || order.id}</h1>
            <p className="text-sm text-muted-foreground">
              Placed on {orderDateLabel}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">{order.status}</Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadInvoice}
            disabled={isGeneratingInvoice}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isGeneratingInvoice ? 'Preparing...' : 'Download Invoice'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
              <CardDescription>Overview of your order items and total.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    Rs {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Deliver to: {customer?.address?.city || '—'}
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.quantity} × Rs {item.price.toLocaleString()}
                      </p>
                    </div>
                    <p className="font-medium">
                      Rs {(item.quantity * item.price).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="text-sm">{customer?.name || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="text-sm">{customer?.email || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="text-sm">{customer?.phone || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd className="text-sm">{customer?.address?.street || '—'}</dd>
                  <dd className="text-sm">{customer?.address?.city || '—'}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Delivery Date</dt>
                  <dd className="text-sm">{deliveryDateLabel}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Payment Method</dt>
                  <dd className="text-sm">{order.paymentMethod || '—'}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Status Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {timeline.length > 0 ? (
                  timeline.map((item, index) => (
                    <TimelineItem
                      key={index}
                      status={simplifyTimelineStatus(item.status)}
                      timestamp={item.timestamp}
                      completed={item.completed}
                    />
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Timeline data unavailable.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetails;
