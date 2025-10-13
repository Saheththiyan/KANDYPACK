import db from "../config/db.js";

export async function getSchedules() {
  const [schedules] = await db.query("SELECT * FROM  Train_schedule");
  return schedules;
}
