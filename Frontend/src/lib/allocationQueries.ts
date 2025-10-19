import { getDatabase } from './db';

export interface Driver {
  driver_id: string;
  name: string;
  hours_this_week: number;
}

export interface Assistant {
  assistant_id: string;
  name: string;
  hours_this_week: number;
}

export interface Truck {
  truck_id: string;
  license_plate: string;
  status: 'Available' | 'In Use' | 'Maintenance';
}

export interface Route {
  route_id: string;
  name: string;
  city: string;
  estimated_hours: number;
}

export interface Allocation {
  allocation_id: string;
  route_id: string;
  truck_id: string;
  driver_id: string;
  assistant_id: string;
  delivery_date: string;
  delivery_hours: number;
  status: 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled';
  route_name?: string;
  city?: string;
  truck_license?: string;
  driver_name?: string;
  assistant_name?: string;
}

// Driver functions
export const getAllDrivers = (): Driver[] => {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM Driver ORDER BY name');
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    driver_id: row[0] as string,
    name: row[1] as string,
    hours_this_week: row[2] as number,
  }));
};

export const getDriverById = (driverId: string): Driver | null => {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM Driver WHERE driver_id = ?', [driverId]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  return {
    driver_id: row[0] as string,
    name: row[1] as string,
    hours_this_week: row[2] as number,
  };
};

// Assistant functions
export const getAllAssistants = (): Assistant[] => {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM Assistant ORDER BY name');
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    assistant_id: row[0] as string,
    name: row[1] as string,
    hours_this_week: row[2] as number,
  }));
};

export const getAssistantById = (assistantId: string): Assistant | null => {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM Assistant WHERE assistant_id = ?', [assistantId]);
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const row = result[0].values[0];
  return {
    assistant_id: row[0] as string,
    name: row[1] as string,
    hours_this_week: row[2] as number,
  };
};

// Truck functions
export const getAllTrucks = (): Truck[] => {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM Truck ORDER BY truck_id');
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    truck_id: row[0] as string,
    license_plate: row[1] as string,
    status: row[2] as 'Available' | 'In Use' | 'Maintenance',
  }));
};

// Route functions
export const getAllRoutes = (): Route[] => {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM Route ORDER BY name');
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    route_id: row[0] as string,
    name: row[1] as string,
    city: row[2] as string,
    estimated_hours: row[3] as number,
  }));
};

// Allocation functions
export const getAllAllocations = (): Allocation[] => {
  const db = getDatabase();
  const result = db.exec(`
    SELECT 
      a.allocation_id, a.route_id, a.truck_id, a.driver_id, a.assistant_id,
      a.delivery_date, a.delivery_hours, a.status,
      r.name as route_name, r.city,
      t.license_plate as truck_license,
      d.name as driver_name,
      ast.name as assistant_name
    FROM Allocation a
    JOIN Route r ON a.route_id = r.route_id
    JOIN Truck t ON a.truck_id = t.truck_id
    JOIN Driver d ON a.driver_id = d.driver_id
    JOIN Assistant ast ON a.assistant_id = ast.assistant_id
    ORDER BY a.delivery_date DESC
  `);
  
  if (result.length === 0) return [];
  
  return result[0].values.map(row => ({
    allocation_id: row[0] as string,
    route_id: row[1] as string,
    truck_id: row[2] as string,
    driver_id: row[3] as string,
    assistant_id: row[4] as string,
    delivery_date: row[5] as string,
    delivery_hours: row[6] as number,
    status: row[7] as 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled',
    route_name: row[8] as string,
    city: row[9] as string,
    truck_license: row[10] as string,
    driver_name: row[11] as string,
    assistant_name: row[12] as string,
  }));
};

