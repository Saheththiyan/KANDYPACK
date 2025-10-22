import * as assistant from "../models/assistantModel.js";

export async function getAllAssistants(req, res) {
  try {
    const assistants = await assistant.getAssistants();
    res.json(assistants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addNewAssistant(req, res) {
  try {
    const assitantData = req.body;

    const result = await assistant.addAssistant(assitantData);

    res
      .status(201)
      .json({ message: "New assistant successfully added", data: result });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}

export async function deleteAssistant(req, res) {
  try {
    const { assistant_id } = req.params;
    const result = await assistant.removeAssistant(assistant_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Assistant not Found" });
    }

    res.status(200).json({ message: "Assistant successfully removed!" });
  } catch (error) {
    console.log(error);

    // Handle foreign key violation
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      console.log("Cannot Delete: Assistant has existing orders!");
      return res.status(400).json({
        message: "Cannot Delete: Assistant has existing orders!",
        error: error.message,
      });
    }

    res.status(500).json({
      message: "Something went wrong!",
      error: error.message,
    });
  }
}

export async function patchAssistantDetails(req, res) {
  try {
    const assistant_id = req.params.assistant_id;
    const assistantData = req.body;

    const result = await assistant.patchAssistant(assistant_id, assistantData);

    if (!result || result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Assistant not found or no fields to update" });
    }

    res.status(200).json({
      message: "Assistant data updated successfully!",
      data: assistantData,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Something went wrong!", error: error.message });
  }
}

export async function getAssistantsByStore(req, res) {
  try {
    const { store_id } = req.query;
    let assistants;

    if (store_id) {
      assistants = await assistant.getAssistantsByStore(store_id);
    } else {
      assistants = await assistant.getAssistants();
    }

    res.json(assistants);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
