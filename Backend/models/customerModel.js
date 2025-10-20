import db from "../config/db.js";

export async function getCustomers() {
  const [customers] = await db.query("SELECT * FROM Customer");
  return customers;
}

export async function deleteCustomerById(id) {
  try {
    console.log("Attempting to delete customer with ID:", id);
    const [result] = await db.query("DELETE FROM Customer WHERE customer_id = ?", [id]);
    return result;
  } catch (error) {
    throw error;
  }
}

export async function getCustomerByEmail(email) {
  const [rows] = await db.query("SELECT * FROM Customer WHERE email = ?", [email]);
  return rows[0];
}

export async function validateCustomerPassword(customer, password) {
  // return bcrypt.compare(password, customer.password);
  return customer.password === password;
}