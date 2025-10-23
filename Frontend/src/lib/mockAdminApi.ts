// Mock API for admin reports with sample data

// Types for admin reports
export interface QuarterlySalesData {
  quarter: string;
  value: number;
  volume: number;
  growth: number;
}

export interface MostOrderedItem {
  id: string;
  name: string;
  unitsSold: number;
  percentageOfTotal: number;
  revenue: number;
}

export interface CityRouteData {
  city: string;
  route: string;
  orders: number;
  value: number;
  volume: number;
}

export interface DriverHoursData {
  name: string;
  role: 'Driver' | 'Assistant';
  week: string;
  hours: number;
  status: 'OK' | 'Exceeded';
}

export interface TruckUsageData {
  truckId: string;
  totalDeliveries: number;
  status: "In Use" | "Idle" | "Maintenance";
  licensePlate: string;
  inProgressDeliveries: number;
  completedDeliveries: number;
  capacity: number;
}

export interface CustomerOrderHistoryItem {
  orderId: string;
  date: string;
  customer: string;
  items: number;
  total: number;
  status: string;
  deliveryCity: string;
  route: string;
  railTrip?: string;
  store?: string;
  truck?: string;
  driver?: string;
  assistant?: string;
}

export interface KPIData {
  totalSales: number;
  ordersProcessed: number;
  activeRoutes: number;
  onTimeDeliveries: number;
}

// Mock data
const mockQuarterlySales: QuarterlySalesData[] = [
  { quarter: '2024 Q1', value: 12500000, volume: 2450, growth: 8.5 },
  { quarter: '2024 Q2', value: 13200000, volume: 2680, growth: 5.6 },
  { quarter: '2024 Q3', value: 14100000, volume: 2890, growth: 6.8 },
  { quarter: '2024 Q4', value: 15300000, volume: 3120, growth: 8.5 },
];

const mockMostOrdered: MostOrderedItem[] = [
  { id: '1', name: 'Premium Laundry Detergent', unitsSold: 1250, percentageOfTotal: 15.2, revenue: 2250000 },
  { id: '2', name: 'Antibacterial Hand Soap', unitsSold: 980, percentageOfTotal: 11.9, revenue: 1470000 },
  { id: '3', name: 'Fabric Softener', unitsSold: 845, percentageOfTotal: 10.3, revenue: 1690000 },
  { id: '4', name: 'Body Wash', unitsSold: 720, percentageOfTotal: 8.8, revenue: 2160000 },
  { id: '5', name: 'Dishwashing Liquid', unitsSold: 650, percentageOfTotal: 7.9, revenue: 1300000 },
  { id: '6', name: 'All-Purpose Cleaner', unitsSold: 590, percentageOfTotal: 7.2, revenue: 1770000 },
  { id: '7', name: 'Shampoo', unitsSold: 540, percentageOfTotal: 6.6, revenue: 1620000 },
  { id: '8', name: 'Stain Remover', unitsSold: 480, percentageOfTotal: 5.8, revenue: 960000 },
  { id: '9', name: 'Toilet Paper', unitsSold: 420, percentageOfTotal: 5.1, revenue: 1680000 },
  { id: '10', name: 'Premium Facial Tissue', unitsSold: 380, percentageOfTotal: 4.6, revenue: 1520000 },
];

const mockCityRouteData: CityRouteData[] = [
  { city: 'Colombo', route: 'COL-01', orders: 450, value: 6750000, volume: 1240 },
  { city: 'Colombo', route: 'COL-02', orders: 380, value: 5700000, volume: 1050 },
  { city: 'Negombo', route: 'NEG-01', orders: 290, value: 4350000, volume: 780 },
  { city: 'Galle', route: 'GAL-01', orders: 220, value: 3300000, volume: 620 },
  { city: 'Matara', route: 'MAT-01', orders: 180, value: 2700000, volume: 510 },
  { city: 'Jaffna', route: 'JAF-01', orders: 160, value: 2400000, volume: 450 },
  { city: 'Trincomalee', route: 'TRI-01', orders: 140, value: 2100000, volume: 390 },
];

