import * as cityRouteSalesModel from "../../models/routeModel.js";

// export function getCitySalesBreakdown(req, res) {
//   const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
//   // TODO: implement DB grouping by city and route with sales totals
//   console.log("City sales breakdown not implemented yet");
//   return res.json({ quarter, cities: [], routes: [] });
// }

// export function getRouteSalesBreakdown(req, res) {
//   const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
//   // TODO: implement DB grouping by route with sales totals
//   console.log("Route sales breakdown not implemented yet");
//   return res.json({ quarter, routes: [] });
// }

export async function getCityRouteSalesBreakdown(req, res) {
  try {
    const breakdown = await cityRouteSalesModel.getCityRouteBySales();
    res.json(breakdown);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

