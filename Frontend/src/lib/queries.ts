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

// ============================================
// PRODUCT QUERIES
// ============================================

export interface Product {
  product_id: string;
  name: string;
  description: string;
  unit_price: number;
  space_unit: number;
}

// Get all products
export const getAllProducts = (sortBy: 'name' | 'price' = 'name'): Product[] => {
  const db = getDatabase();
  const orderClause = sortBy === 'price' ? 'unit_price ASC' : 'name ASC';
  const result = db.exec(`SELECT * FROM Product ORDER BY ${orderClause}`);
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map(row => {
    const product: any = {};
    columns.forEach((col, idx) => {
      product[col] = row[idx];
    });
    return product as Product;
  });
};

// Get product by ID
export const getProductById = (productId: string): Product | null => {
  const db = getDatabase();
  const result = db.exec(
    'SELECT * FROM Product WHERE product_id = ?',
    [productId]
  );
  
  if (result.length === 0 || result[0].values.length === 0) return null;
  
  const columns = result[0].columns;
  const row = result[0].values[0];
  
  const product: any = {};
  columns.forEach((col, idx) => {
    product[col] = row[idx];
  });
  
  return product as Product;
};

// Add new product
export const addProduct = (product: Omit<Product, 'product_id'>): string => {
  const db = getDatabase();
  const productId = `p${Date.now()}`;
  
  db.run(
    `INSERT INTO Product (product_id, name, description, unit_price, space_unit) 
     VALUES (?, ?, ?, ?, ?)`,
    [productId, product.name, product.description, product.unit_price, product.space_unit]
  );
  
  return productId;
};

// Update product
export const updateProduct = (productId: string, product: Omit<Product, 'product_id'>): void => {
  const db = getDatabase();
  
  db.run(
    `UPDATE Product 
     SET name = ?, description = ?, unit_price = ?, space_unit = ?
     WHERE product_id = ?`,
    [product.name, product.description, product.unit_price, product.space_unit, productId]
  );
};

// Delete product
export const deleteProduct = (productId: string): void => {
  const db = getDatabase();
  db.run('DELETE FROM Product WHERE product_id = ?', [productId]);
};

// Search products
export const searchProducts = (searchTerm: string, sortBy: 'name' | 'price' = 'name'): Product[] => {
  const db = getDatabase();
  const searchPattern = `%${searchTerm}%`;
  const orderClause = sortBy === 'price' ? 'unit_price ASC' : 'name ASC';
  
  const result = db.exec(
    `SELECT * FROM Product 
     WHERE name LIKE ? OR description LIKE ?
     ORDER BY ${orderClause}`,
    [searchPattern, searchPattern]
  );
  
  if (result.length === 0) return [];
  
  const columns = result[0].columns;
  const values = result[0].values;
  
  return values.map(row => {
    const product: any = {};
    columns.forEach((col, idx) => {
      product[col] = row[idx];
    });
    return product as Product;
  });
};
