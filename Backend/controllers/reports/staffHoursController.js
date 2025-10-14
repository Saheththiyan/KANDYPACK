import { sortDriversByHour } from "../../models/driverModel.js";
import { sortAssistantsByHour } from "../../models/assistantModel.js";

export async function getDriverHours(req, res) {
  // const { from, to } = req.query;
  try {
    const driverHours = await sortDriversByHour();
    res.json(driverHours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


export async function getAssistantHours(req, res) {
  try {
    const assistantHours = await sortAssistantsByHour();
    res.json(assistantHours);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// export default { getDriverHours, getAssistantHours };