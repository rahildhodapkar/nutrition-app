import bcrypt from "bcryptjs";
import express from "express";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import prisma from "../prisma";

const authRouter = express.Router();

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { username } });
      if (!user) {
        return done(null, false, { message: "Incorrect username" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "Incorrect password" });
      }
      return done(null, user);
    } catch (err) {
      console.error("error in local strategy", err);
      return done(err);
    }
  })
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    if (user) {
      done(null, user);
    } else {
      done(new Error("User not found"));
    }
  } catch (err) {
    done(err);
  }
});

authRouter.post("/auth/login", (req, res) => {
  passport.authenticate("local", (err: any, user: any, info: any) => {
    if (err || !user) {
      return res.status(400).json({ message: info.message });
    }
    req.login(user, (err) => {
      if (err) {
        return res.status(500).json({ message: "Login failed" });
      }
      // Log headers to verify the session cookie
      console.log('Response headers:', res.getHeaders());
      return res.json({
        message: "Login successful",
        user: { username: user.username },
      });
    });
  })(req, res);
});

authRouter.post("/auth/register", async (req, res) => {
  const { username, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json(newUser);
  } catch (err) {
    res.status(400).json({ error: "User registration failed" });
  }
});

authRouter.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to destroy session" });
      }
      res.clearCookie('connect.sid');  // Clear the session cookie
      res.json({ message: "Logout successful" });
    });
  });
});

export default authRouter;
