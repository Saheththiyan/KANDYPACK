// index.js
import express from "express";
import customerRouter from "./routers/customerRouter.js";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const PORT = process.env.PORT;

const app = express();
app.use(cors());
app.use(express.json());

app.use("/customer", customerRouter);

app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});
