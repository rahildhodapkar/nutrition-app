import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import authRouter from "./routes/auth";
import edamamRouter from "./routes/edamam";
import usdaRouter from "./routes/usda"

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());
app.use("/", authRouter);
app.use("/", edamamRouter);
app.use("/", usdaRouter)

app.get("/", (req, res) => {
  res.send("Yo!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
