import db from "../config/db.js";

export async function getSchedules() {
  const [schedules] = await db.query("SELECT * FROM delivery_schedule");
  return schedules;
}
