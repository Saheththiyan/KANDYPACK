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
     ORDER BY orders DESC`
  );
  return sales;
}

export async function addRoute(routeData) {
  const { store_id, stops, max_delivery_time } = routeData;

  const query = `
    INSERT INTO Route(store_id, stops, max_delivery_time)
    VALUES (?,?,?)
  `;
  const [result] = await db.query(query, [store_id, stops, max_delivery_time]);
  return result;
}

export async function removeRoute(route_id) {
  const query = `
    DELETE FROM Route
    WHERE route_id = ?
  `;
  const [result] = await db.query(query, [route_id]);
  return result;
}
