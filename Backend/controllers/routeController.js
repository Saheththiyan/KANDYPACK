import * as route from "../models/routeModel.js";

export async function getAllRoutes(req, res) {
  try {
    const routes = await route.getRoutes();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
