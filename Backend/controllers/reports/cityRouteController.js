// Controller for city-wise and route-wise sales breakdown
export function getCityRouteBreakdown(req, res) {
  const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
  // TODO: implement DB grouping by city and route with sales totals
  return res.json({ quarter, cities: [], routes: [] });
}
