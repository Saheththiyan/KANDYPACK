import { getDatabase } from './db';

export interface Customer {
  customer_id: string;
  name: string;
  type: 'Retail' | 'Wholesale' | 'Corporate';
  address: string;
  city: string;
  phone: string;
  email: string;
}

// Get all customers
export const getAllCustomers = (): Customer[] => {
  const db = getDatabase();
  const result = db.exec('SELECT * FROM Customer ORDER BY name');
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map(row => {
    const customer: any = {};
    columns.forEach((col, idx) => {
      customer[col] = row[idx];
    });
    return customer as Customer;
  });
};

// Get customer by ID
export const getCustomerById = (customerId: string): Customer | null => {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM Customer WHERE customer_id = ?',
    [customerId]
  );
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const row = result[0].values[0];
  
  const customer: any = {};
  columns.forEach((col, idx) => {
    customer[col] = row[idx];
  });
  
  return customer as Customer;
};

// Add new customer
export const addCustomer = (customer: Omit<Customer, 'customer_id'>): string => {
  const db = getDatabase();
  const customerId = `c${Date.now()}`;
  
  db.run(
    `INSERT INTO Customer (customer_id, name, type, address, city, phone, email) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [customerId, customer.name, customer.type, customer.address, customer.city, customer.phone, customer.email]
  );
  
  return customerId;
};

// Update customer
export const updateCustomer = (customerId: string, customer: Omit<Customer, 'customer_id'>): void => {
  const db = getDatabase();
  
  db.run(
    `UPDATE Customer 
     SET name = ?, type = ?, address = ?, city = ?, phone = ?, email = ?
     WHERE customer_id = ?`,
    [customer.name, customer.type, customer.address, customer.city, customer.phone, customer.email, customerId]
  );
};

// Delete customer
export const deleteCustomer = (customerId: string): void => {
  const db = getDatabase();
  db.run('DELETE FROM Customer WHERE customer_id = ?', [customerId]);
};

// Search customers
export const searchCustomers = (searchTerm: string): Customer[] => {
  const db = getDatabase();
  const searchPattern = `%${searchTerm}%`;
  
  const result = db.exec(
    `SELECT * FROM Customer 
     WHERE name LIKE ? OR city LIKE ? OR email LIKE ?
     ORDER BY name`,
    [searchPattern, searchPattern, searchPattern]
  );
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map(row => {
    const customer: any = {};
    columns.forEach((col, idx) => {
      customer[col] = row[idx];
    });
    return customer as Customer;
  });
};
