import express from "express";
import "dotenv/config";
import cors from "cors";
import { connectDB } from "./config/db.js";

import userRouter from "./routes/userRoute.js";
import incomeRouter from "./routes/incomeRoute.js";
import expenseRouter from "./routes/expenseRoute.js";

const app = express();
const port = 4000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// DATABASE
connectDB();

// ROUTES
app.use("/api/user", userRouter);
app.use("/api/income", incomeRouter);
app.use("/api/expense", expenseRouter);

app.get("/", (req, res) => {
  res.send({
    message: "API is working",
    success: true,
  });
});

// START SERVER
app.listen(port, () => {
  console.log(`Server is running on port: http://localhost:${port}`);
});
