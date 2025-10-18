import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Package, TrendingUp, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { SystemStatus } from '@/components/SystemStatus';
import { fetchOrders, Order } from '@/lib/mockApi';
import { getAuthToken } from '@/lib/mockAuth';

const CustomerHome = () => {
  const [recentOrder, setRecentOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
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
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Total Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Orders In Transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">Delivered Orders</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">Rs 0</div>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <div className="flex justify-center">
        <SystemStatus />
      </div>
    </div>
  );
};

export default CustomerHome;