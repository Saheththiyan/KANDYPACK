import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, Package } from 'lucide-react';
import { fetchQuarterlySales, QuarterlySalesData } from '@/lib/mockAdminApi';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/config';
import { getAuthToken } from '@/lib/mockAuth';

const QuarterlySales = () => {
  const [salesData, setSalesData] = useState<QuarterlySalesData[]>([]);
  const [selectedYear, setSelectedYear] = useState('2024');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuthToken();

  const years = ['2024', '2023', '2022'];

  useEffect(() => {
    const loadSalesData = async () => {
      setLoading(true);
      try {
        const data = await fetch(`${API_URL}/reports/quarterly?year=${selectedYear}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
        }).then(res => res.json()).then(res => res.data);
        setSalesData(data || []);
      } catch (error) {
        toast({
          title: 'Error loading sales data',
          description: 'Failed to load quarterly sales data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [selectedYear, toast]);

  const totalSales = salesData.reduce((sum, item) => sum + Number(item.value), 0);
  const totalVolume = salesData.reduce((sum, item) => sum + Number(item.volume), 0);
  const avgGrowth = salesData.reduce((sum, item) => sum + Number(item.growth), 0) / salesData.length;

  const formatCurrency = (value: number) => `Rs ${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Quarterly Sales Report</h2>
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
          <h2 className="text-2xl font-bold tracking-tight">Quarterly Sales Report</h2>
          <p className="text-muted-foreground">
            View sales performance and growth trends by quarter
          </p>
        </div>
        <Select value={selectedYear} onValueChange={setSelectedYear}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>{year}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
            <p className="text-xs text-muted-foreground">
              For {selectedYear}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalVolume)}</div>
            <p className="text-xs text-muted-foreground">
              Units sold
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgGrowth.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Quarter over quarter
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales Value by Quarter</CardTitle>
            <CardDescription>Revenue trends across quarters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis tickFormatter={(value) => `Rs ${(value / 1000000).toFixed(1)}M`} />
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Sales Value']} />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Trend</CardTitle>
            <CardDescription>Units sold across quarters</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="quarter" />
                <YAxis />
                <Tooltip formatter={(value) => [formatNumber(Number(value)), 'Volume']} />
                <Line
                  type="monotone"
                  dataKey="volume"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Quarterly Breakdown</CardTitle>
          <CardDescription>Detailed quarterly performance data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Quarter</th>
                  <th className="px-4 py-3 text-right">Sales Value</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">Growth %</th>
                </tr>
              </thead>
              <tbody>
                {salesData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.quarter}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.value)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.volume)}</td>
                    <td className="px-4 py-3 text-right">
                      <Badge variant={item.growth > 5 ? "default" : "secondary"}>
                        {item.growth > 0 ? '+' : ''}{item.growth}%
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

export default QuarterlySales;