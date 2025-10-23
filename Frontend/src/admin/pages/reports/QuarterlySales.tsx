import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';
import { TrendingUp, DollarSign, Package } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from '@/lib/config';
import { getAuthToken } from '@/lib/mockAuth';

type QuarterSummary = {
  quarter: number;
  label: string;
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
  growth: number;
};

type MonthlyBreakdown = {
  month: number;
  label: string;
  totalRevenue: number;
  totalOrders: number;
  totalUnits: number;
};

interface QuarterItem {
  quarter: number | string;
  label: string;
  totalRevenue?: number;
  totalOrders?: number;
  totalUnits?: number;
  growth?: number;
}

interface MonthlyBreakdownItem {
  month: number | string;
  label: string;
  totalRevenue?: number;
  totalOrders?: number;
  totalUnits?: number;
}

const formatCurrency = (value: number) =>
  `Rs ${value.toLocaleString('en-LK', { maximumFractionDigits: 0 })}`;

const formatNumber = (value: number) =>
  value.toLocaleString('en-LK', { maximumFractionDigits: 0 });

const formatAxisCurrency = (value: number) => {
  if (!Number.isFinite(value)) return 'Rs 0';
  if (Math.abs(value) >= 1_000) {
    const scaled = value / 1_000;
    const precision = Math.abs(scaled) >= 10 ? 0 : 1;
    return `Rs ${scaled.toFixed(precision)}K`;
  }
  return `Rs ${value.toFixed(0)}`;
};

const defaultYear = new Date().getFullYear().toString();
const defaultQuarterOptions = (year: string) => [
  { value: '1', label: `${year} Q1` },
  { value: '2', label: `${year} Q2` },
  { value: '3', label: `${year} Q3` },
  { value: '4', label: `${year} Q4` },
];

