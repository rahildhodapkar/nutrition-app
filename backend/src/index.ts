import dotenv from "dotenv";
import express from "express";
import authRouter from "./routes/auth";

dotenv.config();
const app = express();

app.use(express.json());
app.use("/", authRouter);

app.get("/", (req, res) => {
  res.send("Yo!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
