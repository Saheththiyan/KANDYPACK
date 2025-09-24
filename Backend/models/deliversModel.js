import db from "../config/db.js";

export async function getDeliverires() {
  const [delivers] = await db.query("SELECT * FROM delivers");
  return delivers;
}
