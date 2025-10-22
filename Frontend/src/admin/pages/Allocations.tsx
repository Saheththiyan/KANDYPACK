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
import { useToast } from '@/hooks/use-toast';
import { API_URL } from "../../lib/config";
import { getAuthToken } from '@/lib/mockAuth';

interface Order {
  order_id: string;
  name: string;
  city: string;
  order_date: string;
  required_date: string;
  count_product_id: string;
  total_value: number;
  status: string;
  allocation_id?: string;
  store_id?: string;
  departure_city?: string;
  arrival_city?: string;
  schedule_date?: string;
  product_count?: number;
}

interface ProcessedOrder extends Order {
  store: string;
  store_id?: string;
  driver_name: string;
  assistant_name: string;
  license_plate: string;
  train_schedule: string;
  status: string;
  delivery_id?: string;
  route_id?: string;
}

interface TrainSchedule {
  train_schedule_id: string;
  departure_city: string;
  arrival_city: string;
  schedule_date: string;
  departure_time: string;
  arrival_time: string;
  capacity: number;
}

interface Store {
  store_id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
}

interface Driver {
  driver_id: string;
  name: string;
  license_no: string;
  weekly_hours: number;
  status: string;
  store_id: string;
}

interface Assistant {
  assistant_id: string;
  name: string;
  weekly_hours: number;
  status: string;
  store_id: string;
}

interface Truck {
  truck_id: string;
  license_plate: string;
  capacity: number;
  status: string;
  store_id: string;
}

interface Route {
  route_id: string;
  stops: string;
  max_delivery_time: number;
  store_id: string;
}

