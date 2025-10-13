import db from "../config/db.js";

export async function getCustomers() {
  const [customers] = await db.query("SELECT * FROM Customer");
  return customers;
}

export async function deleteCustomerById(id) {
  try {
    
    const [result] = await db.query("DELETE FROM Customer WHERE customer_id = ?", [id]);
    return result;
  } catch (error) {
    throw error;
  }
}