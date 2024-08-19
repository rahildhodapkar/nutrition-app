import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth";
import edamamRouter from "./routes/edamam";
import statsRouter from "./routes/stats";
import usdaRouter from "./routes/usda";

dotenv.config();
const app = express();

app.use(
  session({
    secret: process.env.SECRET_SESSION as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax", 
    },
  })
);


app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRouter);
app.use("/", edamamRouter);
app.use("/", usdaRouter);
app.use("/", statsRouter);

app.get("/", (req, res) => {
  res.send("Yo!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
