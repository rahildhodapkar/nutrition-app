/**
 * Authentication Routes
 * 
 * Handles user authentication including:
 * - User registration
 * - Login with passport local strategy
 * - Session management
 * - Logout functionality
 */

import bcrypt from "bcryptjs";
import express, { Request, Response, NextFunction } from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "../prisma";

// Constants
const SALT_ROUNDS = 10;
const MIN_PASSWORD_LENGTH = 8;
const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

const authRouter = express.Router();

/**
 * Configure Passport Local Strategy for username/password authentication
 */
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username
      const user = await prisma.user.findUnique({ where: { username } });
      
      // If user not found, return error
      if (!user) {
        return done(null, false, { message: "Invalid username or password" });
      }
      
      // Compare hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Invalid username or password" });
      }
      
      // Authentication successful
      return done(null, user);
    } catch (err) {
      console.error("Authentication error:", err);
      return done(err);
    }
  })
);

/**
 * Define how to serialize user object to the session
 * Only store the user ID in the session for security
 */
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

/**
 * Define how to deserialize user from session storage
 * Fetch the full user object based on the stored ID
 */
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ 
      where: { id },
      select: {
        id: true,
        username: true,
        created_at: true,
        updated_at: true,
        // Explicitly exclude password for security
      }
    });
    
    if (user) {
      done(null, user);
    } else {
      done(new Error("User not found"));
    }
  } catch (err) {
    console.error("Session deserialization error:", err);
    done(err);
  }
});

/**
 * Utility function to validate password strength
 * @param password - Password to validate
 * @returns Object containing validation result and message
 */
