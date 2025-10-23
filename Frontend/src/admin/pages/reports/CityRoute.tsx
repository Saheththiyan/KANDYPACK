import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { MapPin, Package, DollarSign } from 'lucide-react';
// import { fetchCityRouteData, CityRouteData } from '@/lib/mockAdminApi';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from "../../../lib/config";
import { getAuthToken } from '@/lib/mockAuth';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d', '#ffc658'];

interface CityRouteData { 
  city: string; 
  stops: string; 
  orders: number; 
  sales_value: number; 
}

const CityRoute = () => {
  const [routeData, setRouteData] = useState<CityRouteData[]>([]);
  const [selectedQuarter, setSelectedQuarter] = useState('2025 Q4');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const auth = getAuthToken();

  // const quarters = ['2024 Q4', '2024 Q3', '2024 Q2', '2024 Q1'];

  async function fetchCityRouteData(): Promise<CityRouteData[]> { 
    const response = await fetch(`${API_URL}/admin/cityRouteSales`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch Sales");
    }
    return response.json();
  }

  useEffect(() => {
    const loadRouteData = async () => {
      setLoading(true);
      try {
        const data = await fetchCityRouteData();
        setRouteData(data);
      } catch (error) {
        toast({
          title: 'Error loading route data',
          description: 'Failed to load city/route breakdown. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadRouteData();
  }, [selectedQuarter, toast]);

  // Process data for city pie chart
  const cityData = routeData.reduce((acc, curr) => {
    const existing = acc.find(item => item.city === curr.city);
    if (existing) {
      existing.value += curr.sales_value;
      existing.orders += curr.orders;
      // existing.volume += curr.volume;
    } else {
      acc.push({
        city: curr.city,
        value: curr.sales_value,
        orders: curr.orders
        // volume: curr.volume
      });
    }
    return acc;
  }, [] as { city: string; value: number; orders: number; }[]);

  // Filter route data based on selected city
  const filteredRouteData = selectedCity === 'All Cities' 
    ? routeData 
    : routeData.filter(item => item.city === selectedCity);

  const cities = ['All Cities', ...Array.from(new Set(routeData.map(item => item.city)))];

  const totalValue = routeData.reduce((sum, item) => sum + Number(item.sales_value), 0);
  const totalOrders = routeData.reduce((sum, item) => sum + Number(item.orders), 0);
  // const totalVolume = routeData.reduce((sum, item) => sum + item.volume, 0);

  const formatCurrency = (value: number) => `Rs ${value.toLocaleString()}`;
  const formatNumber = (value: number) => value.toLocaleString();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">City/Route Breakdown</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-96 bg-muted rounded animate-pulse" />
          <div className="h-96 bg-muted rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">City/Route Breakdown</h2>
          <p className="text-muted-foreground">
            Sales distribution across cities and delivery routes
          </p>
        </div>
        {/* <div className="flex space-x-2">
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
          <Select value={selectedCity} onValueChange={setSelectedCity}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="City" />
            </SelectTrigger>
            <SelectContent>
              {cities.map((city) => (
                <SelectItem key={city} value={city}>{city}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div> */}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
            <p className="text-xs text-muted-foreground">
              Across all routes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(totalOrders)}</div>
            <p className="text-xs text-muted-foreground">
              Orders processed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cities</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{cities.length}</div>
            <p className="text-xs text-muted-foreground">
              Cities served
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by City</CardTitle>
            <CardDescription>Revenue distribution across cities</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={cityData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ city, percent }) => `${city} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {cityData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [formatCurrency(Number(value)), 'Sales Value']} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Route Performance</CardTitle>
            <CardDescription>
              {selectedCity === 'All Cities' ? 'All route performance' : `Routes in ${selectedCity}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {
              (() => {
                const maxSales = filteredRouteData.length ? Math.max(...filteredRouteData.map(d => Number(d.sales_value))) : 0;
                const step = maxSales > 0 ? Math.pow(10, Math.floor(Math.log10(maxSales))) : 1000;
                const upper = Math.ceil(maxSales / step) * step;
                const ticks = [0, Math.round(upper / 2), upper];

                return (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={filteredRouteData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="stops" />
                      <YAxis
                        type="number"
                        domain={[0, upper]}     // set Y axis range
                        ticks={ticks}          // explicit tick marks
                        tickFormatter={(value) => `Rs ${value.toLocaleString()}`}
                        scale="linear"         // use "log" for logarithmic scale if desired
                      />
                      <Tooltip formatter={(value, name) => [formatCurrency(Number(value)), name]} />
                      <Legend />
                      <Bar dataKey="sales_value" fill="hsl(var(--primary))" name="Sales Value" />
                    </BarChart>
                  </ResponsiveContainer>
                );
              })()
            }
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <CardTitle>Route Details</CardTitle>
          <CardDescription>
            Complete breakdown by city and route for {selectedQuarter}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3 text-right">Orders</th>
                  <th className="px-4 py-3 text-right">Sales Value</th>
                  {/* <th className="px-4 py-3 text-right">Volume</th> */}
                </tr>
              </thead>
              <tbody>
                {filteredRouteData.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.city}</td>
                    <td className="px-4 py-3">{item.stops}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.orders)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.sales_value)}</td>
                    {/* <td className="px-4 py-3 text-right">{formatNumber(item.volume)}</td> */}
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

export default CityRoute;