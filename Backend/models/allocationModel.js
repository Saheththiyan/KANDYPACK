import db from "../config/db.js";

export async function getAllocations() {
  const [allocations] = await db.query("SELECT * FROM allocation");
  return allocations;
}
