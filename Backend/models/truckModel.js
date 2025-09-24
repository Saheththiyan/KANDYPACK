import db from "../config/db.js";

export async function getTrucks() {
  const [trucks] = await db.query("SELECT * FROM truck");
  return trucks;
}
