import db from "../config/db.js";

export async function getAssistants() {
  const [assistants] = await db.query("SELECT * FROM assistant");
  return assistants;
}
