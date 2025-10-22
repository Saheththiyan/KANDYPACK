import * as schedule from "../models/trainScheduleModel.js";

export async function getAllSchedules(req, res) {
  try {
    const schedules = await schedule.getSchedules();
    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getSchedulesByCity(req, res) {
  try {
    const { city } = req.query;
    let schedules;
    if (city) {
      schedules = await schedule.getSchedulesByCity(city);
    } else {
      schedules = await schedule.getSchedules();
    }

    res.json(schedules);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
