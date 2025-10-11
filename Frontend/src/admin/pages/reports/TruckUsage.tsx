import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { Truck, Clock, TrendingUp } from 'lucide-react';
import { fetchTruckUsage, TruckUsageData } from '@/lib/mockAdminApi';
import { useToast } from '@/hooks/use-toast';

const TruckUsage = () => {
  const [usageData, setUsageData] = useState<TruckUsageData[]>([]);
  const [selectedMonth, setSelectedMonth] = useState('2024-03');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const months = [
    { value: '2024-03', label: 'March 2024' },
    { value: '2024-02', label: 'February 2024' },
    { value: '2024-01', label: 'January 2024' },
    { value: '2023-12', label: 'December 2023' },
  ];

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

  const totalTrips = usageData.reduce((sum, item) => sum + item.trips, 0);
  const totalHours = usageData.reduce((sum, item) => sum + item.hours, 0);
  const avgUtilization = usageData.reduce((sum, item) => sum + item.utilization, 0) / usageData.length;

  const formatNumber = (value: number) => value.toLocaleString();

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
            <div className="text-2xl font-bold">{formatNumber(totalTrips)}</div>
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
            <div className="text-2xl font-bold">{formatNumber(totalHours)}</div>
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
            <div className="text-2xl font-bold">{avgUtilization.toFixed(1)}%</div>
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
                <Bar dataKey="trips" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Utilization Distribution</CardTitle>
            <CardDescription>Fleet utilization breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageData}
                  dataKey="utilization"
                  nameKey="truckId"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={(entry) => `${entry.truckId}: ${entry.utilization.toFixed(1)}%`}
                >
                  {usageData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
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
                {usageData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.truckId}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.trips)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.hours)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={item.utilization > 75 ? "default" : "secondary"}>
                        {item.utilization.toFixed(1)}%
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={item.utilization > 75 ? "default" : item.utilization > 50 ? "secondary" : "outline"}>
                        {item.utilization > 75 ? 'High' : item.utilization > 50 ? 'Medium' : 'Low'}
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
