import { useState, useEffect, useMemo } from 'react';
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

  // --- Quick links (unchanged) ---
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

  // --- Derived %s for the rings (purely visual targets; safe fallbacks) ---
  const ring = useMemo(() => {
    const sales = kpis?.totalSales ?? 0; // assume target 18M
    const orders = kpis?.ordersProcessed ?? 0; // assume target 2k
    const routes = kpis?.activeRoutes ?? 0; // normalize by *12 (7 -> 84%)
    const onTime = kpis?.onTimeDeliveries ?? 0;

    const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)));

    return {
      salesPct: clamp((sales / 18_000_000) * 100 || 0),
      ordersPct: clamp((orders / 2_000) * 100 || 0),
      routesPct: clamp(routes * 12 || 0),
      onTimePct: clamp(onTime || 0),
    };
  }, [kpis]);

  // --- Loading skeleton (kept lightweight) ---
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="rounded-2xl border bg-card/60 backdrop-blur p-6">
          <div className="h-6 w-48 bg-muted/60 rounded animate-pulse mb-2" />
          <div className="h-3 w-72 bg-muted/50 rounded animate-pulse" />
        </div>
        <div className="rounded-2xl border bg-card/60 backdrop-blur p-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-16 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Small SVG donut helper ---
  const Donut = ({
    value,
    color,
    label,
  }: {
    value: number;
    color: string;
    label: string;
  }) => (
    <div className="flex flex-col items-center text-center">
      <div className="relative w-24 h-24">
        <svg viewBox="0 0 36 36" className="w-full h-full">
          <path
            className="text-muted-foreground/10"
            strokeWidth="3.8"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={`${color} stroke-current`}
            strokeWidth="3.8"
            strokeDasharray={`${value}, 100`}
            strokeLinecap="round"
            fill="none"
            d="M18 2.0845
              a 15.9155 15.9155 0 0 1 0 31.831
              a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <text
            x="18"
            y="20.35"
            className="text-sm font-semibold fill-foreground"
            textAnchor="middle"
          >
            {value}%
          </text>
        </svg>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{label}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome / hero strip */}
      <div className="relative overflow-hidden rounded-2xl border bg-card/60 backdrop-blur">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/15 via-primary/10 to-violet-600/10" />
        <div className="relative p-6 sm:p-8 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="border-primary/40 text-primary">
                Dashboard
              </Badge>
              <span className="text-xs text-muted-foreground">
                Updated {new Date().toLocaleTimeString()}
              </span>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back!</h2>
            <p className="text-muted-foreground mt-1">
              Here’s an overview of your logistics operations.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="border-primary/30">
              <Link to="/admin/reports/quarterly-sales">View Sales Report</Link>
            </Button>
            <Button asChild size="sm">
              <Link to="/admin/reports/most-ordered">Top Items</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ===================== UNIQUE: OPERATIONS OVERVIEW PANEL ===================== */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Operations Overview
          </CardTitle>
          <CardDescription>Real-time summary of key logistics metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Inline metric rows (storytelling line items) */}
          <div className="space-y-5">
            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm text-muted-foreground">Quarterly Sales</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                Rs {kpis?.totalSales.toLocaleString()}
                <span className="ml-2 text-xs text-emerald-600">+8.5%</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-sky-500" />
                <span className="text-sm text-muted-foreground">Orders Processed</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {kpis?.ordersProcessed.toLocaleString()}
                <span className="ml-2 text-xs text-sky-600">+12%</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-violet-500" />
                <span className="text-sm text-muted-foreground">Active Routes</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {kpis?.activeRoutes}
                <span className="ml-2 text-xs text-muted-foreground">cities</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-between items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-sm text-muted-foreground">On-Time Deliveries</span>
              </div>
              <div className="text-lg font-semibold text-foreground">
                {kpis?.onTimeDeliveries}%
                <span className="ml-2 text-xs text-amber-600">+2.1%</span>
              </div>
            </div>
          </div>

          {/* Visual summary: four radial rings */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <Donut value={ring.salesPct} color="text-emerald-500" label="Sales vs Target" />
            <Donut value={ring.ordersPct} color="text-sky-500" label="Orders vs Target" />
            <Donut value={ring.routesPct} color="text-violet-500" label="Route Coverage" />
            <Donut value={ring.onTimePct} color="text-amber-500" label="On-time Rate" />
          </div>
        </CardContent>
      </Card>
      {/* =========================================================================== */}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Quick Links */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Quick Access to Reports
            </CardTitle>
            <CardDescription>Jump to detailed analytics and reports</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="group flex items-center p-3 rounded-lg border bg-background/40 hover:bg-accent/60 transition-colors"
              >
                <div className={`mr-3 rounded-md p-2 bg-muted ${link.color}`}>
                  <link.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="font-medium group-hover:underline underline-offset-2">
                    {link.title}
                  </div>
                  <div className="text-sm text-muted-foreground">{link.description}</div>
                </div>
                <span className="text-xs text-muted-foreground group-hover:text-foreground">
                  View →
                </span>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest updates from your logistics operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="relative pl-6">
                <span className="absolute left-2 top-0 h-full w-px bg-border" />
                <span className="absolute left-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-2 ring-primary/20" />
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm">{activity}</p>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {index === 0 ? 'Just now' : `${index + 1} hours ago`}
                  </span>
                </div>
              </div>
            ))}
            {recentActivity.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* System Status */}
      <Card className="overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-green-500 via-primary to-green-600" />
        <CardHeader className="pb-3">
          <CardTitle>System Status</CardTitle>
          <CardDescription>Current operational status of all systems</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="default" className="bg-green-500/15 text-green-700 dark:text-green-400">
              All systems operational
            </Badge>
            <span className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleString()}
            </span>
            <div className="ml-auto">
              <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <Link to="/admin">Refresh</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
