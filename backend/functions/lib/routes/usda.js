"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const food_1 = require("../models/food");
const router = express_1.default.Router();
router.get("/usda", async (req, res) => {
    const { query } = req.query;
    if (typeof query !== "string") {
        return res.status(400).send({ message: "Query must be string" });
    }
    if (!query) {
        return res.status(400).send({ message: "Query is required" });
    }
    const USDA_KEY = process.env.USDA_KEY;
    if (!USDA_KEY) {
        return res.status(500).send({ message: "Server configuration error" });
    }
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_KEY}&query=${encodeURIComponent(query)}&dataType=Branded`;
    try {
        const response = await fetch(url);
        const result = await response.json();
        if (response.ok) {
            res.status(200).send(result);
        }
        else {
            console.error(`API Error: ${result.message}`);
            res.status(400).send({ message: "Failed to fetch foods" });
        }
    }
    catch (err) {
        console.error(`Fetch error: ${err}`);
        res.status(500).send({ message: "Internal server error" });
    }
});
router.post("/usda/addFood", async (req, res) => {
    const { username, description, brandName, protein, fat, carbs, calories, createdAt } = req.body;
    try {
        const date = new Date(createdAt);
        const newFood = await (0, food_1.addFoodAtDate)(username, description, brandName, protein, fat, carbs, calories, date);
        res.status(201).json(newFood);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
router.get("/usda/getFoods", async (req, res) => {
    const { username, createdAt } = req.query;
    try {
        const foods = await (0, food_1.getFoodsAtDate)(username, new Date(createdAt));
        if (foods.length > 0) {
            res.status(200).json(foods);
        }
        else {
            res.status(404).json({ message: "No entries found for this date" });
        }
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
router.get("/usda/getAllFoods", async (req, res) => {
    const { username } = req.query;
    try {
        const foods = await (0, food_1.getAllFoods)(username);
        if (foods.length > 0) {
            res.status(200).json(foods);
        }
        else {
            res.status(404).json({ message: "No entries found for this date!" });
        }
    }
    catch (err) {
        res.status(500).json({ message: err });
    }
});
router.put("/usda/updateFood", async (req, res) => {
    const { foodId, newDescription, newBrandName, newProtein, newFat, newCarbs, newCalories, } = req.body;
    try {
        const updatedFood = await (0, food_1.updateFoodById)(foodId, newDescription, newBrandName, newProtein, newFat, newCarbs, newCalories);
        res.status(200).json(updatedFood);
    }
    catch (error) {
        res.status(500).json({ message: error });
    }
});
router.delete("/usda/deleteFood", async (req, res) => {
    const { foodId } = req.body;
    try {
        const deletedFood = await (0, food_1.deleteFoodById)(foodId);
        res.status(200).json(deletedFood);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error, please try again later" });
    }
});
exports.default = router;
//# sourceMappingURL=usda.js.map