import { sortDriversByHour } from "../../models/driverModel.js";
import { getAssistantHour } from "../../models/assistantModel.js";

export async function getDriverHours(req, res) {
  const { from, to } = req.query;

  const driverHours = await sortDriversByHour();
  console.log("from to is not implemented");
  return res.json({ from, to, staff: driverHours });
}


export async function getAssistantHours(req, res) {
  const { from, to } = req.query;

  const assistantHours = await getAssistantHour(from, to);
  return res.json({ from, to, staff: assistantHours });
}

// export default { getDriverHours, getAssistantHours };