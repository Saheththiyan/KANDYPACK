import * as schedule from "../models/trainScheduleModel.js";

export async function getAllSchedules(req, res) {
  try {
    const schedules = await schedule.getSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
