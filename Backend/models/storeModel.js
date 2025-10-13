import db from "../config/db.js";

export async function getStores() {
  const [stores] = await db.query("SELECT * FROM Store");
  return stores;
}
