import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, Package, MapPin, Clock, 
  BarChart3, FileText, Users, Truck 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { fetchKPIs, fetchRecentActivity, KPIData } from '@/lib/mockAdminApi';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [kpis, setKpis] = useState<KPIData | null>(null);
  const [recentActivity, setRecentActivity] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [kpiData, activityData] = await Promise.all([
          fetchKPIs(),
          fetchRecentActivity()
        ]);
        setKpis(kpiData);
        setRecentActivity(activityData);
      } catch (error) {
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
  }, [toast]);

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
          Here's an overview of your logistics operations.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales (Quarter)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs {kpis?.totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              +8.5% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Processed</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.ordersProcessed.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              +12% from last quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Routes</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.activeRoutes}</div>
            <p className="text-xs text-muted-foreground">
              Across all major cities
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-Time Deliveries</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{kpis?.onTimeDeliveries}%</div>
            <p className="text-xs text-muted-foreground">
              +2.1% from last quarter
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
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

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Latest updates from your logistics operations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm">{activity}</p>
                  <p className="text-xs text-muted-foreground">
                    {index === 0 ? 'Just now' : `${index + 1} hours ago`}
                  </p>
                </div>
              </div>
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