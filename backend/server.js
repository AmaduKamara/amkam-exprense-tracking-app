import express from "express";
import "dotenv/config";
import cors from "cors";

const app = express();
const port = 4000;

// MIDDLEWARES
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// DATABASE

// ROUTES
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
