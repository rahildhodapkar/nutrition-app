"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const auth_1 = __importDefault(require("./routes/auth"));
const edamam_1 = __importDefault(require("./routes/edamam"));
const stats_1 = __importDefault(require("./routes/stats"));
const usda_1 = __importDefault(require("./routes/usda"));
dotenv_1.default.config();
const app = (0, express_1.default)();
function isAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.status(401).json({ message: "Unauthorized" });
}
app.use((0, express_session_1.default)({
    secret: process.env.SECRET_SESSION,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24, // 1 day
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        httpOnly: true,
    },
}));
app.use((0, cors_1.default)({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
}));
app.use(express_1.default.json());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.use("/", auth_1.default);
app.use("/", isAuthenticated, edamam_1.default);
app.use("/", isAuthenticated, usda_1.default);
app.use("/", isAuthenticated, stats_1.default);
app.get('/auth/check', isAuthenticated, (req, res) => {
    res.status(200).json({ user: req.user });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
//# sourceMappingURL=index.js.map