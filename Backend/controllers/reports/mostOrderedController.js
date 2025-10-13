// Controller for most ordered items in a given quarter
export function getMostOrdered(req, res) {
  const quarter = req.query.quarter || `${new Date().getFullYear()} Q4`;
  // TODO: query DB to aggregate order items by quantity for the quarter
  return res.json({ quarter, top: [] });
}
