import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Package, Truck, Users, Clock, CheckCircle, XCircle, Calendar } from 'lucide-react';

const API_URL = "http://localhost:5000";

interface Order {
  order_id: string;
  customer_name: string;
  customer_city: string;
  order_date: string;
  total_items: number;
  total_value: number;
}

interface ProcessedOrder extends Order {
  store_name: string;
  driver_name: string;
  assistant_name: string;
  truck_license: string;
  train_schedule: string;
  delivery_status: string;
}

interface TrainSchedule {
  schedule_id: string;
  train_name: string;
  departure_time: string;
  arrival_time: string;
  city: string;
}

interface Store {
  store_id: string;
  name: string;
  city: string;
  address: string;
}

interface Driver {
  driver_id: string;
  name: string;
  store_id: string;
  hours_this_week: number;
}

interface Assistant {
  assistant_id: string;
  name: string;
  store_id: string;
  hours_this_week: number;
}

interface Truck {
  truck_id: string;
  license_plate: string;
  store_id: string;
  status: string;
}

const Toast = ({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) => (
  <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
    type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
  }`}>
    {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
    <span className="font-medium">{message}</span>
    <button onClick={onClose} className="ml-2 text-gray-500 hover:text-gray-700">×</button>
  </div>
);

const OrderAllocations = () => {
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [processedOrders, setProcessedOrders] = useState<ProcessedOrder[]>([]);
  const [trainSchedules, setTrainSchedules] = useState<TrainSchedule[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [allocationForm, setAllocationForm] = useState({
    train_schedule_id: '',
    store_id: '',
    driver_id: '',
    assistant_id: '',
    truck_id: '',
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Mock data - replace with actual API calls
  const mockPendingOrders: Order[] = [
    {
      order_id: 'ORD001',
      customer_name: 'John Doe',
      customer_city: 'Colombo',
      order_date: '2024-01-15',
      total_items: 5,
      total_value: 15000,
    },
    {
      order_id: 'ORD002',
      customer_name: 'Jane Smith',
      customer_city: 'Galle',
      order_date: '2024-01-16',
      total_items: 3,
      total_value: 8500,
    },
    {
      order_id: 'ORD003',
      customer_name: 'Mike Johnson',
      customer_city: 'Kandy',
      order_date: '2024-01-16',
      total_items: 7,
      total_value: 22000,
    },
  ];

  const mockProcessedOrders: ProcessedOrder[] = [
    {
      order_id: 'ORD004',
      customer_name: 'Sarah Williams',
      customer_city: 'Colombo',
      order_date: '2024-01-14',
      total_items: 4,
      total_value: 12000,
      store_name: 'Main Store - Colombo',
      driver_name: 'Kamal Silva',
      assistant_name: 'Nimal Perera',
      truck_license: 'ABC-1234',
      train_schedule: 'Express 10:00 AM',
      delivery_status: 'In Transit',
    },
    {
      order_id: 'ORD005',
      customer_name: 'David Brown',
      customer_city: 'Galle',
      order_date: '2024-01-13',
      total_items: 6,
      total_value: 18500,
      store_name: 'Branch Store - Galle',
      driver_name: 'Saman Fernando',
      assistant_name: 'Ruwan Jayawardena',
      truck_license: 'XYZ-5678',
      train_schedule: 'Morning 08:30 AM',
      delivery_status: 'Out for Delivery',
    },
  ];

  const mockTrainSchedules: TrainSchedule[] = [
    {
      schedule_id: 'TS001',
      train_name: 'Express Train',
      departure_time: '10:00 AM',
      arrival_time: '02:00 PM',
      city: 'Colombo',
    },
    {
      schedule_id: 'TS002',
      train_name: 'Morning Train',
      departure_time: '08:30 AM',
      arrival_time: '12:30 PM',
      city: 'Colombo',
    },
    {
      schedule_id: 'TS003',
      train_name: 'Southern Express',
      departure_time: '09:00 AM',
      arrival_time: '01:30 PM',
      city: 'Galle',
    },
    {
      schedule_id: 'TS004',
      train_name: 'Hill Country Express',
      departure_time: '07:00 AM',
      arrival_time: '11:00 AM',
      city: 'Kandy',
    },
  ];

  const mockStores: Store[] = [
    { store_id: 'ST001', name: 'Main Store - Colombo', city: 'Colombo', address: '123 Main St' },
    { store_id: 'ST002', name: 'Branch Store - Galle', city: 'Galle', address: '456 Beach Rd' },
    { store_id: 'ST003', name: 'Branch Store - Kandy', city: 'Kandy', address: '789 Hill St' },
  ];

  const mockDrivers: Driver[] = [
    { driver_id: 'D001', name: 'Kamal Silva', store_id: 'ST001', hours_this_week: 32 },
    { driver_id: 'D002', name: 'Saman Fernando', store_id: 'ST002', hours_this_week: 28 },
    { driver_id: 'D003', name: 'Pradeep Kumara', store_id: 'ST003', hours_this_week: 35 },
    { driver_id: 'D004', name: 'Ajith Bandara', store_id: 'ST001', hours_this_week: 30 },
  ];

  const mockAssistants: Assistant[] = [
    { assistant_id: 'A001', name: 'Nimal Perera', store_id: 'ST001', hours_this_week: 45 },
    { assistant_id: 'A002', name: 'Ruwan Jayawardena', store_id: 'ST002', hours_this_week: 42 },
    { assistant_id: 'A003', name: 'Lasith Malinga', store_id: 'ST003', hours_this_week: 50 },
    { assistant_id: 'A004', name: 'Chaminda Vaas', store_id: 'ST001', hours_this_week: 38 },
  ];

  const mockTrucks: Truck[] = [
    { truck_id: 'T001', license_plate: 'ABC-1234', store_id: 'ST001', status: 'Available' },
    { truck_id: 'T002', license_plate: 'XYZ-5678', store_id: 'ST002', status: 'Available' },
    { truck_id: 'T003', license_plate: 'DEF-9012', store_id: 'ST003', status: 'Available' },
    { truck_id: 'T004', license_plate: 'GHI-3456', store_id: 'ST001', status: 'In Use' },
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      // Replace with actual API calls
      setPendingOrders(mockPendingOrders);
      setProcessedOrders(mockProcessedOrders);
      setTrainSchedules(mockTrainSchedules);
      setStores(mockStores);
      setDrivers(mockDrivers);
      setAssistants(mockAssistants);
      setTrucks(mockTrucks);
    } catch (error) {
      console.error('Failed to load data:', error);
      showToast('Failed to load data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateClick = (order: Order) => {
    setSelectedOrder(order);
    setAllocationForm({
      train_schedule_id: '',
      store_id: '',
      driver_id: '',
      assistant_id: '',
      truck_id: '',
    });
    setShowAllocationDialog(true);
  };

  const handleStoreChange = (storeId: string) => {
    setAllocationForm({
      ...allocationForm,
      store_id: storeId,
      driver_id: '',
      assistant_id: '',
      truck_id: '',
    });
  };

  const handleProcessAllocation = async () => {
    if (!allocationForm.train_schedule_id || !allocationForm.store_id || 
        !allocationForm.driver_id || !allocationForm.assistant_id || !allocationForm.truck_id) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    try {
      // Replace with actual API call
      console.log('Processing allocation:', {
        order_id: selectedOrder?.order_id,
        ...allocationForm,
      });

      showToast('Order allocated successfully!', 'success');
      setShowAllocationDialog(false);
      await loadData();
    } catch (error) {
      console.error('Failed to process allocation:', error);
      showToast('Failed to process allocation', 'error');
    }
  };

  // Filter data based on selections
  const availableTrainSchedules = selectedOrder 
    ? trainSchedules.filter(ts => ts.city === selectedOrder.customer_city)
    : [];

  const availableStores = selectedOrder
    ? stores.filter(s => s.city === selectedOrder.customer_city)
    : [];

  const availableDrivers = allocationForm.store_id
    ? drivers.filter(d => d.store_id === allocationForm.store_id)
    : [];

  const availableAssistants = allocationForm.store_id
    ? assistants.filter(a => a.store_id === allocationForm.store_id)
    : [];

  const availableTrucks = allocationForm.store_id
    ? trucks.filter(t => t.store_id === allocationForm.store_id && t.status === 'Available')
    : [];

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'In Transit': 'bg-blue-100 text-blue-800',
      'Out for Delivery': 'bg-yellow-100 text-yellow-800',
      'Delivered': 'bg-green-100 text-green-800',
    };
    return <Badge className={colors[status] || 'bg-gray-100 text-gray-800'}>{status}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Order Allocations</h2>
        <p className="text-muted-foreground">
          Manage delivery allocations for customer orders
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingOrders.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting allocation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Transit</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedOrders.filter(o => o.delivery_status === 'In Transit').length}
            </div>
            <p className="text-xs text-muted-foreground">On the way</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out for Delivery</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {processedOrders.filter(o => o.delivery_status === 'Out for Delivery').length}
            </div>
            <p className="text-xs text-muted-foreground">Being delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              Rs {pendingOrders.reduce((sum, o) => sum + o.total_value, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Pending orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Pending Orders</CardTitle>
          <CardDescription>Orders awaiting delivery allocation</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">City</th>
                  <th className="text-left p-4 font-medium">Order Date</th>
                  <th className="text-left p-4 font-medium">Items</th>
                  <th className="text-left p-4 font-medium">Total Value</th>
                  <th className="text-right p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {pendingOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No pending orders
                    </td>
                  </tr>
                ) : (
                  pendingOrders.map((order) => (
                    <tr key={order.order_id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{order.order_id}</td>
                      <td className="p-4">{order.customer_name}</td>
                      <td className="p-4">{order.customer_city}</td>
                      <td className="p-4">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="p-4">{order.total_items}</td>
                      <td className="p-4">Rs {order.total_value.toLocaleString()}</td>
                      <td className="p-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAllocateClick(order)}
                        >
                          Allocate
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Processed Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Processed Orders</CardTitle>
          <CardDescription>Orders that have been allocated but not yet delivered</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Order ID</th>
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">Store</th>
                  <th className="text-left p-4 font-medium">Driver</th>
                  <th className="text-left p-4 font-medium">Truck</th>
                  <th className="text-left p-4 font-medium">Train Schedule</th>
                  <th className="text-left p-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No processed orders
                    </td>
                  </tr>
                ) : (
                  processedOrders.map((order) => (
                    <tr key={order.order_id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{order.order_id}</td>
                      <td className="p-4">{order.customer_name}</td>
                      <td className="p-4">{order.store_name}</td>
                      <td className="p-4">{order.driver_name}</td>
                      <td className="p-4">{order.truck_license}</td>
                      <td className="p-4">{order.train_schedule}</td>
                      <td className="p-4">{getStatusBadge(order.delivery_status)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Allocation Dialog */}
      <Dialog open={showAllocationDialog} onOpenChange={setShowAllocationDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Allocate Delivery</DialogTitle>
            <DialogDescription>
              Assign train schedule, store, driver, assistant, and truck for order {selectedOrder?.order_id}
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              {/* Order Details */}
              <div className="rounded-lg border p-4 bg-muted/50">
                <h4 className="font-semibold mb-2">Order Details</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Customer:</span>{' '}
                    <span className="font-medium">{selectedOrder.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>{' '}
                    <span className="font-medium">{selectedOrder.customer_city}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Items:</span>{' '}
                    <span className="font-medium">{selectedOrder.total_items}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Value:</span>{' '}
                    <span className="font-medium">Rs {selectedOrder.total_value.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Train Schedule Selection */}
              <div className="space-y-2">
                <Label htmlFor="train_schedule">
                  <Calendar className="inline h-4 w-4 mr-2" />
                  Train Schedule
                </Label>
                <Select
                  value={allocationForm.train_schedule_id}
                  onValueChange={(value) =>
                    setAllocationForm({ ...allocationForm, train_schedule_id: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select train schedule" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTrainSchedules.map((schedule) => (
                      <SelectItem key={schedule.schedule_id} value={schedule.schedule_id}>
                        {schedule.train_name} - Departs: {schedule.departure_time}, Arrives: {schedule.arrival_time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Store Selection */}
              <div className="space-y-2">
                <Label htmlFor="store">
                  <Package className="inline h-4 w-4 mr-2" />
                  Delivery Store
                </Label>
                <Select
                  value={allocationForm.store_id}
                  onValueChange={handleStoreChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select store" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStores.map((store) => (
                      <SelectItem key={store.store_id} value={store.store_id}>
                        {store.name} - {store.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Driver Selection */}
              <div className="space-y-2">
                <Label htmlFor="driver">
                  <Users className="inline h-4 w-4 mr-2" />
                  Driver
                </Label>
                <Select
                  value={allocationForm.driver_id}
                  onValueChange={(value) =>
                    setAllocationForm({ ...allocationForm, driver_id: value })
                  }
                  disabled={!allocationForm.store_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!allocationForm.store_id ? "Select store first" : "Select driver"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.driver_id} value={driver.driver_id}>
                        {driver.name} ({driver.hours_this_week}h / 40h this week)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Assistant Selection */}
              <div className="space-y-2">
                <Label htmlFor="assistant">
                  <Users className="inline h-4 w-4 mr-2" />
                  Assistant
                </Label>
                <Select
                  value={allocationForm.assistant_id}
                  onValueChange={(value) =>
                    setAllocationForm({ ...allocationForm, assistant_id: value })
                  }
                  disabled={!allocationForm.store_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!allocationForm.store_id ? "Select store first" : "Select assistant"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableAssistants.map((assistant) => (
                      <SelectItem key={assistant.assistant_id} value={assistant.assistant_id}>
                        {assistant.name} ({assistant.hours_this_week}h / 60h this week)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Truck Selection */}
              <div className="space-y-2">
                <Label htmlFor="truck">
                  <Truck className="inline h-4 w-4 mr-2" />
                  Truck
                </Label>
                <Select
                  value={allocationForm.truck_id}
                  onValueChange={(value) =>
                    setAllocationForm({ ...allocationForm, truck_id: value })
                  }
                  disabled={!allocationForm.store_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!allocationForm.store_id ? "Select store first" : "Select truck"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTrucks.map((truck) => (
                      <SelectItem key={truck.truck_id} value={truck.truck_id}>
                        {truck.license_plate} ({truck.status})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAllocationDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleProcessAllocation}>
              Process Allocation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderAllocations;