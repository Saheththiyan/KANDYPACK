// Frontend/src/admin/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  TrendingUp, Package, MapPin, Clock,
  BarChart3, Users, Truck, DollarSign, Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/config';
import { getAuthToken } from '@/lib/mockAuth';

interface OrderItemEntry {
  product_id: string;
  order_id: string;
  quantity: number;
  sub_total: number;
}

interface OrderItem {
  id: string;
  order_id: string;
  date?: string;
  customer_id?: string;
  items?: OrderItemEntry[];
  total_value: number;
  status: string;
  deliveryCity?: string;
  route?: string;
  logistics?: {
    store?: {
      name?: string;
    };
    truck?: {
      routeName?: string;
    };
  };
}

interface Product {
  product_id: string;
  name: string;
  unit_price: number;
  stock: number;
  space_unit: number;
  description: string;
}

interface KPIData {
  totalSales: number;
  totalOrders: number;
  avgOrderValue: number;
  activeRoutes: number;
  onTimeDeliveries: number;
  totalProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  activeCustomers: number;
  quarterInfo: {
    year: number;
    quarter: number;
    label: string;
  };
}

const Dashboard = () => {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuthToken();


  const fetchOrders = async (): Promise<OrderItem[]> => {
    const response = await fetch(`${API_URL}/orders`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }

    const data = await response.json();
    return data.orders || [];
  };

  const fetchProducts = async (): Promise<Product[]> => {
    const response = await fetch(`${API_URL}/products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data.products || [];
  };

  const calculateKPIs = (orders: OrderItem[], products: Product[]): KPIData => {
    // Current quarter calculation
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentQuarter = Math.ceil((currentDate.getMonth() + 1) / 3);
    
    // Quarter date range
    const quarterStartMonth = (currentQuarter - 1) * 3 + 1;
    const quarterStartDate = new Date(currentYear, quarterStartMonth - 1, 1);
    const quarterEndDate = new Date(currentYear, quarterStartMonth + 2, 0);
    
    // Filter orders for current quarter
    const quarterOrders = orders.filter(order => {
      if (!order.date) return false;
      const orderDate = new Date(order.date);
      return orderDate >= quarterStartDate && orderDate <= quarterEndDate;
    });

    // Calculate financial metrics
    const totalSales = quarterOrders.reduce((sum, order) => sum + Number(order.total_value || 0), 0);
    const totalOrders = quarterOrders.length;
    const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    // Calculate operational metrics
    const uniqueRoutes = new Set(orders.map(order => order.logistics?.truck?.routeName).filter(Boolean));
    const activeRoutes = uniqueRoutes.size;

    // Calculate delivery performance (assuming recent orders)
    const recentOrders = orders.filter(order => {
      if (!order.date) return false;
      const orderDate = new Date(order.date);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return orderDate >= thirtyDaysAgo;
    });

    const deliveredOrders = recentOrders.filter(order => order.status === 'Delivered');
    const onTimeDeliveries = recentOrders.length > 0 
      ? Math.round((deliveredOrders.length / recentOrders.length) * 100) 
      : 0;

    // Calculate product metrics
    const totalProducts = products.length;
    const lowStockProducts = products.filter(p => p.stock > 0 && p.stock < 20).length;
    const outOfStockProducts = products.filter(p => p.stock === 0).length;

    // Calculate customer metrics
    const uniqueCustomers = new Set(quarterOrders.map(order => order.customer_id).filter(Boolean));
    const activeCustomers = uniqueCustomers.size;

    return {
      totalSales,
      totalOrders,
      avgOrderValue,
      activeRoutes,
      onTimeDeliveries,
      totalProducts,
      lowStockProducts,
      outOfStockProducts,
      activeCustomers,
      quarterInfo: {
        year: currentYear,
        quarter: currentQuarter,
        label: `${currentYear} Q${currentQuarter}`
      }
    };
  };

  useEffect(() => {
    console.log('Loading dashboard data...');
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        const [ordersData, productsData] = await Promise.all([
          fetchOrders(),
          fetchProducts()
        ]);
        
        const calculatedKPIs = calculateKPIs(ordersData, productsData);
        setKpis(calculatedKPIs);
      } catch (error) {
        console.error('Dashboard loading error:', error);
        toast({
          title: 'Error loading dashboard',
          description: 'Failed to load dashboard data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const quickLinks = [
    {
      title: 'Quarterly Sales',
      description: 'View sales performance by quarter',
      href: '/admin/reports/quarterly-sales',
      icon: TrendingUp,
      color: 'text-green-600'
    },
    {
      title: 'Most Ordered Items',
      description: 'Top selling products analysis',
      href: '/admin/reports/most-ordered',
      icon: Package,
      color: 'text-blue-600'
    },
    {
      title: 'City/Route Analysis',
      description: 'Geographic sales breakdown',
      href: '/admin/reports/city-route-breakdown',
      icon: MapPin,
      color: 'text-purple-600'
    },
    {
      title: 'Driver Hours',
      description: 'Staff working hours monitoring',
      href: '/admin/reports/driver-hours',
      icon: Clock,
      color: 'text-orange-600'
    },
    {
      title: 'Truck Usage',
      description: 'Fleet utilization analysis',
      href: '/admin/reports/truck-usage',
      icon: Truck,
      color: 'text-red-600'
    },
    {
      title: 'Customer History',
      description: 'Customer order tracking',
      href: '/admin/reports/customer-history',
      icon: Users,
      color: 'text-indigo-600'
    }
  ];

  const formatCurrency = (value: number) => `Rs ${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
                <div className="h-4 w-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2" />
                <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
        <p className="text-muted-foreground">
          Here's an overview of your logistics operations for {kpis?.quarterInfo.label}.
        </p>
      </div>

      {/* KPI Cards - Row 1: Financial Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales (Quarter)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(kpis?.totalSales || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              {kpis?.quarterInfo.label}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Processed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpis?.totalOrders || 0)}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(kpis?.avgOrderValue || 0)}</div>
            <p className="text-xs text-muted-foreground">
              Per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Deliveries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.onTimeDeliveries || 0}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* KPI Cards - Row 2: Operational Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.activeRoutes || 0}</div>
            <p className="text-xs text-muted-foreground">
              Unique delivery routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(kpis?.activeCustomers || 0)}</div>
            <p className="text-xs text-muted-foreground">
              This quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.totalProducts || 0}</div>
            <p className="text-xs text-muted-foreground">
              In catalog
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Stock Alerts</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {(kpis?.lowStockProducts || 0) + (kpis?.outOfStockProducts || 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Low/Out of stock
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-1">
        {/* Quick Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Access to Reports
            </CardTitle>
            <CardDescription>
              Jump to detailed analytics and reports
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="flex items-center p-3 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <link.icon className={`h-5 w-5 mr-3 ${link.color}`} />
                <div className="flex-1">
                  <div className="font-medium">{link.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {link.description}
                  </div>
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>System Status</CardTitle>
          <CardDescription>
            Current operational status of all systems
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Badge variant="default" className="bg-green-100 text-green-800">
              All systems operational
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;