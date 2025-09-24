import * as schedule from "../models/deliveryScheduleModel.js";

export async function getAllschedules(req, res) {
  try {
    const schedules = await schedule.getSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
