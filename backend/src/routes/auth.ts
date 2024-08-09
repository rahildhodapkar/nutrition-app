import bcrypt from "bcryptjs";
import express from "express";
import jwt from "jsonwebtoken";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createUser } from "../models/users";
import prisma from "../prisma";
const authRouter = express.Router();

passport.use(
  new LocalStrategy(async (username: string, password: string, done: any) => {
    try {
      const user = await prisma.users.findUnique({
        where: { username: username },
      });
      if (!user) {
        return done(null, false, { message: "username" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return done(null, false, { message: "password" });
      }
      return done(null, user);
    } catch (err) {
      console.error("error in local strategy", err);
      return done(err);
    }
  })
);

const JWT_SECRET = process.env.JWT_SECRET || "jwt_secret_here";

authRouter.post("/login", (req, res, next) => {
  passport.authenticate(
    "local",
    { session: false },
    (err: any, user: any, info: any) => {
      if (err || !user) {
        return res.status(400).json({
          message: err ? "Unexpected error" : info.message === "username" ? "Incorrect username" : "Incorrect password",
          user: user,
        });
      }
      req.login(user, { session: false }, (err) => {
        if (err) {
          res.send(err);
        }
        const token = jwt.sign(
          { id: user.id, username: user.username, password: user.password },
          JWT_SECRET,
          { expiresIn: "1h" }
        );
        return res.json({ user, token });
      });
    }
  )(req, res);
});

authRouter.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const user = await createUser(username, password);
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: "User registration failed" });
  }
});

export default authRouter;
