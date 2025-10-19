import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Plus, Trash2, AlertCircle, Truck as TruckIcon, Users, Clock } from 'lucide-react';
import { toast } from 'sonner';
import {
  getAllDrivers,
  getAllAssistants,
  getAllTrucks,
  getAllRoutes,
  getAllAllocations,
  addAllocation,
  deleteAllocation,
  validateAllocation,
  type Driver,
  type Assistant,
  type Truck,
  type Route,
  type Allocation,
  type ValidationError,
} from '@/lib/allocationQueries';

const Allocations = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  const [formData, setFormData] = useState({
    route_id: '',
    truck_id: '',
    driver_id: '',
    assistant_id: '',
    delivery_date: '',
    delivery_hours: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setDrivers(getAllDrivers());
      setAssistants(getAllAssistants());
      setTrucks(getAllTrucks());
      setRoutes(getAllRoutes());
      setAllocations(getAllAllocations());
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load allocation data');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors([]);

    // Validate form
    const errors = validateAllocation(
      formData.driver_id,
      formData.assistant_id,
      formData.delivery_date,
      parseFloat(formData.delivery_hours)
    );

    if (errors.length > 0) {
      setValidationErrors(errors);
      return;
    }

    try {
      addAllocation({
        route_id: formData.route_id,
        truck_id: formData.truck_id,
        driver_id: formData.driver_id,
        assistant_id: formData.assistant_id,
        delivery_date: formData.delivery_date,
        delivery_hours: parseFloat(formData.delivery_hours),
        status: 'Scheduled',
      });

      toast.success('Allocation successfully added!');
      setShowDialog(false);
      setFormData({
        route_id: '',
        truck_id: '',
        driver_id: '',
        assistant_id: '',
        delivery_date: '',
        delivery_hours: '',
      });
      loadData();
    } catch (error) {
      console.error('Failed to add allocation:', error);
      toast.error('Failed to add allocation');
    }
  };

  const handleDelete = (allocationId: string) => {
    try {
      deleteAllocation(allocationId);
      toast.success('Allocation deleted successfully');
      loadData();
    } catch (error) {
      console.error('Failed to delete allocation:', error);
      toast.error('Failed to delete allocation');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      Scheduled: 'default',
      'In Progress': 'secondary',
      Completed: 'outline',
      Cancelled: 'destructive',
    };
    return <Badge variant={variants[status] || 'default'}>{status}</Badge>;
  };

  const getProgressColor = (hours: number, limit: number) => {
    const percentage = (hours / limit) * 100;
    if (percentage >= 95) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const availableTrucks = trucks.filter(t => t.status === 'Available').length;
  const totalTrucks = trucks.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Driver & Truck Allocation</h1>
          <p className="text-muted-foreground">Manage delivery allocations and monitor resource availability</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Allocation
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Trucks</CardTitle>
            <TruckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{availableTrucks} / {totalTrucks}</div>
            <p className="text-xs text-muted-foreground">
              {totalTrucks - availableTrucks} in use or maintenance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
            <p className="text-xs text-muted-foreground">
              {drivers.filter(d => d.hours_this_week < 40).length} available this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Assistants</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{assistants.length}</div>
            <p className="text-xs text-muted-foreground">
              {assistants.filter(a => a.hours_this_week < 60).length} available this week
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Working Hours Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Driver Working Hours</CardTitle>
            <CardDescription>Weekly limit: 40 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {drivers.map(driver => (
              <div key={driver.driver_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{driver.name}</span>
                  <span className="text-muted-foreground">
                    {driver.hours_this_week.toFixed(1)} / 40 hrs
                  </span>
                </div>
                <Progress
                  value={(driver.hours_this_week / 40) * 100}
                  className={`h-2 ${getProgressColor(driver.hours_this_week, 40)}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assistant Working Hours</CardTitle>
            <CardDescription>Weekly limit: 60 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {assistants.map(assistant => (
              <div key={assistant.assistant_id} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{assistant.name}</span>
                  <span className="text-muted-foreground">
                    {assistant.hours_this_week.toFixed(1)} / 60 hrs
                  </span>
                </div>
                <Progress
                  value={(assistant.hours_this_week / 60) * 100}
                  className={`h-2 ${getProgressColor(assistant.hours_this_week, 60)}`}
                />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Allocations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Current Allocations</CardTitle>
          <CardDescription>All scheduled and active deliveries</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Route</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Truck</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead>Assistant</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allocations.map(allocation => (
                <TableRow key={allocation.allocation_id}>
                  <TableCell className="font-medium">{allocation.route_name}</TableCell>
                  <TableCell>{allocation.city}</TableCell>
                  <TableCell>{allocation.truck_license}</TableCell>
                  <TableCell>{allocation.driver_name}</TableCell>
                  <TableCell>{allocation.assistant_name}</TableCell>
                  <TableCell>{new Date(allocation.delivery_date).toLocaleDateString()}</TableCell>
                  <TableCell>{allocation.delivery_hours}h</TableCell>
                  <TableCell>{getStatusBadge(allocation.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(allocation.allocation_id)}
                      disabled={allocation.status === 'Completed'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* New Allocation Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Allocation</DialogTitle>
            <DialogDescription>
              Assign a driver, assistant, and truck to a delivery route
            </DialogDescription>
          </DialogHeader>

          {validationErrors.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Validation Errors</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside space-y-1">
                  {validationErrors.map((error, idx) => (
                    <li key={idx}>{error.message}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route">Route</Label>
              <Select value={formData.route_id} onValueChange={(value) => {
                setFormData({ ...formData, route_id: value });
                const route = routes.find(r => r.route_id === value);
                if (route) {
                  setFormData(prev => ({ ...prev, delivery_hours: route.estimated_hours.toString() }));
                }
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select route" />
                </SelectTrigger>
                <SelectContent>
                  {routes.map(route => (
                    <SelectItem key={route.route_id} value={route.route_id}>
                      {route.name} ({route.estimated_hours}h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="truck">Truck</Label>
              <Select value={formData.truck_id} onValueChange={(value) => setFormData({ ...formData, truck_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select truck" />
                </SelectTrigger>
                <SelectContent>
                  {trucks.filter(t => t.status === 'Available').map(truck => (
                    <SelectItem key={truck.truck_id} value={truck.truck_id}>
                      {truck.license_plate}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="driver">Driver</Label>
              <Select value={formData.driver_id} onValueChange={(value) => setFormData({ ...formData, driver_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select driver" />
                </SelectTrigger>
                <SelectContent>
                  {drivers.map(driver => (
                    <SelectItem key={driver.driver_id} value={driver.driver_id}>
                      {driver.name} ({driver.hours_this_week}h / 40h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assistant">Assistant</Label>
              <Select value={formData.assistant_id} onValueChange={(value) => setFormData({ ...formData, assistant_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select assistant" />
                </SelectTrigger>
                <SelectContent>
                  {assistants.map(assistant => (
                    <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                      {assistant.name} ({assistant.hours_this_week}h / 60h)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Delivery Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.delivery_date}
                onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hours">Estimated Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.5"
                min="0"
                value={formData.delivery_hours}
                onChange={(e) => setFormData({ ...formData, delivery_hours: e.target.value })}
                required
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">Create Allocation</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Allocations;