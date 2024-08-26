"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = require("passport-local");
const prisma_1 = __importDefault(require("../prisma"));
const authRouter = express_1.default.Router();
passport_1.default.use(new passport_local_1.Strategy(async (username, password, done) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { username } });
        if (!user) {
            return done(null, false, { message: "Incorrect username" });
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return done(null, false, { message: "Incorrect password" });
        }
        return done(null, user);
    }
    catch (err) {
        console.error("error in local strategy", err);
        return done(err);
    }
}));
passport_1.default.serializeUser((user, done) => {
    done(null, user.id);
});
passport_1.default.deserializeUser(async (id, done) => {
    try {
        const user = await prisma_1.default.user.findUnique({ where: { id } });
        if (user) {
            done(null, user);
        }
        else {
            done(new Error("User not found"));
        }
    }
    catch (err) {
        done(err);
    }
});
authRouter.post("/auth/login", (req, res) => {
    passport_1.default.authenticate("local", (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({ message: info.message });
        }
        req.login(user, (err) => {
            if (err) {
                return res.status(500).json({ message: "Login failed" });
            }
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.default.user.create({
            data: { username, password: hashedPassword },
        });
        res.status(201).json(newUser);
    }
    catch (err) {
        res.status(400).json({ error: "User registration failed" });
    }
});
authRouter.get("/logout", (req, res) => {
    req.logout((err) => {
        if (err) {
            return res.status(500).json({ message: "Logout failed" });
        }
        res.json({ message: "Logout successful" });
    });
});
exports.default = authRouter;
//# sourceMappingURL=auth.js.map