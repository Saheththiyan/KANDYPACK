import db from "../config/db.js";

export async function getOrders() {
  const [orders] = await db.query("SELECT * FROM `Order`"); //
  return orders;
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
        QUARTER(orderDate) AS quarter,
        COUNT(*) AS totalOrders,
        SUM(totalAmount) AS totalRevenue
      FROM 
        \`Order\`
      WHERE 
        YEAR(orderDate) = ?
      GROUP BY 
        QUARTER(orderDate)
    ) t ON t.quarter = q.q
    ORDER BY 
      q.q;
    `,
    [year]
  );
  return orders;
}
