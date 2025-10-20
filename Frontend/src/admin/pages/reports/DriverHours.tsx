import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { Clock, AlertTriangle, Users, CheckCircle, ChevronRight, ChevronLeft, Plus, Eye, Trash2, Pencil } from 'lucide-react';
// import { fetchDriverHours, DriverHoursData } from '@/lib/mockAdminApi';
import { useToast } from '@/hooks/use-toast';
import { API_URL } from "../../../lib/config";
import { Button } from '@/components/ui/button';
import { getAuthToken } from '@/lib/mockAuth';

interface Driver {
  driver_id: string;
  name: string;
  license_no: string;
  weekly_hours: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  role: 'Driver';
}

interface Assitant {
  assistant_id: string;
  name: string;
  weekly_hours: number;
  status: 'Active' | 'On Leave' | 'Inactive';
  role: 'Assistant';
}

const DriverHours = () => {
  const [driverHoursData, setDriverHoursData] = useState<Driver[]>([]);
  const [assistantHoursData, setAssistantHoursData] = useState<Assitant[]>([]);
  const [selectedWeek, setSelectedWeek] = useState('2024-W10');
  const [loading, setLoading] = useState(true);
  const [driverPage, setDriverPage] = useState(1);
  const [assistantPage, setAssistantPage] = useState(1);
  const { toast } = useToast();
  const itemsPerPage = 10;
  const auth = getAuthToken();

  // const weeks = ['2024-W10', '2024-W09', '2024-W08', '2024-W07'];

  async function fetchDrivers(): Promise<Driver[]> {
    const response = await fetch(`${API_URL}/admin/staffHours/driver`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch Drivers");
    }
    return response.json();
  }



  async function fetchAssistants(): Promise<Assitant[]> {
    const response = await fetch(`${API_URL}/admin/staffHours/assistant`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      }
    });
    if (!response.ok) {
      throw new Error("Failed to fetch Assistants");
    }
    return response.json();
  }



  // Process data for chart
  const chartData1 = driverHoursData.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing[curr.role.toLowerCase()] = curr.weekly_hours;
    } else {
      acc.push({
        name: curr.name,
        [curr.role]: curr.weekly_hours,
        role: curr.role
      });
    }
    return acc;
  }, [] as any[]);

  const chartData2 = assistantHoursData.reduce((acc, curr) => {
    const existing = acc.find(item => item.name === curr.name);
    if (existing) {
      existing[curr.role.toLowerCase()] = curr.weekly_hours;
    } else {
      acc.push({
        name: curr.name,
        [curr.role]: curr.weekly_hours,
        role: curr.role
      });
    }
    return acc;
  }, [] as any[]);



  // --- Driver modal & form state ---
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [isViewDriverOpen, setIsViewDriverOpen] = useState(false);
  const [isDriverFormOpen, setIsDriverFormOpen] = useState(false);
  const [isDeleteDriverOpen, setIsDeleteDriverOpen] = useState(false);
  const [isEditingDriver, setIsEditingDriver] = useState(false);
  const [driverFormData, setDriverFormData] = useState({
    name: '',
    license_no: '',
    weekly_hours: 0,
    status: 'Active' as Driver['status'],
  });

  // --- Assistant modal & form state ---
  const [selectedAssistant, setSelectedAssistant] = useState<Assitant | null>(null);
  const [isViewAssistantOpen, setIsViewAssistantOpen] = useState(false);
  const [isAssistantFormOpen, setIsAssistantFormOpen] = useState(false);
  const [isDeleteAssistantOpen, setIsDeleteAssistantOpen] = useState(false);
  const [isEditingAssistant, setIsEditingAssistant] = useState(false);
  const [assistantFormData, setAssistantFormData] = useState({
    name: '',
    weekly_hours: 0,
    status: 'Active' as Assitant['status'],
  });

  // Load helpers so we can call after mutations
  const loadDrivers = async () => {
    setLoading(true);
    try {
      const data = await fetchDrivers();
      setDriverHoursData(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load drivers', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const loadAssistants = async () => {
    setLoading(true);
    try {
      const data = await fetchAssistants();
      setAssistantHoursData(data);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load assistants', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  // wire previously inline effects to use these loaders
  useEffect(() => { loadDrivers(); }, [selectedWeek]);
  useEffect(() => { loadAssistants(); }, [selectedWeek]);

  // --- Driver handlers ---
  const handleAddDriver = () => {
    setDriverFormData({ name: '', license_no: '', weekly_hours: 0, status: 'Active' });
    setIsEditingDriver(false);
    setIsDriverFormOpen(true);
  };

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsViewDriverOpen(true);
  };

  const handleEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setDriverFormData({
      name: driver.name,
      license_no: driver.license_no,
      weekly_hours: driver.weekly_hours,
      status: driver.status,
    });
    setIsEditingDriver(true);
    setIsDriverFormOpen(true);
  };

  const handleDeleteDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setIsDeleteDriverOpen(true);
  };

  const confirmDeleteDriver = async () => {
    if (!selectedDriver) return;
    try {
      const res = await fetch(`${API_URL}/drivers/${selectedDriver.driver_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete driver');
      toast({ title: 'Success', description: 'Driver deleted' });
      await loadDrivers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Delete failed', variant: 'destructive' });
    } finally {
      setIsDeleteDriverOpen(false);
      setSelectedDriver(null);
    }
  };

  const submitDriverForm = async () => {
    try {
      const payload = { ...driverFormData };
      let res;
      if (isEditingDriver && selectedDriver) {
        res = await fetch(`${API_URL}/drivers/${selectedDriver.driver_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/drivers`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      toast({ title: 'Success', description: isEditingDriver ? 'Driver updated' : 'Driver added' });
      setIsDriverFormOpen(false);
      setSelectedDriver(null);
      await loadDrivers();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Save failed', variant: 'destructive' });
    }
  };

  // --- Assistant handlers ---
  const handleAddAssistant = () => {
    setAssistantFormData({ name: '', weekly_hours: 0, status: 'Active' });
    setIsEditingAssistant(false);
    setIsAssistantFormOpen(true);
  };

  const handleViewAssistant = (assistant: Assitant) => {
    setSelectedAssistant(assistant);
    setIsViewAssistantOpen(true);
  };

  const handleEditAssistant = (assistant: Assitant) => {
    setSelectedAssistant(assistant);
    setAssistantFormData({ name: assistant.name, weekly_hours: assistant.weekly_hours, status: assistant.status });
    setIsEditingAssistant(true);
    setIsAssistantFormOpen(true);
  };

  const handleDeleteAssistant = (assistant: Assitant) => {
    setSelectedAssistant(assistant);
    setIsDeleteAssistantOpen(true);
  };

  const confirmDeleteAssistant = async () => {
    if (!selectedAssistant) return;
    try {
      const res = await fetch(`${API_URL}/assistants/${selectedAssistant.assistant_id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${auth.token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete assistant');
      toast({ title: 'Success', description: 'Assistant deleted' });
      await loadAssistants();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Delete failed', variant: 'destructive' });
    } finally {
      setIsDeleteAssistantOpen(false);
      setSelectedAssistant(null);
    }
  };

  const submitAssistantForm = async () => {
    try {
      const payload = { ...assistantFormData };
      let res;
      if (isEditingAssistant && selectedAssistant) {
        res = await fetch(`${API_URL}/assistants/${selectedAssistant.assistant_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },

          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/assistants`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${auth.token}`
          },
          body: JSON.stringify(payload),
        });
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Save failed');
      toast({ title: 'Success', description: isEditingAssistant ? 'Assistant updated' : 'Assistant added' });
      setIsAssistantFormOpen(false);
      setSelectedAssistant(null);
      await loadAssistants();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Save failed', variant: 'destructive' });
    }
  };

  // Statistics
  // const violations = hoursData.filter(item => item.status === 'Exceeded');
  // const driverViolations = violations.filter(item => item.role === 'Driver');
  // const assistantViolations = violations.filter(item => item.role === 'Assistant');

  // Pagination calculations
  const driverTotalPages = Math.ceil(driverHoursData.length / itemsPerPage);
  const assistantTotalPages = Math.ceil(assistantHoursData.length / itemsPerPage);

  const driverStartIndex = (driverPage - 1) * itemsPerPage;
  const driverEndIndex = driverStartIndex + itemsPerPage;
  const paginatedDrivers = driverHoursData.slice(driverStartIndex, driverEndIndex);

  const assistantStartIndex = (assistantPage - 1) * itemsPerPage;
  const assistantEndIndex = assistantStartIndex + itemsPerPage;
  const paginatedAssistants = assistantHoursData.slice(assistantStartIndex, assistantEndIndex);

  const totalDrivers = driverHoursData.length
  const totalAssistants = assistantHoursData.length;

  const formatNumber = (value: number) => value.toLocaleString();

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Driver & Assistant Hours</h2>
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
          <h2 className="text-2xl font-bold tracking-tight">Driver & Assistant Hours</h2>
          <p className="text-muted-foreground">
            Monitor working hours and identify policy violations
          </p>
        </div>
        {/* <Select value={selectedWeek} onValueChange={setSelectedWeek}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Week" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week) => (
              <SelectItem key={week} value={week}>Week {week.split('-W')[1]}</SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>

      {/* Alert for violations */}
      {/* {violations.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Policy Violations Detected</AlertTitle>
          <AlertDescription>
            {violations.length} staff member(s) exceeded working hour limits for {selectedWeek}.
            {driverViolations.length > 0 && ` ${driverViolations.length} driver(s) exceeded 40 hours.`}
            {assistantViolations.length > 0 && ` ${assistantViolations.length} assistant(s) exceeded 60 hours.`}
          </AlertDescription>
        </Alert>
      )} */}

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDrivers}</div>
            <p className="text-xs text-muted-foreground">
              Active drivers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Assistants</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAssistants}</div>
            <p className="text-xs text-muted-foreground">
              Active assistants
            </p>
          </CardContent>
        </Card>

        {/* <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Policy Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{violations.length}</div>
            <p className="text-xs text-muted-foreground">
              Exceeded limits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(((hoursData.length - violations.length) / hoursData.length) * 100).toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Within limits
            </p>
          </CardContent>
        </Card> */}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Chart - Driver*/}
        <Card>
          <CardHeader>
            <CardTitle>Driver Working Hours Breakdown</CardTitle>
            {/* <CardDescription>Hours worked by each staff member for {selectedWeek}</CardDescription> */}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={driverHoursData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-90} textAnchor='end' interval={0} height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [`${value} hours`, name === 'hours' ? 'Hours Worked' : name]}
                  labelFormatter={(label) => `Staff: ${label}`}
                />
                <Bar
                  dataKey="weekly_hours"
                  fill="hsl(var(--primary))"
                  name="Hours Worked"
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            {/* <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded" />
                <span>Within Limits</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Exceeded Limits</span>
              </div>
            </div> */}
          </CardContent>
        </Card>

        {/* Chart - Assitant*/}
        <Card>
          <CardHeader>
            <CardTitle>Assitant Working Hours Breakdown</CardTitle>
            {/* <CardDescription>Hours worked by each staff member for {selectedWeek}</CardDescription> */}
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={assistantHoursData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-90} textAnchor='end' interval={0} height={100} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => [`${value} hours`, name === 'hours' ? 'Hours Worked' : name]}
                  labelFormatter={(label) => `Staff: ${label}`}
                />
                <Bar
                  dataKey="weekly_hours"
                  fill="orange"
                  name="Hours Worked"
                />
              </BarChart>
            </ResponsiveContainer>

            {/* Legend */}
            {/* <div className="flex items-center justify-center space-x-4 mt-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary rounded" />
                <span>Within Limits</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded" />
                <span>Exceeded Limits</span>
              </div>
            </div> */}
          </CardContent>
        </Card>
      </div>

      {/* Data Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Driver Working Hours Detail</CardTitle>
              <CardDescription>Complete working hours breakdown</CardDescription>
            </div>
            <Button onClick={handleAddDriver}>
              <Plus className="h-4 w-4 mr-2" />
              Add Driver
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  {/* <th className="px-4 py-3">Role</th> */}
                  <th className="px-4 py-3">License Number</th>
                  <th className="px-4 py-3 text-right">Hours</th>
                  {/* <th className="px-4 py-3 text-right">Limit</th> */}
                  <th className="px-4 py-3">Status</th>
                  <th className='px-4 py-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedDrivers.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3">{item.license_no}</td>
                    <td className="px-4 py-3 text-right font-mono">{item.weekly_hours}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'Active' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDriver(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditDriver(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteDriver(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Drivers */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {driverStartIndex + 1} to {Math.min(driverEndIndex, driverHoursData.length)} of {driverHoursData.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setDriverPage(Math.max(1, driverPage - 1))}
                disabled={driverPage === 1}
                className="inline-flex items-center justify-center h-8 w-8 rounded border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: driverTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setDriverPage(pageNum)}
                    className={`h-8 w-8 rounded border ${driverPage === pageNum
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input hover:bg-accent'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setDriverPage(Math.min(driverTotalPages, driverPage + 1))}
                disabled={driverPage === driverTotalPages}
                className="inline-flex items-center justify-center h-8 w-8 rounded border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Table - Assistants*/}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Assistant Working Hours Detail</CardTitle>
              <CardDescription>Complete working hours breakdown</CardDescription>
            </div>
            <Button onClick={handleAddAssistant}>
              <Plus className="h-4 w-4 mr-2" />
              Add Assistant
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  {/* <th className="px-4 py-3">Role</th> */}
                  {/* <th className="px-4 py-3">Week</th> */}
                  <th className="px-4 py-3 text-right">Hours</th>
                  {/* <th className="px-4 py-3 text-right">Limit</th> */}
                  <th className="px-4 py-3">Status</th>
                  <th className='px-4 py-3 text-right'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedAssistants.map((item, index) => (
                  <tr key={index} className="border-b">
                    <td className="px-4 py-3 font-medium">{item.name}</td>
                    <td className="px-4 py-3 text-right font-mono">{item.weekly_hours}</td>
                    <td className="px-4 py-3">
                      <Badge variant={item.status === 'Active' ? 'default' : 'destructive'}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className='px-4 py-3 text-right'>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewAssistant(item)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditAssistant(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteAssistant(item)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls - Assistants */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing {assistantStartIndex + 1} to {Math.min(assistantEndIndex, assistantHoursData.length)} of {assistantHoursData.length}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setAssistantPage(Math.max(1, assistantPage - 1))}
                disabled={assistantPage === 1}
                className="inline-flex items-center justify-center h-8 w-8 rounded border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: assistantTotalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => setAssistantPage(pageNum)}
                    className={`h-8 w-8 rounded border ${assistantPage === pageNum
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-input hover:bg-accent'
                      }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setAssistantPage(Math.min(assistantTotalPages, assistantPage + 1))}
                disabled={assistantPage === assistantTotalPages}
                className="inline-flex items-center justify-center h-8 w-8 rounded border border-input hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Policy Information */}
      <Card>
        <CardHeader>
          <CardTitle>Working Hours Policy</CardTitle>
          <CardDescription>Current limits and regulations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm"><strong>Drivers:</strong> Maximum 40 hours per week</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm"><strong>Assistants:</strong> Maximum 60 hours per week</span>
          </div>
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-orange-500" />
            <span className="text-sm">Violations require management review and corrective action</span>
          </div>
        </CardContent>
      </Card>

      {/* --- Driver Modals --- */}
      <Dialog open={isViewDriverOpen} onOpenChange={setIsViewDriverOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Driver Details</DialogTitle>
            <DialogDescription>View driver information</DialogDescription>
          </DialogHeader>
          {selectedDriver && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="font-medium">{selectedDriver.name}</p>
              </div>
              <div>
                <Label>License Number</Label>
                <p className="font-medium">{selectedDriver.license_no}</p>
              </div>
              <div>
                <Label>Weekly Hours</Label>
                <p className="font-medium">{selectedDriver.weekly_hours}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="font-medium">{selectedDriver.status}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewDriverOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isDriverFormOpen} onOpenChange={setIsDriverFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingDriver ? 'Edit Driver' : 'Add Driver'}</DialogTitle>
            <DialogDescription>
              {isEditingDriver ? 'Update driver details' : 'Enter new driver information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={driverFormData.name} onChange={(e) => setDriverFormData({ ...driverFormData, name: e.target.value })} />
            </div>
            <div>
              <Label>License Number</Label>
              <Input value={driverFormData.license_no} onChange={(e) => setDriverFormData({ ...driverFormData, license_no: e.target.value })} />
            </div>
            <div>
              <Label>Weekly Hours</Label>
              <Input type="number" value={driverFormData.weekly_hours} onChange={(e) => setDriverFormData({ ...driverFormData, weekly_hours: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={driverFormData.status} onValueChange={(v: Driver['status']) => setDriverFormData({ ...driverFormData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDriverFormOpen(false)}>Cancel</Button>
            <Button onClick={submitDriverForm}>{isEditingDriver ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDriverOpen} onOpenChange={setIsDeleteDriverOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the driver <span className="font-semibold">{selectedDriver?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteDriver} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* --- Assistant Modals --- */}
      <Dialog open={isViewAssistantOpen} onOpenChange={setIsViewAssistantOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assistant Details</DialogTitle>
            <DialogDescription>View assistant information</DialogDescription>
          </DialogHeader>
          {selectedAssistant && (
            <div className="space-y-4">
              <div>
                <Label>Name</Label>
                <p className="font-medium">{selectedAssistant.name}</p>
              </div>
              <div>
                <Label>Weekly Hours</Label>
                <p className="font-medium">{selectedAssistant.weekly_hours}</p>
              </div>
              <div>
                <Label>Status</Label>
                <p className="font-medium">{selectedAssistant.status}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsViewAssistantOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isAssistantFormOpen} onOpenChange={setIsAssistantFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditingAssistant ? 'Edit Assistant' : 'Add Assistant'}</DialogTitle>
            <DialogDescription>
              {isEditingAssistant ? 'Update assistant details' : 'Enter new assistant information'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Name</Label>
              <Input value={assistantFormData.name} onChange={(e) => setAssistantFormData({ ...assistantFormData, name: e.target.value })} />
            </div>
            <div>
              <Label>Weekly Hours</Label>
              <Input type="number" value={assistantFormData.weekly_hours} onChange={(e) => setAssistantFormData({ ...assistantFormData, weekly_hours: Number(e.target.value) })} />
            </div>
            <div>
              <Label>Status</Label>
              <Select value={assistantFormData.status} onValueChange={(v: Assitant['status']) => setAssistantFormData({ ...assistantFormData, status: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="On Leave">On Leave</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssistantFormOpen(false)}>Cancel</Button>
            <Button onClick={submitAssistantForm}>{isEditingAssistant ? 'Update' : 'Add'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAssistantOpen} onOpenChange={setIsDeleteAssistantOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the assistant <span className="font-semibold">{selectedAssistant?.name}</span>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteAssistant} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DriverHours;