const QuarterlySales = () => {
  const auth = getAuthToken();
  const { toast } = useToast();

  const [availableYears, setAvailableYears] = useState<string[]>([defaultYear]);
  const [selectedYear, setSelectedYear] = useState<string>(defaultYear);
  const [selectedQuarter, setSelectedQuarter] = useState<string>('1');
  const [summary, setSummary] = useState<QuarterSummary[]>([]);
  const [monthlyBreakdown, setMonthlyBreakdown] = useState<MonthlyBreakdown[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const loadSalesData = async () => {
      if (!auth?.token) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          year: selectedYear,
          quarter: selectedQuarter,
        });

        const response = await fetch(`${API_URL}/reports/quarterly?${params.toString()}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${auth.token}`,
          },
        });

        const payload = await response.json();
        if (!response.ok || !payload?.success) {
          throw new Error(payload?.message || 'Failed to load quarterly sales data');
        }

        const { years, quarters, breakdown, selectedQuarter: resolvedQuarter } = payload.data ?? {};

        if (Array.isArray(years) && years.length) {
          setAvailableYears(years.map((year: number | string) => year.toString()));
        } else {
          setAvailableYears((prev) => (prev.length ? prev : [selectedYear]));
        }

        if (Array.isArray(quarters)) {
          setSummary(
            quarters.map((item: QuarterItem) => ({
              quarter: Number(item.quarter),
              label: item.label as string,
              totalRevenue: Number(item.totalRevenue ?? 0),
              totalOrders: Number(item.totalOrders ?? 0),
              totalUnits: Number(item.totalUnits ?? 0),
              growth: Number(item.growth ?? 0),
            }))
          );
        } else {
          setSummary([]);
        }

        if (Array.isArray(breakdown)) {
          setMonthlyBreakdown(
            breakdown.map((item: MonthlyBreakdownItem) => ({
              month: Number(item.month),
              label: item.label as string,
              totalRevenue: Number(item.totalRevenue ?? 0),
              totalOrders: Number(item.totalOrders ?? 0),
              totalUnits: Number(item.totalUnits ?? 0),
            }))
          );
        } else {
          setMonthlyBreakdown([]);
        }

        if (resolvedQuarter && resolvedQuarter.toString() !== selectedQuarter) {
          setSelectedQuarter(resolvedQuarter.toString());
        }
      } catch (error) {
        console.error(error);
        setSummary([]);
        setMonthlyBreakdown([]);
        toast({
          title: 'Error loading sales data',
          description:
            error instanceof Error ? error.message : 'Failed to load quarterly sales data. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadSalesData();
  }, [auth?.token, selectedYear, selectedQuarter, toast]);

  const quarterOptions = summary.length
    ? summary.map((item) => ({ value: item.quarter.toString(), label: item.label }))
    : defaultQuarterOptions(selectedYear);

  const activeQuarter = useMemo(() => {
    const fallback = summary[0];
    return summary.find((item) => item.quarter.toString() === selectedQuarter) ?? fallback ?? null;
  }, [summary, selectedQuarter]);

  const selectedQuarterLabel =
    activeQuarter?.label ?? `${selectedYear} Q${selectedQuarter}`;

  const chartData = monthlyBreakdown.map((item) => ({
    month: item.label,
    revenue: item.totalRevenue,
    volume: item.totalUnits,
  }));

  const hasChartData = chartData.some((item) => item.revenue > 0 || item.volume > 0);

  const handleYearChange = (year: string) => {
    setSelectedYear(year);
    setSelectedQuarter('1');
  };

  const handleQuarterChange = (quarter: string) => {
    setSelectedQuarter(quarter);
  };

  const totalSales = activeQuarter?.totalRevenue ?? 0;
  const totalVolume = activeQuarter?.totalUnits ?? 0;
  const growthRate = activeQuarter?.growth ?? 0;

  const yearsForSelect = availableYears.length ? availableYears : [selectedYear];

  const renderGrowthBadge = (value: number) => {
    if (value > 0) {
      return (
        <Badge variant="default">
          +{value.toFixed(2)}%
        </Badge>
      );
    }

    if (value < 0) {
      return (
        <Badge variant="destructive">
          {value.toFixed(2)}%
        </Badge>
      );
    }

    return (
      <Badge variant="secondary">
        {value.toFixed(2)}%
      </Badge>
    );
  };

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
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quarterly Sales Report</h2>
          <p className="text-muted-foreground">
            View sales performance and growth trends by quarter
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <Select value={selectedYear} onValueChange={handleYearChange}>
            <SelectTrigger className="sm:w-32">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {yearsForSelect.map((year) => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedQuarter} onValueChange={handleQuarterChange}>
            <SelectTrigger className="sm:w-36">
              <SelectValue placeholder="Select quarter" />
            </SelectTrigger>
            <SelectContent>
              {quarterOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
              {selectedQuarterLabel}
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
              Units sold ({selectedQuarterLabel})
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Growth</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{growthRate.toFixed(2)}%</div>
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
            <CardTitle>Sales Value by Month</CardTitle>
            <CardDescription>
              Monthly revenue for {selectedQuarterLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatAxisCurrency(Number(value))} />
                  <Tooltip
                    formatter={(value: number) => [formatCurrency(Number(value)), 'Sales Value']}
                    labelFormatter={(label) => `${label} ${selectedYear}`}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                No sales recorded for {selectedQuarterLabel}.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Volume Trend</CardTitle>
            <CardDescription>
              Units sold by month for {selectedQuarterLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasChartData ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => formatNumber(Number(value))} />
                  <Tooltip
                    formatter={(value: number) => [formatNumber(Number(value)), 'Units Sold']}
                    labelFormatter={(label) => `${label} ${selectedYear}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="volume"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">
                No volume data available for {selectedQuarterLabel}.
              </p>
            )}
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
                {summary.map((item) => (
                  <tr
                    key={item.quarter}
                    className={`border-b ${item.quarter.toString() === selectedQuarter ? 'bg-muted/30' : ''}`}
                  >
                    <td className="px-4 py-3 font-medium">{item.label}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.totalRevenue)}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(item.totalUnits)}</td>
                    <td className="px-4 py-3 text-right">
                      {renderGrowthBadge(item.growth)}
                    </td>
                  </tr>
                ))}
                {!summary.length && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-sm text-muted-foreground">
                      No quarterly data available for {selectedYear}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuarterlySales;