const OrderAllocations = () => {
  const { toast } = useToast();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [processedOrders, setProcessedOrders] = useState<ProcessedOrder[]>([]);
  const [trainSchedules, setTrainSchedules] = useState<TrainSchedule[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  
  // States for delivery schedule allocation
  const [showDeliveryAllocationDialog, setShowDeliveryAllocationDialog] = useState(false);
  const [selectedDeliverySchedule, setSelectedDeliverySchedule] = useState<ProcessedOrder | null>(null);
  const [availableOrders, setAvailableOrders] = useState<Order[]>([]);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAllocationDialog, setShowAllocationDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  // Pagination state
  const [pendingCurrentPage, setPendingCurrentPage] = useState(1);
  const [processedCurrentPage, setProcessedCurrentPage] = useState(1);
  const [trainCurrentPage, setTrainCurrentPage] = useState(1);
  const [deliveryCurrentPage, setDeliveryCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const [allocationForm, setAllocationForm] = useState({
    train_schedule_id: '',
    store_id: '',
    driver_id: '',
    assistant_id: '',
    truck_id: '',
    route_id: '',
  });

  const auth = getAuthToken();

  async function fetchUnprocessedOrders(): Promise<Order[]> {
    const response = await fetch(`${API_URL}/allocations/unprocessed`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch unprocessed orders");
    }
    return response.json();
  }

  async function fetchTrainSchedulesByCity(city: string): Promise<TrainSchedule[]> {
    const response = await fetch(`${API_URL}/trainSchedule?city=${city}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch train schedules");
    }
    return response.json();
  }

  async function fetchAllTrainSchedules(): Promise<TrainSchedule[]> {
    const response = await fetch(`${API_URL}/trainSchedule`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch train schedules");
    }
    return response.json();
  }

  async function fetchStoresByCity(city: string): Promise<Store[]> {
    const response = await fetch(`${API_URL}/stores?city=${city}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch stores");
    }
    return response.json();
  }

  async function fetchDriversByStore(storeId: string): Promise<Driver[]> {
    const response = await fetch(`${API_URL}/drivers?store_id=${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch drivers");
    }
    return response.json();
  }

  async function fetchAssistantsByStore(storeId: string): Promise<Assistant[]> {
    const response = await fetch(`${API_URL}/assistants?store_id=${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch assistants");
    }
    return response.json();
  }

  async function fetchTrucksByStore(storeId: string): Promise<Truck[]> {
    const response = await fetch(`${API_URL}/trucks?store_id=${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch trucks");
    }
    return response.json();
  }

  async function fetchRoutesByStore(storeId: string): Promise<Route[]> {
    const response = await fetch(`${API_URL}/routes?store_id=${storeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch routes");
    }
    return response.json();
  }

  async function fetchDeliverySchedules(): Promise<any[]> {
    const response = await fetch(`${API_URL}/deliverySchedule`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch delivery schedules");
    }
    return response.json();
  }
  
  async function fetchOrdersByRouteStore(routeId: string): Promise<Order[]> {
    const response = await fetch(`${API_URL}/deliverySchedule/route-orders/${routeId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error("Failed to fetch orders for this route's store");
    }
    return response.json();
  }
  
  async function assignOrdersToDelivery(deliveryId: string, orderIds: string[]) {
    const response = await fetch(`${API_URL}/delivers/assign-orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify({ deliveryId, orderIds }),
    });
    if (!response.ok) {
      throw new Error("Failed to assign orders to delivery");
    }
    return response.json();
  }

  async function fetchOrdersByCity(city: string): Promise<Order[]> {
    const response = await fetch(`${API_URL}/allocations/by-city?city=${encodeURIComponent(city)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
    });
    if (!response.ok) {
      throw new Error('Failed to fetch orders by city');
    }
    return response.json();
  }

  async function createAllocationApi(payload: { train_schedule_id: string; order_id: string; store_id: string; space_consumed?: number }) {
    const response = await fetch(`${API_URL}/allocations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${auth.token}`
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error('Failed to create allocation');
    return response.json();
  }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const orders = await fetchUnprocessedOrders();
      setPendingOrders(orders);
      // load train schedules and delivery schedules
      const [allSchedules, deliverySchedules] = await Promise.all([
        fetchAllTrainSchedules(),
        fetchDeliverySchedules()
      ]);
      setTrainSchedules(allSchedules);
      // deliverySchedules contains joined fields: stops, license_plate, driver_name, assistant_name
      setProcessedOrders([]); // keep processedOrders empty; replaced by delivery schedule table
      // store delivery schedules in state by mapping to ProcessedOrder-like shape for display convenience
      // note: we'll reuse processedOrders state to hold delivery schedule entries for table rendering
      setProcessedOrders(deliverySchedules.map(ds => ({
        order_id: ds.delivery_id,
        delivery_id: ds.delivery_id, // Store the delivery_id separately too
        route_id: ds.route_id,
        store_id: ds.store_id,
        name: ds.stops,
        store: ds.route_id,
        driver_name: ds.driver_name,
        assistant_name: ds.assistant_name,
        license_plate: ds.license_plate,
        train_schedule: ds.delivery_date,
        status: ds.status,
        // keep other fields minimal
        city: '',
        order_date: '',
        required_date: '',
        count_product_id: '',
        total_value: 0
      })));
    } catch (error) {
      console.error('Failed to load data:', error);
      toast({
        title: "Error",
        description: "Failed to load data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleAssignOrders = async () => {
    if (!selectedDeliverySchedule?.delivery_id || selectedOrderIds.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one order to assign",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await assignOrdersToDelivery(selectedDeliverySchedule.delivery_id, selectedOrderIds);
      
      toast({
        title: "Success",
        description: "Orders assigned to delivery successfully"
      });
      
      // Close dialog and reload data
      setShowDeliveryAllocationDialog(false);
      await loadData();
    } catch (error) {
      console.error('Failed to assign orders to delivery:', error);
      toast({
        title: "Error",
        description: "Failed to assign orders to delivery",
        variant: "destructive"
      });
    }
  };

  // Allocate from train schedule modal
  const [showTrainAllocateDialog, setShowTrainAllocateDialog] = useState(false);
  const [selectedTrainSchedule, setSelectedTrainSchedule] = useState<TrainSchedule | null>(null);
  const [ordersForCity, setOrdersForCity] = useState<Order[]>([]);
  const [selectedOrderForTrain, setSelectedOrderForTrain] = useState<string>('');
  const [selectedStoreForTrain, setSelectedStoreForTrain] = useState<string>('');

  const handleAllocateClick = async (order: Order) => {
    setSelectedOrder(order);
    setAllocationForm({
      train_schedule_id: '',
      store_id: '',
      driver_id: '',
      assistant_id: '',
      truck_id: '',
      route_id: '',
    });
    
    // Clear existing data
    setDrivers([]);
    setAssistants([]);
    setTrucks([]);
    setRoutes([]);
    
    try {
      // Fetch train schedules and stores for the order's city
      const [schedules, storesData] = await Promise.all([
        fetchTrainSchedulesByCity(order.city),
        fetchStoresByCity(order.city)
      ]);
      setTrainSchedules(schedules);
      setStores(storesData);
    } catch (error) {
      console.error('Failed to load allocation data:', error);
      toast({
        title: "Error",
        description: "Failed to load train schedules and stores",
        variant: "destructive",
      });
    }
    
    setShowAllocationDialog(true);
  };

  const handleStoreChange = async (storeId: string) => {
    setAllocationForm({
      ...allocationForm,
      store_id: storeId,
      driver_id: '',
      assistant_id: '',
      truck_id: '',
      route_id: '',
    });

    try {
      // Fetch drivers, assistants, trucks, and routes for the selected store
      const [driversData, assistantsData, trucksData, routesData] = await Promise.all([
        fetchDriversByStore(storeId),
        fetchAssistantsByStore(storeId),
        fetchTrucksByStore(storeId),
        fetchRoutesByStore(storeId)
      ]);
      setDrivers(driversData);
      setAssistants(assistantsData);
      setTrucks(trucksData);
      setRoutes(routesData);
    } catch (error) {
      console.error('Failed to load store resources:', error);
      toast({
        title: "Error",
        description: "Failed to load drivers, assistants, trucks, and routes",
        variant: "destructive",
      });
    }
  };
  
  const handleDeliveryAllocationClick = async (delivery: ProcessedOrder) => {
    try {
      setSelectedDeliverySchedule(delivery);
      
      if (!delivery.route_id) {
        toast({
          title: "Error",
          description: "This delivery schedule doesn't have a route assigned",
          variant: "destructive"
        });
        return;
      }
      
      // Fetch orders allocated to this route's store
      const routeOrders = await fetchOrdersByRouteStore(delivery.route_id);
      setAvailableOrders(routeOrders);
      
      // Reset selected orders
      setSelectedOrderIds([]);
      
      // Show dialog
      setShowDeliveryAllocationDialog(true);
    } catch (error) {
      console.error('Failed to load orders for delivery allocation:', error);
      toast({
        title: "Error",
        description: "Failed to load orders for allocation",
        variant: "destructive"
      });
    }
  };

  const handleProcessAllocation = async () => {
    if (!allocationForm.train_schedule_id || !allocationForm.store_id || 
        !allocationForm.driver_id || !allocationForm.assistant_id || 
        !allocationForm.truck_id || !allocationForm.route_id) {
      toast({
        title: "Validation Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      // Replace with actual API call
      console.log('Processing allocation:', {
        order_id: selectedOrder?.order_id,
        ...allocationForm,
      });

      toast({
        title: "Success",
        description: "Order allocated successfully!",
      });
      setShowAllocationDialog(false);
      await loadData();
    } catch (error) {
      console.error('Failed to process allocation:', error);
      toast({
        title: "Error",
        description: "Failed to process allocation",
        variant: "destructive",
      });
    }
  };

  // Filter data based on selections
  const availableTrainSchedules = selectedOrder 
    ? trainSchedules.filter(ts => ts.arrival_city === selectedOrder.city)
    : [];

  const availableStores = selectedOrder
    ? stores.filter(s => s.city === selectedOrder.city)
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

  const availableRoutes = allocationForm.store_id
    ? routes.filter(r => r.store_id === allocationForm.store_id)
    : [];

  // Pagination calculations
  const pendingTotalPages = Math.ceil(pendingOrders.length / ITEMS_PER_PAGE);
  const processedTotalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE);
  
  const paginatedPendingOrders = pendingOrders.slice(
    (pendingCurrentPage - 1) * ITEMS_PER_PAGE,
    pendingCurrentPage * ITEMS_PER_PAGE
  );
  
  const paginatedProcessedOrders = processedOrders.slice(
    (processedCurrentPage - 1) * ITEMS_PER_PAGE,
    processedCurrentPage * ITEMS_PER_PAGE
  );

  const trainTotalPages = Math.ceil(trainSchedules.length / ITEMS_PER_PAGE);
  const deliveryTotalPages = Math.ceil(processedOrders.length / ITEMS_PER_PAGE);

  const paginatedTrainSchedules = trainSchedules.slice(
    (trainCurrentPage - 1) * ITEMS_PER_PAGE,
    trainCurrentPage * ITEMS_PER_PAGE
  );

  const paginatedDeliverySchedules = processedOrders.slice(
    (deliveryCurrentPage - 1) * ITEMS_PER_PAGE,
    deliveryCurrentPage * ITEMS_PER_PAGE
  );

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
              {processedOrders.filter(o => o.status === 'In Transit').length}
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
              {processedOrders.filter(o => o.status === 'Out for Delivery').length}
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
              Rs {pendingOrders.reduce((sum, o) => sum + Number(o.total_value), 0).toLocaleString()}
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
                  <th className="text-left p-4 font-medium">Customer</th>
                  <th className="text-left p-4 font-medium">City</th>
                  <th className="text-left p-4 font-medium">Order Date</th>
                  <th className="text-left p-4 font-medium">Required Date</th>
                  <th className="text-left p-4 font-medium">No. Products</th>
                  <th className="text-left p-4 font-medium">Total Value</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  {/* <th className="text-right p-4 font-medium">Action</th> */}
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
                  paginatedPendingOrders.map((order) => (
                    <tr key={order.order_id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{order.name}</td>
                      <td className="p-4">{order.city}</td>
                      <td className="p-4">{new Date(order.order_date).toLocaleDateString()}</td>
                      <td className="p-4">{order.required_date ? new Date(order.required_date).toLocaleDateString() : 'N/A'}</td>
                      <td className="p-4">{order.count_product_id}</td>
                      <td className="p-4">Rs {order.total_value.toLocaleString()}</td>
                      <td className="p-4">{order.status}</td>
                      {/* <td className="p-4 text-right">
                        <Button
                          size="sm"
                          onClick={() => handleAllocateClick(order)}
                        >
                          Allocate
                        </Button>
                      </td> */}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pending Orders Pagination */}
          {pendingOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((pendingCurrentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(pendingCurrentPage * ITEMS_PER_PAGE, pendingOrders.length)} of {pendingOrders.length} orders
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={pendingCurrentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: pendingTotalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === pendingCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPendingCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPendingCurrentPage(prev => Math.min(pendingTotalPages, prev + 1))}
                  disabled={pendingCurrentPage === pendingTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Train Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Train Schedules</CardTitle>
          <CardDescription>Upcoming train schedules</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Scheduled Date</th>
                  <th className="text-left p-4 font-medium">Departure City</th>
                  <th className="text-left p-4 font-medium">Arrival City</th>
                  <th className="text-left p-4 font-medium">Departure Time</th>
                  <th className="text-left p-4 font-medium">Arrival Time</th>
                  <th className="text-left p-4 font-medium">Capacity</th>
                  <th className="text-left p-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {trainSchedules.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-muted-foreground">
                      No train schedules
                    </td>
                  </tr>
                ) : (
                  paginatedTrainSchedules.map((ts) => (
                    <tr key={ts.train_schedule_id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{new Date(ts.schedule_date).toLocaleDateString()}</td>
                      <td className="p-4">{ts.departure_city}</td>
                      <td className="p-4">{ts.arrival_city}</td>
                      <td className="p-4">{ts.departure_time}</td>
                      <td className="p-4">{ts.arrival_time}</td>
                      <td className="p-4">{ts.capacity}</td>
                      <td className="p-4 text-right">
                        <Button size="sm" onClick={async () => {
                          setSelectedTrainSchedule(ts);
                          try {
                            // fetch orders for the arrival city and ensure stores are loaded
                            const [ordersRes, storesRes] = await Promise.all([
                              fetchOrdersByCity(ts.arrival_city),
                              fetchStoresByCity(ts.arrival_city)
                            ]);
                            setOrdersForCity(ordersRes);
                            // merge stores into existing stores state (avoid duplicates)
                            setStores(prev => {
                              const merged = [...prev];
                              storesRes.forEach(s => { if (!merged.find(m=>m.store_id===s.store_id)) merged.push(s); });
                              return merged;
                            });
                            setShowTrainAllocateDialog(true);
                          } catch (err) {
                            console.error(err);
                            toast({ title: 'Error', description: 'Failed to load orders or stores', variant: 'destructive' });
                          }
                        }}>
                          Allocate
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Train schedule pagination */}
          {trainSchedules.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((trainCurrentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(trainCurrentPage * ITEMS_PER_PAGE, trainSchedules.length)} of {trainSchedules.length} schedules
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrainCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={trainCurrentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: trainTotalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === trainCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setTrainCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTrainCurrentPage(prev => Math.min(trainTotalPages, prev + 1))}
                  disabled={trainCurrentPage === trainTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Train Allocate Dialog */}
      <Dialog open={showTrainAllocateDialog} onOpenChange={setShowTrainAllocateDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Allocate Orders to Train</DialogTitle>
            <DialogDescription>
              Assign an order and delivery store for train {selectedTrainSchedule?.train_schedule_id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Train</Label>
              <div className="text-sm">{selectedTrainSchedule ? `${selectedTrainSchedule.departure_city} → ${selectedTrainSchedule.arrival_city} on ${new Date(selectedTrainSchedule.schedule_date).toLocaleDateString()}` : 'No train selected'}</div>
            </div>

            <div>
              <Label>Order (from same arrival city)</Label>
              <Select value={selectedOrderForTrain} onValueChange={(v) => setSelectedOrderForTrain(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {ordersForCity.map(o => (
                    <SelectItem key={o.order_id} value={o.order_id}>{o.name} - Rs {o.total_value}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Store (from arrival city)</Label>
              <Select value={selectedStoreForTrain} onValueChange={(v) => setSelectedStoreForTrain(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select store" />
                </SelectTrigger>
                <SelectContent>
                  {stores.filter(s => s.city === (selectedTrainSchedule?.arrival_city || '')).map(st => (
                    <SelectItem key={st.store_id} value={st.store_id}>{st.name} - {st.address}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTrainAllocateDialog(false)}>Cancel</Button>
            <Button onClick={async () => {
              try {
                if (!selectedTrainSchedule || !selectedOrderForTrain || !selectedStoreForTrain) {
                  toast({ title: 'Validation Error', description: 'Please select order and store', variant: 'destructive' });
                  return;
                }
                await createAllocationApi({ train_schedule_id: selectedTrainSchedule.train_schedule_id, order_id: selectedOrderForTrain, store_id: selectedStoreForTrain });
                toast({ title: 'Success', description: 'Allocation created' });
                setShowTrainAllocateDialog(false);
                // reload data
                await loadData();
              } catch (err) {
                console.error(err);
                toast({ title: 'Error', description: 'Failed to create allocation', variant: 'destructive' });
              }
            }}>
              Allocate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Schedule Table */}
      <Card>
        <CardHeader>
          <CardTitle>Delivery Schedules</CardTitle>
          <CardDescription>Scheduled deliveries with route, truck and staff</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr className="border-b">
                  <th className="text-left p-4 font-medium">Route (Stops)</th>
                  <th className="text-left p-4 font-medium">Truck</th>
                  <th className="text-left p-4 font-medium">Driver</th>
                  <th className="text-left p-4 font-medium">Assistant</th>
                  <th className="text-left p-4 font-medium">Delivery Date</th>
                  <th className="text-left p-4 font-medium">Status</th>
                  <th className="text-left p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {processedOrders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-muted-foreground">
                      No delivery schedules
                    </td>
                  </tr>
                ) : (
                  paginatedDeliverySchedules.map((ds) => (
                    <tr key={ds.order_id} className="border-b hover:bg-muted/50">
                      <td className="p-4">{ds.name}</td>
                      <td className="p-4">{ds.license_plate}</td>
                      <td className="p-4">{ds.driver_name}</td>
                      <td className="p-4">{ds.assistant_name}</td>
                      <td className="p-4">{new Date(ds.train_schedule).toLocaleDateString()}</td>
                      <td className="p-4">{getStatusBadge(ds.status)}</td>
                      <td className="p-4">
                        <Button 
                          variant="secondary" 
                          onClick={() => handleDeliveryAllocationClick(ds)}
                          disabled={ds.status !== 'Scheduled'}
                        >
                          Allocate Orders
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Delivery schedule pagination */}
          {processedOrders.length > 0 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-muted-foreground">
                Showing {((deliveryCurrentPage - 1) * ITEMS_PER_PAGE) + 1} to {Math.min(deliveryCurrentPage * ITEMS_PER_PAGE, processedOrders.length)} of {processedOrders.length} schedules
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeliveryCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={deliveryCurrentPage === 1}
                >
                  Previous
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: deliveryTotalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={page === deliveryCurrentPage ? "default" : "outline"}
                      size="sm"
                      onClick={() => setDeliveryCurrentPage(page)}
                      className="w-10"
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDeliveryCurrentPage(prev => Math.min(deliveryTotalPages, prev + 1))}
                  disabled={deliveryCurrentPage === deliveryTotalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
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
                    <span className="text-muted-foreground">Order ID:</span>{' '}
                    <span className="font-medium">{selectedOrder.order_id}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Customer:</span>{' '}
                    <span className="font-medium">{selectedOrder.name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">City:</span>{' '}
                    <span className="font-medium">{selectedOrder.city}</span>
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
                      <SelectItem key={schedule.train_schedule_id} value={schedule.train_schedule_id}>
                        {schedule.departure_city} to {schedule.arrival_city} - Departs: {schedule.departure_time}, Arrives: {schedule.arrival_time}
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
                        {driver.name}
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
                        {assistant.name}
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

              {/* Route Selection */}
              <div className="space-y-2">
                <Label htmlFor="route">
                  <Package className="inline h-4 w-4 mr-2" />
                  Route
                </Label>
                <Select
                  value={allocationForm.route_id}
                  onValueChange={(value) =>
                    setAllocationForm({ ...allocationForm, route_id: value })
                  }
                  disabled={!allocationForm.store_id}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={!allocationForm.store_id ? "Select store first" : "Select route"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoutes.map((route) => (
                      <SelectItem key={route.route_id} value={route.route_id}>
                        {route.stops}
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
      
      {/* Delivery Order Allocation Dialog */}
      <Dialog open={showDeliveryAllocationDialog} onOpenChange={setShowDeliveryAllocationDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Allocate Orders to Delivery</DialogTitle>
            <DialogDescription>
              Select orders to assign to this delivery route
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-md">
              <h3 className="font-medium mb-1">Delivery Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Route:</p>
                  <p>{selectedDeliverySchedule?.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Driver:</p>
                  <p>{selectedDeliverySchedule?.driver_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Assistant:</p>
                  <p>{selectedDeliverySchedule?.assistant_name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Truck:</p>
                  <p>{selectedDeliverySchedule?.license_plate}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Delivery Date:</p>
                  <p>{selectedDeliverySchedule?.train_schedule ? new Date(selectedDeliverySchedule.train_schedule).toLocaleDateString() : ''}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">Available Orders</h3>
              <div className="rounded-md border max-h-[400px] overflow-auto">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Select</th>
                      <th className="text-left p-3 font-medium">Order ID</th>
                      <th className="text-left p-3 font-medium">Customer</th>
                      <th className="text-left p-3 font-medium">City</th>
                      <th className="text-left p-3 font-medium">Products</th>
                      <th className="text-left p-3 font-medium">Value</th>
                      <th className="text-left p-3 font-medium">Required Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {availableOrders.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-muted-foreground">
                          No orders available for this delivery route
                        </td>
                      </tr>
                    ) : (
                      availableOrders.map((order) => (
                        <tr 
                          key={order.order_id} 
                          className="border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => {
                            if (selectedOrderIds.includes(order.order_id)) {
                              setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.order_id));
                            } else {
                              setSelectedOrderIds([...selectedOrderIds, order.order_id]);
                            }
                          }}
                        >
                          <td className="p-3">
                            <input 
                              type="checkbox" 
                              checked={selectedOrderIds.includes(order.order_id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedOrderIds([...selectedOrderIds, order.order_id]);
                                } else {
                                  setSelectedOrderIds(selectedOrderIds.filter(id => id !== order.order_id));
                                }
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="rounded"
                            />
                          </td>
                          <td className="p-3">{order.order_id}</td>
                          <td className="p-3">{order.name}</td>
                          <td className="p-3">{order.city}</td>
                          <td className="p-3">{order.product_count}</td>
                          <td className="p-3">Rs. {typeof order.total_value === 'number' ? order.total_value.toFixed(2) : Number(order.total_value).toFixed(2)}</td>
                          <td className="p-3">{new Date(order.required_date).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-sm text-muted-foreground">
                {selectedOrderIds.length} orders selected
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeliveryAllocationDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignOrders}
              disabled={selectedOrderIds.length === 0}
            >
              Assign Orders
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderAllocations;
