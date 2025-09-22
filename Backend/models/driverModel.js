import db from "../config/db.js";

export async function getDrivers() {
  const [drivers] = await db.query("SELECT * FROM driver");
  return drivers;
}
