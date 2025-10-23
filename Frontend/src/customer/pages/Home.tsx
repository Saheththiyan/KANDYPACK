import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SystemStatus } from '@/components/SystemStatus';
import { fetchOrders, Order } from '@/lib/mockApi';
import { getAuthToken } from '@/lib/mockAuth';
import { API_URL } from '@/lib/config';

const CustomerHome = () => {
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    ordersInTransit: 0,
    ordersDelivered: 0,
    totalSpent: 0,
  });
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState('');
  const auth = getAuthToken();

  useEffect(() => {
    const loadRecentOrder = async () => {
      try {
        const orders = await fetchOrders();
        if (orders.length > 0) {
          setRecentOrder(orders[0]);
        }
      } catch (error) {
        console.error('Failed to load recent order:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadRecentOrder();
  }, []);

  useEffect(() => {
    const loadSummary = async () => {
      if (!auth?.token) {
        setIsSummaryLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API_URL}/orders/customer/summary`, {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch summary');
        }

        const data = await response.json();
        if (data.success && data.summary) {
          setSummary({
            totalOrders: data.summary.totalOrders ?? 0,
            ordersInTransit: data.summary.ordersInTransit ?? 0,
            ordersDelivered: data.summary.ordersDelivered ?? 0,
            totalSpent: data.summary.totalSpent ?? 0,
          });
          setSummaryError('');
        } else {
          throw new Error(data.message || 'Unexpected response format');
        }
      } catch (error) {
        console.error('Failed to load order summary:', error);
        setSummaryError('Unable to load summary right now.');
      } finally {
        setIsSummaryLoading(false);
      }
    };

    loadSummary();
  }, [auth?.token]);

  const summaryCards: { label: string; key: keyof typeof summary; format?: (value: number) => string }[] = [
    { label: 'Total Orders', key: 'totalOrders' },
    { label: 'Orders In Transit', key: 'ordersInTransit' },
    { label: 'Delivered Orders', key: 'ordersDelivered' },
    { label: 'Total Spent', key: 'totalSpent', format: (value) => `Rs ${value.toLocaleString()}` },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold">Welcome{auth?.name ? `, ${auth.name}` : ''}!</h1>
        <p className="text-xl text-muted-foreground">
          {auth?.email || 'customer@kandypack.lk'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Browse Products</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              Discover our wide range of household and cleaning products.
            </CardDescription>
            <Button asChild className="w-full">
              <Link to="/customer/products">Shop Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Recent Order</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <CardDescription className="mb-4">Loading...</CardDescription>
            ) : recentOrder ? (
              <>
                <CardDescription className="mb-2">
                  Order {recentOrder.id}
                </CardDescription>
                <p className="text-sm font-medium mb-2">
                  Rs {recentOrder.total.toLocaleString()}
                </p>
                <Badge variant="outline" className="mb-4">
                  {recentOrder.status}
                </Badge>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/customer/orders/${recentOrder.id}`}>View Details</Link>
                </Button>
              </>
            ) : (
              <>
                <CardDescription className="mb-4">
                  You haven't placed any orders yet.
                </CardDescription>
                <Button asChild variant="outline" className="w-full">
                  <Link to="/customer/products">Place First Order</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle className="text-lg">Track Orders</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="mb-4">
              View all your orders and track their progress.
            </CardDescription>
            <Button asChild variant="outline" className="w-full">
              <Link to="/customer/orders">View All Orders</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Statistics */}
      <div className="grid md:grid-cols-4 gap-4">
        {summaryCards.map((card) => {
          const rawValue = summary[card.key];
          const displayValue = card.format ? card.format(rawValue) : rawValue.toString();

          return (
            <Card key={card.key}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {isSummaryLoading ? 'Loading...' : summaryError ? '—' : displayValue}
                </div>
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
      {summaryError && (
        <p className="text-sm text-danger">Try refreshing the page to see the latest figures.</p>
      )}

      {/* System Status */}
      <div className="flex justify-center">
        <SystemStatus />
      </div>
    </div>
  );
};

export default CustomerHome;
