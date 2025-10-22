import db from "../config/db.js";

export async function getSchedules() {
  // Return schedules from today onward
  const [schedules] = await db.query(
    "SELECT * FROM Train_Schedule WHERE schedule_date >= CURDATE() ORDER BY schedule_date ASC, departure_time ASC"
  );
  return schedules;
}

export async function getSchedulesByCity(city) {
  const [schedules] = await db.query(
    "SELECT * FROM Train_Schedule WHERE arrival_city = ?",
    [city]
  );
  return schedules;
}
