import db from "../config/db.js";
import crypto from "crypto";

export async function getOrders() {
  const [orders] = await db.query("SELECT * FROM `Order`"); //
  return orders;
}

export async function createOrder(
  customerId,
  items,
  totalAmount,
  requiredDate
) {
  const connection = await db.getConnection();

  try {
    // Start transaction
    await connection.beginTransaction();

    // Generate UUID for the order
    const orderId = crypto.randomUUID();

    // Insert order
    const orderQuery = `
      INSERT INTO \`Order\` (order_id, customer_id, order_date, required_date, status, total_value)
      VALUES (?, ?, NOW(), ?, 'Pending', ?)
    `;
    await connection.query(orderQuery, [
      orderId,
      customerId,
      requiredDate,
      totalAmount,
    ]);

    // Insert order items
    const orderItemQuery = `
      INSERT INTO Order_Item (product_id, order_id, quantity, sub_total)
      VALUES (?, ?, ?, ?)
    `;

    for (const item of items) {
      const subTotal = item.price * item.quantity;
      await connection.query(orderItemQuery, [
        item.productId,
        orderId,
        item.quantity,
        subTotal,
      ]);
    }

    // Commit transaction
    await connection.commit();

    return {
      orderId,
      customerId,
      items,
      totalAmount,
      requiredDate,
      status: "Pending",
    };
  } catch (error) {
    // Rollback transaction on error
    await connection.rollback();
    throw error;
  } finally {
    // Release connection back to pool
    connection.release();
  }
}

export async function getQuarterlyOrders(year) {
  const [orders] = await db.query(
    `
    SELECT 
      q.q AS quarter,
      IFNULL(t.totalOrders, 0) AS totalOrders,
      IFNULL(t.totalRevenue, 0) AS totalRevenue
    FROM 
      (SELECT 1 AS q UNION SELECT 2 UNION SELECT 3 UNION SELECT 4) q
    LEFT JOIN (
      SELECT 
        QUARTER(order_date) AS quarter,
        COUNT(*) AS totalOrders,
        SUM(total_value) AS totalRevenue
      FROM 
        \`Order\`
      WHERE 
        YEAR(order_date) = ?
      GROUP BY 
        QUARTER(order_date)
    ) t ON t.quarter = q.q
    ORDER BY 
      q.q;
    `,
    [year]
  );
  return orders;
}

export async function getCustomerOrderHistory(customerId) {
  const [history] = await db.query(
    `
    SELECT 
      YEAR(orderDate) AS year,
      MONTH(orderDate) AS month,
      COUNT(*) AS totalOrders,
      SUM(totalAmount) AS totalSpent
    FROM 
      \`Order\`
    WHERE 
      customerId = ?
    GROUP BY 
      YEAR(orderDate), MONTH(orderDate)
    ORDER BY 
      YEAR(orderDate), MONTH(orderDate);
    `,
    [customerId]
  );
  return history;
}
