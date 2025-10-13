import { sortDriversByHour } from "../../models/driverModel";
import { getAssistantHours } from "../../models/assistantModel.js";

async function getDriverHours(req, res) {
  const { from, to } = req.query;

  const driverHours = await sortDriversByHour();
  console.log("from to is not implemented");
  return res.json({ from, to, staff: driverHours });
}


async function getAssistantHours(req, res) {
  const { from, to } = req.query;

  const assistantHours = await getAssistantHours(from, to);
  return res.json({ from, to, staff: assistantHours });
}

export default { getDriverHours, getAssistantHours };