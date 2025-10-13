import db from "../config/db.js";

export async function getOrders() {
  const [orders] = await db.query("SELECT * FROM `Order`"); //
  return orders;
}
