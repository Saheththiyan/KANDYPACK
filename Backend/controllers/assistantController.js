import * as assistant from "../models/assistantModel.js";

export async function getAllAssistants(req, res) {
  try {
    const assistants = await assistant.getAssistants();
    res.json(assistants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
