// index.js
import express from "express";
import customerRouter from "./routers/customerRouter.js";
import driverRouter from "./routers/driverRouter.js";
import productRouter from "./routers/productRouter.js";
import storeRouter from "./routers/storeRouter.js";
import routeRouter from "./routers/routeRouter.js";
import orderRouter from "./routers/orderRouter.js";
import truckRouter from "./routers/truckRouter.js";
import assistantRouter from "./routers/assistantRouter.js";
import allocationRouter from "./routers/allocationRouter.js";
import deliversRouter from "./routers/deliversRouter.js";
import deliveryScheduleRouter from "./routers/deliveryScheduleRouter.js";
import trainScheduleRouter from "./routers/trainScheduleRouter.js";
import orderItemRouter from "./routers/orderItemRouter.js";
import adminRouter from "./routers/adminRouter.js";
import mostOrderedRouter from "./routers/reports/mostOrderedRouter.js";
import CityRouteSalesRouter from "./routers/reports/cityRouteSalesRouter.js";
import staffHoursRouter from "./routers/reports/staffHoursRouter.js";
import reportsRouter from "./routers/reports/reportsRouter.js";
import authRouter from "./routers/authRouter.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

// default to 5000 when not provided (useful for docker and local dev)
const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/admin/customers", customerRouter);

app.use("/drivers", driverRouter);
app.use("/products", productRouter);
app.use("/stores", storeRouter);
app.use("/routes", routeRouter);
app.use("/orders", orderRouter);
app.use("/trucks", truckRouter);
app.use("/assistants", assistantRouter);
app.use("/allocations", allocationRouter);
app.use("/delivers", deliversRouter);
app.use("/deliverySchedule", deliveryScheduleRouter);
app.use("/trainSchedule", trainScheduleRouter);
app.use("/orderItems", orderItemRouter);
app.use("/admin", adminRouter);
app.use("/admin/mostOrdered", mostOrderedRouter);
app.use("/admin/cityRouteSales", CityRouteSalesRouter);
app.use("/admin/staffHours", staffHoursRouter);
app.use("/reports", reportsRouter);
app.use("/mostOrdered", mostOrderedRouter);
app.use("/api/auth", authRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
