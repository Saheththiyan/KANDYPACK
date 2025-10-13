export function getCitySalesBreakdown(req, res) {
  const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
  // TODO: implement DB grouping by city and route with sales totals
  console.log("City sales breakdown not implemented yet");
  return res.json({ quarter, cities: [], routes: [] });
}

export function getRouteSalesBreakdown(req, res) {
  const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
  // TODO: implement DB grouping by route with sales totals
  console.log("Route sales breakdown not implemented yet");
  return res.json({ quarter, routes: [] });
}