// Controller for truck usage analysis per month
export function getTruckUsage(req, res) {
  const month = req.query.month || `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
  // TODO: aggregate trips, kilometers and load factors per truck
  return res.json({ month, trucks: [] });
}