function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return { 
      valid: false, 
      message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters long` 
    };
  }
  
  // Check for at least one number
  if (!/\d/.test(password)) {
    return { 
      valid: false, 
      message: "Password must contain at least one number" 
    };
  }
  
  // Check for at least one special character
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
      valid: false, 
      message: "Password must contain at least one special character" 
    };
  }
  
  return { valid: true };
}

/**
 * Middleware to rate limit login attempts
 * Simple in-memory implementation
 */
const loginAttempts = new Map<string, { count: number, lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 15 * 60 * 1000; // 15 minutes in milliseconds

function loginRateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  
  // Get current attempts for this IP
  const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
  
  // Reset if lockout period has passed
  if (attempts.count >= MAX_LOGIN_ATTEMPTS && (now - attempts.lastAttempt) > LOCKOUT_TIME) {
    loginAttempts.set(ip, { count: 0, lastAttempt: now });
    return next();
  }
  
  // Check if account is locked
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    const timeLeft = Math.ceil((LOCKOUT_TIME - (now - attempts.lastAttempt)) / 60000);
    return res.status(429).json({ 
      message: `Too many login attempts. Please try again in ${timeLeft} minutes.` 
    });
  }
  
  // Update for next time and proceed
  req.on('end', () => {
    if (req.path === '/auth/login') {
      loginAttempts.set(ip, { 
        count: attempts.count + 1, 
        lastAttempt: now 
      });
    }
  });
  
  next();
}

// Apply rate limiter to all auth routes
authRouter.use(loginRateLimiter);

/**
 * @route POST /auth/login
 * @desc Authenticate a user and establish a session
 * @access Public
 */
authRouter.post("/auth/login", (req: Request, res: Response, next: NextFunction) => {
  // Validate request body
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Username and password are required" 
    });
  }

  // Use passport authentication
  passport.authenticate("local", (err: any, user: any, info: any) => {
    // Handle authentication errors
    if (err) {
      console.error("Login error:", err);
      return res.status(500).json({ 
        success: false,
        message: "Authentication error occurred" 
      });
    }
    
    // Handle failed authentication
    if (!user) {
      // Increment failed login attempts counter before sending response
      const ip = req.ip || 'unknown';
      const attempts = loginAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
      loginAttempts.set(ip, { 
        count: attempts.count + 1, 
        lastAttempt: Date.now() 
      });
      
      // Notify user of remaining attempts
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - attempts.count - 1;
      let message = info.message || "Invalid login credentials";
      
      if (attemptsLeft > 0 && attemptsLeft < MAX_LOGIN_ATTEMPTS) {
        message += `. ${attemptsLeft} attempt(s) remaining before temporary lockout.`;
      }
      
      return res.status(401).json({ 
        success: false,
        message 
      });
    }

    // Log the user in (establish session)
    req.login(user, (loginErr) => {
      if (loginErr) {
        console.error("Session establishment error:", loginErr);
        return res.status(500).json({ 
          success: false,
          message: "Failed to establish session" 
        });
      }
      
      // Reset failed login attempts on successful login
      const ip = req.ip || 'unknown';
      loginAttempts.delete(ip);
      
      // Return user information (excluding sensitive data)
      return res.json({
        success: true,
        message: "Login successful",
        user: { 
          username: user.username,
          // Only include non-sensitive user data
        },
      });
    });
  })(req, res, next);
});

/**
 * @route POST /auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post("/auth/register", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Input validation
  if (!username || !password) {
    return res.status(400).json({ 
      success: false,
      message: "Username and password are required" 
    });
  }
  
  // Username format validation
  if (!USERNAME_REGEX.test(username)) {
    return res.status(400).json({
      success: false,
      message: "Username must be 3-20 characters long and contain only letters, numbers, and underscores"
    });
  }
  
  // Password strength validation
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    return res.status(400).json({
      success: false,
      message: passwordValidation.message
    });
  }

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { username },
      select: { id: true } // Only retrieve id to check existence
    });
    
    if (existingUser) {
      return res.status(409).json({ 
        success: false,
        message: "Username already exists" 
      });
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    
    const newUser = await prisma.user.create({
      data: { 
        username, 
        password: hashedPassword 
      },
      select: {
        id: true,
        username: true,
        created_at: true,
        // Exclude password from response
      }
    });

    res.status(201).json({ 
      success: true,
      message: "User registered successfully",
      data: newUser 
    });
  } catch (err) {
    console.error("Registration error:", err);
    
    // Provide appropriate error response
    res.status(500).json({ 
      success: false,
      message: "Registration failed. Please try again later." 
    });
  }
});

/**
 * @route POST /auth/logout
 * @desc Logout a user and destroy their session
 * @access Private - Requires existing session
 */
authRouter.post("/logout", (req: Request, res: Response) => {
  // Check if user is authenticated
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      success: false,
      message: "No active session to logout" 
    });
  }

  // Use Passport's logout method
  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ 
        success: false,
        message: "Logout failed" 
      });
    }
    
    // Destroy the session
    req.session.destroy((sessionErr) => {
      if (sessionErr) {
        console.error("Session destruction error:", sessionErr);
        return res.status(500).json({ 
          success: false,
          message: "Failed to destroy session" 
        });
      }
      
      // Clear the session cookie
      res.clearCookie('connect.sid');
      
      // Return success response
      res.json({ 
        success: true,
        message: "Logout successful" 
      });
    });
  });
});

/**
 * @route GET /auth/check
 * @desc Check if user is authenticated
 * @access Public
 */
authRouter.get("/auth/check", (req: Request, res: Response) => {
  if (req.isAuthenticated()) {
    res.status(200).json({ 
      success: true,
      isAuthenticated: true,
      user: req.user 
    });
  } else {
    res.status(401).json({ 
      success: false,
      isAuthenticated: false,
      message: "Not authenticated" 
    });
  }
});

/**
 * Cleanup mechanism for login attempts map
 * Runs periodically to prevent memory leaks
 */
setInterval(() => {
  const now = Date.now();
  
  // Clean up entries older than the lockout period
  for (const [ip, data] of loginAttempts.entries()) {
    if (now - data.lastAttempt > LOCKOUT_TIME) {
      loginAttempts.delete(ip);
    }
  }
}, 15 * 60 * 1000); // Run cleanup every 15 minutes

export default authRouter;
