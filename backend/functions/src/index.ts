import * as functions from "firebase-functions";
import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import passport from "passport";
import authRouter from "./routes/auth";
import edamamRouter from "./routes/edamam";
import statsRouter from "./routes/stats";
import usdaRouter from "./routes/usda";

declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): this is AuthenticatedRequest;
    }
  }

  interface AuthenticatedRequest extends Request {
    user: any; 
  }
}

dotenv.config();
const app = express();

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

app.use(
  session({
    secret: process.env.SECRET_SESSION as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: true,
    },
  })
);

app.use(
  cors({
    origin: true, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRouter);
app.use("/", isAuthenticated, edamamRouter);
app.use("/", isAuthenticated, usdaRouter);
app.use("/", isAuthenticated, statsRouter);

app.get('/auth/check', isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});

exports.api = functions.https.onRequest(app);
