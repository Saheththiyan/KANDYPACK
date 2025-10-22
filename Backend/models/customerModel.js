import db from "../config/db.js";
import bcrypt from "bcryptjs";

export async function getCustomers() {
  const [customers] = await db.query("SELECT * FROM Customer");
  return customers;
}

export async function deleteCustomerById(id) {
  try {
    console.log("Attempting to delete customer with ID:", id);
    const [result] = await db.query(
      "DELETE FROM Customer WHERE customer_id = ?",
      [id]
    );
    return result;
  } catch (error) {
    throw error;
  }
}

export async function createCustomer({
  customer_id,
  name,
  type,
  address,
  city,
  phone,
  email,
  password,
}) {
  const hashedPassword = await bcrypt.hash(password, 10); //10 salt rounds

  const [result] = await db.query(
    `INSERT INTO Customer (customer_id, name, \`type\`, address, city, phone, email, password)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [customer_id, name, type, address, city, phone, email, hashedPassword]
  );
  return result;
}

export async function getCustomerByEmail(email) {
  const [rows] = await db.query("SELECT * FROM Customer WHERE email = ?", [
    email,
  ]);
  return rows[0];
}

export async function validateCustomerPassword(customer, password) {
  return bcrypt.compare(password, customer.password);
  // return customer.password === password;
}

export async function getCustomerById(id) {
  const [rows] = await db.query(
    `SELECT customer_id, name, type, address, city, phone, email 
     FROM Customer 
     WHERE customer_id = ?`,
    [id]
  );
  return rows[0] || null;
}

export async function updateCustomerContact(customerId, contact) {
  const { name, phone, address, city } = contact;

  await db.query(
    `UPDATE Customer 
     SET 
       name = COALESCE(?, name),
       phone = COALESCE(?, phone),
       address = COALESCE(?, address),
       city = COALESCE(?, city)
     WHERE customer_id = ?`,
    [name ?? null, phone ?? null, address ?? null, city ?? null, customerId]
  );
}

export async function updateCustomerProfile(customerId, updates = {}) {
  const fields = [];
  const values = [];

  const mapping = {
    name: "name",
    phone: "phone",
    address: "address",
    city: "city",
    type: "`type`",
    email: "email",
  };

  for (const [key, column] of Object.entries(mapping)) {
    if (Object.prototype.hasOwnProperty.call(updates, key)) {
      fields.push(`${column} = ?`);
      values.push(updates[key] ?? null);
    }
  }

  if (!fields.length) {
    return null;
  }

  await db.query(
    `
      UPDATE Customer
      SET ${fields.join(", ")}
      WHERE customer_id = ?
    `,
    [...values, customerId]
  );

  return getCustomerById(customerId);
}
