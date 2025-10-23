import * as route from "../models/routeModel.js";

export async function getAllRoutes(req, res) {
  try {
    const routes = await route.getRoutes();
    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function addNewRoute(req, res) {
  try {
    const routeData = req.body;

    const result = await route.addRoute(routeData);

    res.status(201).json({
      message: "Route Added Successfully!",
      data: result,
    });
  } catch (error) {
    //console.error(error);
    res
      .status(500)
      .json({ message: "Somthing went wrong", error: error.message });
  }
}

export async function deleteRoute(req, res) {
  try {
    const { route_id } = req.params;
    const result = await route.removeRoute(route_id);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Route not Found" });
    }

    return res.status(200).json({ message: "Route successfully removed" });
  } catch (error) {
    //console.log(error);
    res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
}

export async function getRoutesByStore(req, res) {
  try {
    const { store_id } = req.query;
    let routes;

    if (store_id) {
      routes = await route.getRoutesByStore(store_id);
    } else {
      routes = await route.getRoutes();
    }

    res.json(routes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
