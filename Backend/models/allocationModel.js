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
    WHERE status = 'Pending' or status = 'Processing'
    GROUP BY order_id, name, city, order_date, required_date, status
  `;

  const [orders] = await db.query(query);
  return orders;
}

export async function getOrdersByCity(city) {
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
    WHERE city = ? AND status = 'Pending'
    GROUP BY order_id, name, city, order_date, required_date, status
  `;

  const [orders] = await db.query(query, [city]);
  return orders;
}

export async function getOrdersByRouteStore(routeId) {
  const query = `CALL GetOrdersByRouteStore(?)`;
  const [results] = await db.query(query, [routeId]);
  return results[0];
}

export async function createAllocation({ train_schedule_id, order_id, store_id, space_consumed = 0 }) {
  const [result] = await db.query(
    `INSERT INTO Allocation (train_schedule_id, order_id, space_consumed, store_id) VALUES (?, ?, ?, ?)`,
    [train_schedule_id, order_id, space_consumed, store_id]
  );
  return result;
}
