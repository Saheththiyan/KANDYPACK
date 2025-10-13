import db from "../config/db.js";

export async function getItems() {
  const [items] = await db.query("SELECT * FROM  Order_item");
  return items;
}

export async function getMostOrderedProducts(year, quarter, limit = 5) {
  const [products] = await db.query(
    `
    SELECT 
      p.id AS productId,
      p.name AS productName,
      SUM(oi.quantity) AS totalQuantity
    FROM 
      OrderItem oi
    JOIN 
      Product p ON oi.productId = p.id
    WHERE 
      YEAR(oi.orderDate) = ? AND QUARTER(oi.orderDate) = ?
    GROUP BY 
      p.id, p.name
    ORDER BY 
      totalQuantity DESC
    LIMIT ?;
    `,
    [year, quarter, limit]
  );
  return products;
}
