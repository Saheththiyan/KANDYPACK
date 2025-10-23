// Frontend/src/admin/pages/reports/TruckUsage.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Truck, Clock, TrendingUp } from 'lucide-react';
import { TruckUsageData } from '@/lib/mockAdminApi';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/config';
import { getAuthToken } from '@/lib/mockAuth';

const TruckUsage = () => {
  const [usageData, setUsageData] = useState<TruckUsageData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2025-01'); // Default to current month
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuthToken();

  // Generate month options dynamically for better coverage
  const generateMonthOptions = () => {
    const options = [];
    const currentDate = new Date();
    
    // Go back 24 months from current date
    for (let i = 0; i < 24; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      
      options.push({
        value: `${year}-${month}`,
        label: monthName
      });
    }
    
    return options;
  };

  const months = generateMonthOptions();

  // Alternative: If you prefer a fixed list with more options
  const staticMonths = [
    // 2025
    { value: '2025-12', label: 'December 2025' },
    { value: '2025-11', label: 'November 2025' },
    { value: '2025-10', label: 'October 2025' },
    { value: '2025-09', label: 'September 2025' },
    { value: '2025-08', label: 'August 2025' },
    { value: '2025-07', label: 'July 2025' },
    { value: '2025-06', label: 'June 2025' },
    { value: '2025-05', label: 'May 2025' },
    { value: '2025-04', label: 'April 2025' },
    { value: '2025-03', label: 'March 2025' },
    { value: '2025-02', label: 'February 2025' },
    { value: '2025-01', label: 'January 2025' },
    
    // 2024
    { value: '2024-12', label: 'December 2024' },
    { value: '2024-11', label: 'November 2024' },
    { value: '2024-10', label: 'October 2024' },
    { value: '2024-09', label: 'September 2024' },
    { value: '2024-08', label: 'August 2024' },
    { value: '2024-07', label: 'July 2024' },
    { value: '2024-06', label: 'June 2024' },
    { value: '2024-05', label: 'May 2024' },
    { value: '2024-04', label: 'April 2024' },
    { value: '2024-03', label: 'March 2024' },
    { value: '2024-02', label: 'February 2024' },
    { value: '2024-01', label: 'January 2024' },
    
    // 2023
    { value: '2023-12', label: 'December 2023' },
    { value: '2023-11', label: 'November 2023' },
    { value: '2023-10', label: 'October 2023' },
    { value: '2023-09', label: 'September 2023' },
    { value: '2023-08', label: 'August 2023' },
    { value: '2023-07', label: 'July 2023' },
    { value: '2023-06', label: 'June 2023' },
    { value: '2023-05', label: 'May 2023' },
    { value: '2023-04', label: 'April 2023' },
    { value: '2023-03', label: 'March 2023' },
    { value: '2023-02', label: 'February 2023' },
    { value: '2023-01', label: 'January 2023' },
  ];

  const fetchTruckUsage = async (month: string) => {
    const [year, monthNum] = month.split('-');
    const response = await fetch(`${API_URL}/reports/truck-usage?year=${year}&month=${monthNum}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    const data = await response.json();
    return data.trucks;
  };

  useEffect(() => {
    const loadUsageData = async () => {
      setLoading(true);
      try {
        const data = await fetchTruckUsage(selectedMonth);
        setUsageData(data);
      } catch (error) {
        toast({
          title: 'Error loading truck usage data',
          description: 'Failed to load truck usage data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadUsageData();
  }, [selectedMonth, toast]);

  const formatNumber = (value: number) => value ? value.toLocaleString() : '0';

  const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Truck Usage Report</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Truck Usage Report</h2>
          <p className="text-muted-foreground">
            Fleet utilization and performance metrics per month
          </p>
        </div>
        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select Month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month.value} value={month.value}>
                {month.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Trips</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber((usageData ?? []).reduce((sum, item) => sum + item.totalDeliveries, 0))}</div>
            <p className="text-xs text-muted-foreground">
              Across all trucks
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber((usageData ?? []).reduce((sum, item) => sum + item.inProgressDeliveries, 0))}</div>
            <p className="text-xs text-muted-foreground">
              Operational hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Utilization</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usageData.reduce((sum, item) => sum + Number(item.capacity), 0).toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Fleet average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Trips per Truck</CardTitle>
            <CardDescription>Number of deliveries by vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={usageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="truckId" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalDeliveries" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Truck Usage Details</CardTitle>
          <CardDescription>Detailed performance data for each vehicle</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Truck ID</th>
                  <th className="px-4 py-3 text-right">Trips</th>
                  <th className="px-4 py-3 text-right">Hours</th>
                  <th className="px-4 py-3 text-right">Utilization</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {(usageData ?? []).map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.truckId}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.totalDeliveries)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.inProgressDeliveries)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={item.capacity > 75 ? "default" : "secondary"}>
                        {item.capacity}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={item.completedDeliveries > 75 ? "default" : item.completedDeliveries > 50 ? "secondary" : "outline"}>
                        {item.completedDeliveries > 75 ? 'High' : item.completedDeliveries > 50 ? 'Medium' : 'Low'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TruckUsage;