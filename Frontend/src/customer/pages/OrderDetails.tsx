import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Package, RefreshCw, ArrowLeft, CheckCircle, Clock, Truck, Train } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { fetchOrder, advanceOrderStatus, Order } from '@/lib/mockApi';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { getAuthToken } from '@/lib/mockAuth';
import { API_URL } from '@/lib/config';

const TimelineItem = ({ status, timestamp, completed }: {
  status: string;
  timestamp?: string;
  completed: boolean;
}) => (
  <div className="flex items-start space-x-3">
    <div className={`mt-1 w-4 h-4 rounded-full border-2 ${completed ? 'bg-primary border-primary' : 'border-muted-foreground'
      }`}>
      {completed && <CheckCircle className="w-3 h-3 text-primary-foreground" />}
    </div>
    <div className="flex-1">
      <p className={`text-sm font-medium ${completed ? 'text-foreground' : 'text-muted-foreground'}`}>
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

const CustomerOrderDetails = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const auth = getAuthToken();

  useEffect(() => {
    const loadOrder = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        const orderData = await fetch(`${API_URL}/orders/${id}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
        }).then(res => res.json());

        setOrder(orderData);
      } catch (error) {
        console.error('Failed to load order:', error);
        toast({
          title: 'Error',
          description: 'Failed to load order details.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadOrder();
  }, [id]);

  const handleRefreshStatus = async () => {
    if (!order) return;

    setIsRefreshing(true);
    try {
      const updatedOrder = await advanceOrderStatus(order.id);
      if (updatedOrder) {
        setOrder(updatedOrder);
        toast({
          title: 'Status updated',
          description: 'Order status has been refreshed.',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to refresh order status.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
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
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/customer/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Order not found</h3>
            <p className="text-muted-foreground">
              The order you're looking for doesn't exist or has been removed.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate progress
  const completedSteps = order.timeline.filter(step => step.completed).length;
  const totalSteps = order.timeline.length;
  const progressPercentage = (completedSteps / totalSteps) * 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/customer/orders">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Orders
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Order {order.id}</h1>
            <p className="text-muted-foreground">
              Placed on {format(new Date(order.date), 'MMMM dd, yyyy')}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="text-sm">
            {order.status}
          </Badge>
          <Button
            onClick={handleRefreshStatus}
            disabled={isRefreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Order Progress</span>
              <span>{Math.round(progressPercentage)}% Complete</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Order Summary */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Package className="w-5 h-5" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">Rs {order.total.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Deliver to: {order.customer.address.city}
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
                        {item.quantity}x @ Rs {item.price.toLocaleString()}
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

          {/* Logistics Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Train className="w-5 h-5" />
                <span>Logistics Details</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rail Transport */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Train className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Train Journey: Kandy → {order.customer.address.city}</h4>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Trip ID:</strong> {order.logistics.rail.trainId}</p>
                  <p><strong>Departure:</strong> {order.logistics.rail.departure}</p>
                  <p><strong>Arrival:</strong> {order.logistics.rail.arrival}</p>
                  <p><strong>Wagon:</strong> {order.logistics.rail.wagonCode}</p>
                  <p><strong>Space Used:</strong> {order.logistics.rail.spaceUsed} units</p>
                  <p><strong>Remaining Capacity:</strong> {order.logistics.rail.remainingCapacity} units</p>
                  <div className="mt-2">
                    <Progress
                      value={(order.logistics.rail.allocatedCapacity / (order.logistics.rail.allocatedCapacity + order.logistics.rail.remainingCapacity)) * 100}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Store Handover */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Package className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Distribution Center</h4>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Location:</strong> {order.logistics.store.name}</p>
                  <p><strong>Address:</strong> {order.logistics.store.address}</p>
                  {order.logistics.store.handoverTime && (
                    <p><strong>Handover Time:</strong> {order.logistics.store.handoverTime}</p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Truck Delivery */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Truck className="w-4 h-4 text-primary" />
                  <h4 className="font-semibold">Last-Mile Delivery</h4>
                </div>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-sm">
                  <p><strong>Route:</strong> {order.logistics.truck.routeName}</p>
                  <p><strong>Areas Covered:</strong> {order.logistics.truck.areasCovered.join(', ')}</p>
                  <p><strong>ETA Window:</strong> {order.logistics.truck.etaWindow}</p>
                  <p><strong>Truck:</strong> {order.logistics.truck.truckPlate}</p>
                  <p><strong>Driver & Assistant:</strong> {order.logistics.truck.driver}, {order.logistics.truck.assistant}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Information & Timeline */}
        <div className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                  <dd className="text-sm">{order.customer.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                  <dd className="text-sm">{order.customer.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                  <dd className="text-sm">{order.customer.phone}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                  <dd className="text-sm">{order.customer.address.street}</dd>
                  <dd className="text-sm">{order.customer.address.city}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Delivery Date</dt>
                  <dd className="text-sm">{format(new Date(order.deliveryDate), 'MMMM dd, yyyy')}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground">Payment Method</dt>
                  <dd className="text-sm">{order.paymentMethod}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          {/* Status Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Status Timeline</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {order.timeline.map((item, index) => (
                  <TimelineItem
                    key={index}
                    status={item.status}
                    timestamp={item.timestamp}
                    completed={item.completed}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CustomerOrderDetails;