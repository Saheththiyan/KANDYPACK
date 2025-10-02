import db from "../config/db.js";

export async function getCustomers() {
  const [customers] = await db.query("SELECT * FROM Customer");
  return customers;
}
