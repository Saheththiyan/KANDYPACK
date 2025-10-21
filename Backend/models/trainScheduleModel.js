import db from "../config/db.js";

export async function getSchedules() {
  const [schedules] = await db.query("SELECT * FROM  Train_schedule");
  return schedules;
}

export async function getSchedulesByCity(city) {
  const [schedules] = await db.query(
    "SELECT * FROM Train_Schedule WHERE arrival_city = ?",
    [city]
  );
  return schedules;
}
