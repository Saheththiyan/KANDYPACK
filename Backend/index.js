// index.js
import express from "express";
import customerRouter from "./routers/customerRouter.js";
import driverRouter from "./routers/driverRouter.js";
import productRouter from "./routers/productRouter.js";
import storeRouter from "./routers/storeRouter.js";
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

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
