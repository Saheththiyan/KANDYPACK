import db from "../config/db.js";

export async function getItems() {
  const [items] = await db.query("SELECT * FROM  Order_item");
  return items;
}
