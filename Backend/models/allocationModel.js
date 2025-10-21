import db from "../config/db.js";

export async function getAllocations() {
  const [allocations] = await db.query("SELECT * FROM Allocation");
  return allocations;
}

export async function getUnprocessedOrders() {
  const query = `
    SELECT 
      order_id,
      name,
      city,
      order_date,
      required_date,
      count(product_id) as count_product_id,
      sum(total_value) as total_value
    FROM Customer_Order
    WHERE order_id NOT IN (SELECT order_id FROM Delivers)
    GROUP BY order_id, name, city, order_date, required_date
  `;
  
  const [orders] = await db.query(query);
  return orders;
}
