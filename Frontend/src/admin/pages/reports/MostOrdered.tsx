import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { Package, TrendingUp, DollarSign } from 'lucide-react';
// import { fetchMostOrdered, MostOrderedItem } from '@/lib/mockAdminApi';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from "../../../lib/config";
import { getAuthToken } from '@/lib/mockAuth';

interface MostOrderedItem {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
}

const MostOrdered = () => {
  const [itemsData, setItemsData] = useState<MostOrderedItem[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState('2025 Q4');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuthToken();

  const quarters = ['2025 Q4', '2025 Q3', '2025 Q2', '2025 Q1'];

  async function fetchMostOrdered(quarterString: string) {
    const [year, quarterLabel] = quarterString.split(' ');
    const quarter = quarterLabel.replace('Q', '');

    const response = await fetch(`${API_URL}/reports/most-ordered?year=${year}&quarter=${quarter}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    const data = await response.json();
    return data.top;
  }


  useEffect(() => {
    const loadItemsData = async () => {
      setLoading(true);
      try {
        const data = await fetchMostOrdered(selectedQuarter);
        setItemsData(data);
      } catch (error) {
        toast({
          title: 'Error loading items data',
          description: 'Failed to load most ordered items. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadItemsData();
  }, [selectedQuarter, toast]);

  const totalUnits = itemsData.reduce((sum, item) => sum + Number(item.unitsSold), 0);
  const totalRevenue = itemsData.reduce((sum, item) => sum + Number(item.revenue), 0);

  const formatCurrency = (value: number) => `Rs ${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Most Ordered Items</h2>
        </div>
        <div className="h-96 bg-muted rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Most Ordered Items</h2>
          <p className="text-muted-foreground">
            Top selling products by volume for the selected quarter
          </p>
        </div>
        <Select value={selectedQuarter} onValueChange={setSelectedQuarter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Quarter" />
          </SelectTrigger>
          <SelectContent>
            {quarters.map((quarter) => (
              <SelectItem key={quarter} value={quarter}>{quarter}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units Sold</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalUnits)}</div>
            <p className="text-xs text-muted-foreground">
              Top 10 items in {selectedQuarter}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From top performing items
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Items by Volume</CardTitle>
          <CardDescription>Units sold for {selectedQuarter}</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart 
              data={itemsData} 
              layout="vertical"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={formatNumber} />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={100}
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => value.length > 15 ? `${value.substring(0, 15)}...` : value}
              />
              <Tooltip 
                formatter={(value, name) => [formatNumber(Number(value)), 'Units Sold']}
                labelFormatter={(label) => `Product: ${label}`}
              />
              <Bar 
                dataKey="unitsSold" 
                fill="hsl(var(--primary))"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Breakdown</CardTitle>
          <CardDescription>Complete data for top performing items</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Rank</th>
                  <th className="px-4 py-3">Item Name</th>
                  <th className="px-4 py-3 text-right">Units Sold</th>
                  {/* <th className="px-4 py-3 text-right">% of Total</th> */}
                  <th className="px-4 py-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {itemsData.map((item, index) => (
                  <tr key={item.id} className="border-b">
                    <td className="px-4 py-3">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold mr-2">
                          {index + 1}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.unitsSold)}</td>
                    {/* <td className="px-4 py-3 text-right">{item.percentageOfTotal.toFixed(1)}%</td> */}
                    <td className="px-4 py-3 text-right">{formatCurrency(item.revenue)}</td>
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

export default MostOrdered;