/**
 * Nutron - Nutrition Tracking Platform
 * 
 * Main server entry point that configures and starts the Express application,
 * sets up middleware, authentication, and API routes.
 */

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

// Load environment variables
dotenv.config();

// Log the current environment for debugging purposes
console.log('NODE_ENV:', process.env.NODE_ENV);

// Type declarations for extended Express functionality
declare global {
  namespace Express {
    interface Request {
      isAuthenticated(): this is AuthenticatedRequest;
    }
  }

  interface AuthenticatedRequest extends Request {
    user: any; // TODO: Replace with a proper User type
  }
}

/**
 * Middleware to verify if a user is authenticated.
 * If not, returns a 401 Unauthorized response.
 */
function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized: Please log in to access this resource" });
}

// Initialize Express app
const app = express();

// Configure session store with PostgreSQL
const pgSessionStore = pgSession(session);

// Trust first proxy in production environments
app.set("trust proxy", 1);

// Session configuration
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
      secure: process.env.NODE_ENV === "production", // Use secure cookies in production
      maxAge: 1000 * 60 * 60 * 24,  // 1 day
      sameSite: "none",  // Required for cross-site requests
      httpOnly: true,  // Prevents client-side JavaScript from accessing the cookie
    },
  })
);

// Session logging for development purposes
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Session ID:', req.sessionID);
    next();
  });
}

// Configure CORS with allowed origins
const allowedOrigins = [
  "https://nutrition-app-49a16.web.app",
  "http://localhost:5173",
];

// CORS middleware
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS policy"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

// Parse JSON request bodies
app.use(express.json());

// Initialize Passport for authentication
app.use(passport.initialize());
app.use(passport.session());

// Mount API routes
app.use("/", authRouter);
app.use("/", isAuthenticated, edamamRouter);
app.use("/", isAuthenticated, usdaRouter);
app.use("/", isAuthenticated, statsRouter);

// Authentication check endpoint
app.get("/auth/check", isAuthenticated, (req: Request, res: Response) => {
  res.status(200).json({ user: req.user });
});

// Server health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "healthy", environment: process.env.NODE_ENV });
});

// Global error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[ERROR] ${new Date().toISOString()}:`, err.stack);
  
  // Avoid exposing details in production
  const message = process.env.NODE_ENV === 'production' 
    ? "Internal Server Error" 
    : err.message;
    
  res.status(500).json({ 
    message, 
    // Include stack trace only in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Handle 404 routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Resource not found" });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
