import db from "../config/db.js";

export async function getRoutes() {
  const [routes] = await db.query("SELECT * FROM Route");
  return routes;
}

export async function getCityRouteBySales() {
  const [sales] = await db.query(
    `SELECT city, stops, COUNT(order_id) AS orders, SUM(total_value) AS sales_value
     FROM Sales_By_City_Route
     GROUP BY stops, city
     ORDER BY orders DESC`);
  return sales;
}