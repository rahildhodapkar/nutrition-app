/**
 * USDA API Routes
 * 
 * Handles all routes related to food data, including:
 * - Searching the USDA food database
 * - Managing user food entries (add, get, update, delete)
 */

import express, { Request, Response } from "express";
import {
  addFoodAtDate,
  deleteFoodById,
  getFoodsAtDate,
  getAllFoods,
  updateFoodById,
  getFoodStatsByDay
} from "../models/food";

const router = express.Router();

/**
 * @route GET /usda
 * @desc Search the USDA food database
 * @access Private - Requires authentication
 */
router.get("/usda", async (req: Request, res: Response) => {
  const { query } = req.query;

  // Input validation
  if (typeof query !== "string") {
    return res.status(400).json({ 
      success: false,
      message: "Query parameter must be a string" 
    });
  }

  if (!query.trim()) {
    return res.status(400).json({ 
      success: false,
      message: "Search query is required" 
    });
  }

  // API key validation
  const USDA_KEY = process.env.USDA_KEY;
  if (!USDA_KEY) {
    console.error("Missing USDA API key in environment variables");
    return res.status(500).json({ 
      success: false,
      message: "Server configuration error: Missing API key" 
    });
  }

  try {
    // Construct API URL with proper encoding
    const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${USDA_KEY}&query=${encodeURIComponent(
      query
    )}&dataType=Branded`;

    // Make the request to USDA API
    const response = await fetch(url, {
      headers: {
        "Accept": "application/json"
      }
    });

    // Handle non-200 responses explicitly
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`USDA API Error (${response.status}):`, errorData);
      
      return res.status(response.status).json({ 
        success: false,
        message: "Failed to fetch foods from USDA API",
        details: errorData.message || "Unknown error" 
      });
    }

    const result = await response.json();
    
    // Return the successful response
    res.status(200).json(result);
  } catch (err) {
    console.error(`Error during USDA API request:`, err);
    res.status(500).json({ 
      success: false,
      message: "Internal server error while fetching food data" 
    });
  }
});

/**
 * @route POST /usda/addFood
 * @desc Add a new food entry for a user
 * @access Private - Requires authentication
 */
router.post("/usda/addFood", async (req: Request, res: Response) => {
  const { username, description, brandName, protein, fat, carbs, calories, createdAt } = req.body;

  // Input validation
  if (!username || !description) {
    return res.status(400).json({ 
      success: false,
      message: "Username and food description are required" 
    });
  }

  if (isNaN(protein) || isNaN(fat) || isNaN(carbs) || isNaN(calories)) {
    return res.status(400).json({ 
      success: false,
      message: "Nutritional values must be valid numbers" 
    });
  }

  try {
    // Parse date if provided, otherwise use current date
    const date = createdAt ? new Date(createdAt) : new Date();
    
    // Validate date format
    if (isNaN(date.getTime())) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid date format" 
      });
    }

    // Add the food entry
    const newFood = await addFoodAtDate(
      username,
      description,
      brandName,
      parseFloat(protein),
      parseFloat(fat),
      parseFloat(carbs),
      parseFloat(calories),
      date 
    );
    
    res.status(201).json({
      success: true,
      message: "Food entry added successfully",
      data: newFood
    });
  } catch (error) {
    console.error("Error adding food entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    res.status(500).json({ 
      success: false,
      message: "Failed to add food entry",
      details: errorMessage
    });
  }
});

/**
 * @route GET /usda/getFoods
 * @desc Get all food entries for a user on a specific date
 * @access Private - Requires authentication
 */
router.get("/usda/getFoods", async (req: Request, res: Response) => {
  const { username, createdAt } = req.query;

  // Input validation
  if (typeof username !== "string" || !username) {
    return res.status(400).json({ 
      success: false,
      message: "Valid username is required" 
    });
  }

  if (typeof createdAt !== "string" || !createdAt) {
    return res.status(400).json({ 
      success: false,
      message: "Valid date is required" 
    });
  }

  try {
    // Parse and validate the date
    const date = new Date(createdAt);
    if (isNaN(date.getTime())) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid date format" 
      });
    }

    // Get foods for the specified date
    const foods = await getFoodsAtDate(username, date);
    
    if (foods.length > 0) {
      res.status(200).json(foods);
    } else {
      res.status(404).json({ 
        success: false,
        message: "No food entries found for this date" 
      });
    }
  } catch (error) {
    console.error("Error retrieving food entries:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve food entries",
      details: errorMessage
    });
  }
});

/**
 * @route GET /usda/getAllFoods
 * @desc Get all food entries for a user
 * @access Private - Requires authentication
 */
router.get("/usda/getAllFoods", async (req: Request, res: Response) => {
  const { username } = req.query;

  // Input validation
  if (typeof username !== "string" || !username) {
    return res.status(400).json({ 
      success: false,
      message: "Valid username is required" 
    });
  }

  try {
    // Get all food entries for the user
    const foods = await getAllFoods(username);
    
    if (foods.length > 0) {
      res.status(200).json(foods);
    } else {
      res.status(404).json({ 
        success: false,
        message: "No food entries found for this user" 
      });
    }
  } catch (error) {
    console.error("Error retrieving all food entries:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve food entries",
      details: errorMessage
    });
  }
});

/**
 * @route GET /usda/getFoodStats
 * @desc Get food statistics grouped by day
 * @access Private - Requires authentication
 */
router.get("/usda/getFoodStats", async (req: Request, res: Response) => {
  const { username } = req.query;

  // Input validation
  if (typeof username !== "string" || !username) {
    return res.status(400).json({ 
      success: false,
      message: "Valid username is required" 
    });
  }

  try {
    // Get food statistics
    const stats = await getFoodStatsByDay(username);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error("Error retrieving food statistics:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    res.status(500).json({ 
      success: false,
      message: "Failed to retrieve food statistics",
      details: errorMessage
    });
  }
});

/**
 * @route PUT /usda/updateFood
 * @desc Update a specific food entry
 * @access Private - Requires authentication
 */
router.put("/usda/updateFood", async (req: Request, res: Response) => {
  const {
    foodId,
    newDescription,
    newBrandName,
    newProtein,
    newFat,
    newCarbs,
    newCalories,
  } = req.body;

  // Input validation
  if (!foodId || isNaN(parseInt(foodId))) {
    return res.status(400).json({ 
      success: false,
      message: "Valid food ID is required" 
    });
  }

  if (!newDescription) {
    return res.status(400).json({ 
      success: false,
      message: "Food description is required" 
    });
  }

  if (isNaN(newProtein) || isNaN(newFat) || isNaN(newCarbs) || isNaN(newCalories)) {
    return res.status(400).json({ 
      success: false,
      message: "Nutritional values must be valid numbers" 
    });
  }

  try {
    // Update the food entry
    const updatedFood = await updateFoodById(
      parseInt(foodId),
      newDescription,
      newBrandName,
      parseFloat(newProtein),
      parseFloat(newFat),
      parseFloat(newCarbs),
      parseFloat(newCalories)
    );
    
    res.status(200).json({
      success: true,
      message: "Food entry updated successfully",
      data: updatedFood
    });
  } catch (error) {
    console.error("Error updating food entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    res.status(500).json({ 
      success: false,
      message: "Failed to update food entry",
      details: errorMessage
    });
  }
});

/**
 * @route DELETE /usda/deleteFood
 * @desc Delete a specific food entry
 * @access Private - Requires authentication
 */
router.delete("/usda/deleteFood", async (req: Request, res: Response) => {
  const { foodId } = req.body;

  // Input validation
  if (!foodId || isNaN(parseInt(foodId))) {
    return res.status(400).json({ 
      success: false,
      message: "Valid food ID is required" 
    });
  }

  try {
    // Delete the food entry
    const deletedFood = await deleteFoodById(parseInt(foodId));
    
    res.status(200).json({
      success: true,
      message: "Food entry deleted successfully",
      data: deletedFood
    });
  } catch (error) {
    console.error("Error deleting food entry:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    res.status(500).json({ 
      success: false,
      message: "Failed to delete food entry",
      details: errorMessage
    });
  }
});

export default router;
