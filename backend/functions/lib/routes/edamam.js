"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
router.get("/edamam", async (req, res) => {
    const { ingredients, calories } = req.query;
    if (typeof calories !== "string" || typeof ingredients !== "string") {
        return res
            .status(400)
            .send({ message: "Calories and ingredients must be strings" });
    }
    if (!calories || !ingredients) {
        return res
            .status(400)
            .send({ message: "Calories and ingredients are required" });
    }
    const EDAMAM_APP_ID = process.env.EDAMAM_APP_ID;
    const EDAMAM_APP_KEY = process.env.EDAMAM_APP_KEY;
    if (!EDAMAM_APP_ID || !EDAMAM_APP_KEY) {
        return res.status(500).send({ message: "Server configuration error" });
    }
    const url = `https://api.edamam.com/api/recipes/v2?type=public&q=${encodeURIComponent(ingredients)}&app_id=${EDAMAM_APP_ID}&app_key=${EDAMAM_APP_KEY}&calories=${encodeURIComponent(calories)}`;
    try {
        const response = await fetch(url);
        const result = await response.json();
        if (response.ok) {
            res.status(200).send(result);
        }
        else {
            console.error(`API Error: ${result.message}`);
            res.status(400).send({ message: "Failed to fetch recipes" });
        }
    }
    catch (err) {
        console.error("Fetch error:", err);
        res.status(500).send({ message: "Internal server error" });
    }
});
exports.default = router;
//# sourceMappingURL=edamam.js.map