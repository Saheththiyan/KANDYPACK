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
      sum(total_value) as total_value,
      status
    FROM Customer_Order
    WHERE status = 'Pending'
    GROUP BY order_id, name, city, order_date, required_date, status
  `;

  const [orders] = await db.query(query);
  return orders;
}
