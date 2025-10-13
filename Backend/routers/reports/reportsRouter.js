import express from "express";
import quarterlyRouter from "./quaterlyRouter.js";
import mostOrderedRouter from "./mostOrderedRouter.js";
import cityRouteRouter from "./cityRouteSalesRouter.js";
import staffHoursRouter from "./staffHoursRouter.js";
import truckUsageRouter from "./truckUsageRouter.js";
import customerHistoryRouter from "./customerHistoryRouter.js";

const router = express.Router();

router.use("/quarterly", quarterlyRouter);
router.use("/most-ordered", mostOrderedRouter);
router.use("/city-route", cityRouteRouter);
router.use("/staff-hours", staffHoursRouter);
router.use("/truck-usage", truckUsageRouter);
router.use("/customer-history", customerHistoryRouter);

export default router;