export const addAllocation = (allocation: Omit<Allocation, 'allocation_id' | 'route_name' | 'city' | 'truck_license' | 'driver_name' | 'assistant_name'>): string => {
  const db = getDatabase();
  const allocationId = `al${Date.now()}`;
  
  db.run(
    'INSERT INTO Allocation (allocation_id, route_id, truck_id, driver_id, assistant_id, delivery_date, delivery_hours, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    [allocationId, allocation.route_id, allocation.truck_id, allocation.driver_id, allocation.assistant_id, allocation.delivery_date, allocation.delivery_hours, allocation.status]
  );
  
  // Update driver and assistant hours
  db.run('UPDATE Driver SET hours_this_week = hours_this_week + ? WHERE driver_id = ?', [allocation.delivery_hours, allocation.driver_id]);
  db.run('UPDATE Assistant SET hours_this_week = hours_this_week + ? WHERE assistant_id = ?', [allocation.delivery_hours, allocation.assistant_id]);
  
  return allocationId;
};

export const deleteAllocation = (allocationId: string): void => {
  const db = getDatabase();
  
  // Get allocation details to reverse hour updates
  const result = db.exec('SELECT driver_id, assistant_id, delivery_hours FROM Allocation WHERE allocation_id = ?', [allocationId]);
  
  if (result.length > 0 && result[0].values.length > 0) {
    const [driverId, assistantId, hours] = result[0].values[0];
    
    // Reverse the hour updates
    db.run('UPDATE Driver SET hours_this_week = hours_this_week - ? WHERE driver_id = ?', [hours, driverId]);
    db.run('UPDATE Assistant SET hours_this_week = hours_this_week - ? WHERE assistant_id = ?', [hours, assistantId]);
  }
  
  db.run('DELETE FROM Allocation WHERE allocation_id = ?', [allocationId]);
};

// Validation functions
export interface ValidationError {
  field: string;
  message: string;
}

export const validateAllocation = (
  driverId: string,
  assistantId: string,
  deliveryDate: string,
  deliveryHours: number
): ValidationError[] => {
  const errors: ValidationError[] = [];
  const db = getDatabase();
  
  // Check driver consecutive deliveries
  const driverLastDelivery = db.exec(`
    SELECT delivery_date 
    FROM Allocation 
    WHERE driver_id = ? AND status != 'Cancelled'
    ORDER BY delivery_date DESC 
    LIMIT 1
  `, [driverId]);
  
  if (driverLastDelivery.length > 0 && driverLastDelivery[0].values.length > 0) {
    const lastDate = new Date(driverLastDelivery[0].values[0][0] as string);
    const newDate = new Date(deliveryDate);
    const daysDiff = Math.floor((newDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 1) {
      errors.push({
        field: 'driver_id',
        message: 'Driver cannot be scheduled for consecutive deliveries',
      });
    }
  }
  
  // Check assistant consecutive routes (max 2)
  const assistantRecentRoutes = db.exec(`
    SELECT delivery_date 
    FROM Allocation 
    WHERE assistant_id = ? AND status != 'Cancelled'
    ORDER BY delivery_date DESC 
    LIMIT 2
  `, [assistantId]);
  
  if (assistantRecentRoutes.length > 0 && assistantRecentRoutes[0].values.length >= 2) {
    const dates = assistantRecentRoutes[0].values.map(row => new Date(row[0] as string));
    const newDate = new Date(deliveryDate);
    
    // Check if new delivery would be consecutive with the last 2
    const isConsecutive = dates.every((date, idx) => {
      if (idx === 0) {
        return Math.abs((newDate.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)) <= 1;
      }
      return true;
    });
    
    if (isConsecutive) {
      errors.push({
        field: 'assistant_id',
        message: 'Assistant already scheduled for 2 consecutive routes',
      });
    }
  }
  
  // Check driver weekly hours (40 hour limit)
  const driver = getDriverById(driverId);
  if (driver && driver.hours_this_week + deliveryHours > 40) {
    errors.push({
      field: 'driver_id',
      message: `Driver would exceed weekly limit (${driver.hours_this_week + deliveryHours}/40 hours)`,
    });
  }
  
  // Check assistant weekly hours (60 hour limit)
  const assistant = getAssistantById(assistantId);
  if (assistant && assistant.hours_this_week + deliveryHours > 60) {
    errors.push({
      field: 'assistant_id',
      message: `Assistant would exceed weekly limit (${assistant.hours_this_week + deliveryHours}/60 hours)`,
    });
  }
  
  return errors;
};