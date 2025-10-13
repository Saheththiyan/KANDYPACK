import db from "../config/db.js";

export async function getRoutes() {
  const [routes] = await db.query("SELECT * FROM Route");
  return routes;
}
