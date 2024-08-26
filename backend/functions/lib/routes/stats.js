"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const weight_1 = require("../models/weight");
const macros_1 = require("../models/macros");
const router = express_1.default.Router();
router.get("/stats/getMacros", async (req, res) => {
    const { username } = req.query;
    if (typeof username !== "string" || !username) {
        return res.status(400).send({ message: "Invalid username" });
    }
    try {
        const macros = await (0, macros_1.getMacros)(username);
        if (macros) {
            res.status(200).json(macros);
        }
        else {
            res.status(404).json({ message: "No entry found" });
        }
    }
    catch (err) {
        console.error(err);
        res.status(500).json({ message: err });
    }
});
router.post("/stats/upsertMacros", async (req, res) => {
    const { macros, username } = req.body;
    if (!username) {
        return res.status(400).send({ message: "Invalid username" });
    }
    if (!macros) {
        return res.status(400).send({ message: "Invalid macros" });
    }
    try {
        const result = await (0, macros_1.upsertMacros)(username, macros.calories, macros.protein, macros.fat, macros.carbs);
        res.status(201).json(result);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
});
router.get("/stats/getWeights", async (req, res) => {
    const { username } = req.query;
    if (typeof username !== "string" || !username) {
        return res.status(400).send({ message: "Invalid username" });
    }
    try {
        const result = await (0, weight_1.getWeights)(username);
        res.status(200).json(result);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
});
router.post("/stats/addWeight", async (req, res) => {
    const { username, weight } = req.body;
    if (typeof username !== "string" || !username) {
        return res.status(400).send({ message: "Invalid username" });
    }
    if (typeof weight !== "number" || !weight) {
        return res.status(400).send({ message: "Invalid weight" });
    }
    try {
        const result = await (0, weight_1.addWeight)(username, weight);
        res.status(201).json(result);
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).json({ message: err.message });
        }
        else {
            res.status(500).json({ message: err });
        }
    }
});
exports.default = router;
//# sourceMappingURL=stats.js.map