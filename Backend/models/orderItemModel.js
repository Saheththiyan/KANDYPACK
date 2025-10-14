import db from "../config/db.js";

export async function getItems() {
  const [items] = await db.query("SELECT * FROM  Order_item");
  return items;
}

export async function getMostOrderedProducts(year, quarter, limit = 5) {
  const [products] = await db.query(
    `SELECT 
      p.product_id AS productId,
      p.name AS productName,
      SUM(oi.quantity) AS totalQuantity,
      SUM(oi.sub_total) AS totalRevenue
    FROM Order_Item oi
    JOIN Product p ON oi.product_id = p.product_id
    JOIN \`Order\` o ON oi.order_id = o.order_id
    WHERE YEAR(o.order_date) = ? AND QUARTER(o.order_date) = ?
    GROUP BY p.product_id, p.name
    ORDER BY totalQuantity DESC
    LIMIT ?;
    `,
    [year, quarter, limit]
  );

  // Format to match frontend expectations
  return products.map((row) => ({
    id: row.productId,
    name: row.productName,
    unitsSold: row.totalQuantity,
    revenue: row.totalRevenue,
  }));
}
