import db from "../config/db.js";

export async function getItems() {
  const [items] = await db.query("SELECT * FROM  order_item");
  return items;
}
