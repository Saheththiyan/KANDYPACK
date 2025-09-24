// index.js
import express from "express";
import customerRouter from "./routers/customerRouter.js";
import driverRouter from "./routers/driverRouter.js";
import productRouter from "./routers/productRouter.js";
import storeRouter from "./routers/storeRouter.js";
import routeRouter from "./routers/routeRouter.js";
import orderRouter from "./routers/orderRouter.js";
import truckRouter from "./routers/truckRouter.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/customers", customerRouter);
app.use("/drivers", driverRouter);
app.use("/products", productRouter);
app.use("/stores", storeRouter);
app.use("/routes", routeRouter);
app.use("/orders", orderRouter);
app.use("/trucks", truckRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
