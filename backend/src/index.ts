import cors from "cors";
import dotenv from "dotenv";
import express, { Request, Response, NextFunction } from "express";
import session from "express-session";
import pgSession from "connect-pg-simple";
import passport from "passport";
import authRouter from "./routes/auth";
import edamamRouter from "./routes/edamam";
import statsRouter from "./routes/stats";
import usdaRouter from "./routes/usda";

dotenv.config();  

console.log('NODE_ENV:', process.env.NODE_ENV);

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

const app = express();

function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized" });
}

const pgSessionStore = pgSession(session);

app.set("trust proxy", 1);

app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.url);
  console.log('Request headers:', req.headers);
  
  const oldWrite = res.write;
  const oldEnd = res.end;

  const chunks: Buffer[] = [];

  res.write = function (chunk: any) {
    chunks.push(Buffer.from(chunk));
    return oldWrite.apply(res, arguments as any);
  };

  next();
});

app.use(
  session({
    store: new pgSessionStore({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SECRET_SESSION as string,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production", 
      maxAge: 1000 * 60 * 60 * 24,  
      sameSite: "none",  
      httpOnly: true,  
    },
  })
);

app.use((req, res, next) => {
  console.log('Session:', req.session);
  next();
});

const allowedOrigins = [
  "https://nutrition-app-49a16.web.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  next();
});

app.use(express.json());

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRouter);
app.use("/", isAuthenticated, edamamRouter);
app.use("/", isAuthenticated, usdaRouter);
app.use("/", isAuthenticated, statsRouter);

app.get("/auth/check", isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