const mockDriverHours: DriverHoursData[] = [
  { name: 'David Wilson', role: 'Driver', week: '2024-W10', hours: 42, status: 'Exceeded' },
  { name: 'A. Perera', role: 'Assistant', week: '2024-W10', hours: 38, status: 'OK' },
  { name: 'S. Fernando', role: 'Driver', week: '2024-W10', hours: 35, status: 'OK' },
  { name: 'R. Jayawardena', role: 'Assistant', week: '2024-W10', hours: 65, status: 'Exceeded' },
  { name: 'K. Bandara', role: 'Driver', week: '2024-W10', hours: 40, status: 'OK' },
  { name: 'M. Wickramasinghe', role: 'Assistant', week: '2024-W10', hours: 45, status: 'OK' },
];

const mockTruckUsage: TruckUsageData[] = [
  { truckId: 'KP-001', trips: 85, hours: 168, utilization: 78.5 },
  { truckId: 'KP-002', trips: 72, hours: 142, utilization: 66.4 },
  { truckId: 'KP-003', trips: 90, hours: 175, utilization: 81.8 },
  { truckId: 'KP-004', trips: 67, hours: 134, utilization: 62.6 },
  { truckId: 'KP-005', trips: 78, hours: 156, utilization: 72.9 },
];

const mockCustomerHistory: CustomerOrderHistoryItem[] = [
  {
    orderId: 'ORD-2024-001',
    date: '2024-03-15',
    customer: 'customer@kandypack.lk',
    items: 5,
    total: 12500,
    status: 'Delivered',
    deliveryCity: 'Colombo',
    route: 'COL-01',
    railTrip: 'TR-1001',
    store: 'Pettah Central Store',
    truck: 'KP-001',
    driver: 'David Wilson',
    assistant: 'A. Perera'
  },
  {
    orderId: 'ORD-2024-002',
    date: '2024-03-14',
    customer: 'john.doe@example.com',
    items: 3,
    total: 8750,
    status: 'In Transit',
    deliveryCity: 'Negombo',
    route: 'NEG-01',
    railTrip: 'TR-1002',
    store: 'Negombo Station Store',
    truck: 'KP-002',
    driver: 'S. Fernando',
    assistant: 'R. Jayawardena'
  },
];

const mockKPIs: KPIData = {
  totalSales: 15300000,
  ordersProcessed: 1820,
  activeRoutes: 7,
  onTimeDeliveries: 94.5
};

const mockRecentActivity = [
  'Order #ORD-2024-156 delivered in Colombo',
  'Driver David Wilson reached 42 hrs this week',
  'Truck KP-003 completed maintenance check',
  'New route JAF-02 activated for Jaffna',
  'Customer complaint resolved for Order #ORD-2024-145'
];

// Simulate network delay and errors
const simulateDelay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 500 + 400));
const simulateNetworkError = () => {
  if (Math.random() < 0.05) {
    throw new Error('Network error occurred. Please try again.');
  }
};

// API functions
export const fetchKPIs = async (): Promise<KPIData> => {
  await simulateDelay();
  simulateNetworkError();
  return mockKPIs;
};

export const fetchRecentActivity = async (): Promise<string[]> => {
  await simulateDelay();
  simulateNetworkError();
  return mockRecentActivity;
};

export const fetchQuarterlySales = async (year: number = 2024): Promise<QuarterlySalesData[]> => {
  await simulateDelay();
  simulateNetworkError();
  return mockQuarterlySales;
};

export const fetchMostOrdered = async (quarter: string = '2024 Q4'): Promise<MostOrderedItem[]> => {
  await simulateDelay();
  simulateNetworkError();
  return mockMostOrdered;
};

export const fetchCityRouteData = async (quarter: string = '2024 Q4'): Promise<CityRouteData[]> => {
  await simulateDelay();
  simulateNetworkError();
  return mockCityRouteData;
};

export const fetchDriverHours = async (week: string = '2024-W10'): Promise<DriverHoursData[]> => {
  await simulateDelay();
  simulateNetworkError();
  return mockDriverHours;
};

export const fetchTruckUsage = async (month: string = '2024-03'): Promise<TruckUsageData[]> => {
  await simulateDelay();
  simulateNetworkError();
  return mockTruckUsage;
};

export const fetchCustomerHistory = async (search?: string): Promise<CustomerOrderHistoryItem[]> => {
  await simulateDelay();
  simulateNetworkError();
  
  if (search) {
    return mockCustomerHistory.filter(order => 
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.orderId.toLowerCase().includes(search.toLowerCase())
    );
  }
  
  return mockCustomerHistory;
};