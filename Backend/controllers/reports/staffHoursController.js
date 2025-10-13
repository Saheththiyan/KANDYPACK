// Controller for driver and assistant working hours report
export function getStaffHoursReport(req, res) {
  const { from, to } = req.query;
  // TODO: compute working hours per staff from shift logs / allocations
  return res.json({ from, to, staff: [] });
}
