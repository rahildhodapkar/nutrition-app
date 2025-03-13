/**
 * Food Model - Handles data operations for user food entries
 * 
 * This module provides functions to interact with the food-related data in the database,
 * including retrieving, adding, updating, and deleting food entries.
 */

import prisma from "../prisma";

/**
 * Retrieves all food entries for a specific user on a given date
 * 
 * @param username - The username of the user
 * @param date - The date to fetch food entries for
 * @returns Promise resolving to an array of food entries
 */
export async function getFoodsAtDate(username: string, date: Date) {
  // Validate inputs
  if (!username || !date) {
    throw new Error("Username and date are required");
  }
  
  // Create start and end of day timestamps in UTC to ensure consistency
  const startOfDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );
  
  const endOfDay = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999
    )
  );

  try {
    // Fetch user with their foods for the specified date
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        foods: {
          where: {
            createdAt: {
              gte: startOfDay,
              lt: endOfDay,
            },
          },
          orderBy: {
            createdAt: 'asc', // Sort by creation time ascending
          },
        },
      },
    });

    return user?.foods || [];
  } catch (error) {
    console.error(`Error fetching foods for user ${username} on ${date}:`, error);
    throw new Error(`Failed to retrieve food entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Retrieves all food entries for a specific user
 * 
 * @param username - The username of the user
 * @returns Promise resolving to an array of all food entries
 */
export async function getAllFoods(username: string) {
  if (!username) {
    throw new Error("Username is required");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: {
        foods: {
          orderBy: {
            createdAt: 'desc', // Most recent foods first
          },
        },
      },
    });

    return user?.foods || [];
  } catch (error) {
    console.error(`Error fetching all foods for user ${username}:`, error);
    throw new Error(`Failed to retrieve all food entries: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Adds a new food entry for a user on a specific date
 * 
 * @param username - The username of the user
 * @param description - Food description
 * @param brandName - Brand name of the food (optional)
 * @param protein - Protein content in grams
 * @param fat - Fat content in grams
 * @param carbs - Carbohydrates content in grams
 * @param calories - Caloric content
 * @param date - The date when the food was consumed
 * @returns Promise resolving to the created food entry
 */
export async function addFoodAtDate(
  username: string,
  description: string,
  brandName: string | null,
  protein: number,
  fat: number,
  carbs: number,
  calories: number,
  date: Date
) {
  // Validate inputs
  if (!username || !description) {
    throw new Error("Username and description are required");
  }

  if (protein < 0 || fat < 0 || carbs < 0 || calories < 0) {
    throw new Error("Nutritional values cannot be negative");
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      throw new Error(`User '${username}' not found`);
    }

    // Normalize date to UTC to ensure consistent timezone handling
    const utcDate = new Date(
      Date.UTC(
        date.getUTCFullYear(),
        date.getUTCMonth(),
        date.getUTCDate(),
        date.getUTCHours(),
        date.getUTCMinutes(),
        date.getUTCSeconds(),
        date.getUTCMilliseconds()
      )
    );

    const newFood = await prisma.food.create({
      data: {
        description,
        brandName,
        protein,
        fat,
        carbs,
        calories,
        createdAt: utcDate,
        userId: user.id,
      },
    });

    return newFood;
  } catch (error) {
    console.error(`Error adding food for user ${username}:`, error);
    throw new Error(`Failed to add food entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Deletes a specific food entry by ID
 * 
 * @param foodId - The ID of the food entry to delete
 * @returns Promise resolving to the deleted food entry
 */
export async function deleteFoodById(foodId: number) {
  if (!foodId || isNaN(foodId)) {
    throw new Error("Valid food ID is required");
  }

  try {
    // Verify food exists before deleting
    const foodExists = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!foodExists) {
      throw new Error(`Food with ID ${foodId} not found`);
    }

    const deletedFood = await prisma.food.delete({
      where: { id: foodId },
    });

    return deletedFood;
  } catch (error) {
    console.error(`Error deleting food with ID ${foodId}:`, error);
    throw new Error(`Failed to delete food entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Updates a specific food entry by ID
 * 
 * @param foodId - The ID of the food entry to update
 * @param newDescription - Updated food description
 * @param newBrandName - Updated brand name
 * @param newProtein - Updated protein content
 * @param newFat - Updated fat content
 * @param newCarbs - Updated carbohydrates content
 * @param newCalories - Updated caloric content
 * @returns Promise resolving to the updated food entry
 */
export async function updateFoodById(
  foodId: number,
  newDescription: string,
  newBrandName: string | null,
  newProtein: number,
  newFat: number,
  newCarbs: number,
  newCalories: number
) {
  // Validate inputs
  if (!foodId || isNaN(foodId)) {
    throw new Error("Valid food ID is required");
  }

  if (!newDescription) {
    throw new Error("Food description is required");
  }

  if (newProtein < 0 || newFat < 0 || newCarbs < 0 || newCalories < 0) {
    throw new Error("Nutritional values cannot be negative");
  }

  try {
    // Verify food exists before updating
    const foodExists = await prisma.food.findUnique({
      where: { id: foodId },
    });

    if (!foodExists) {
      throw new Error(`Food with ID ${foodId} not found`);
    }

    const updatedFood = await prisma.food.update({
      where: { id: foodId },
      data: {
        description: newDescription,
        brandName: newBrandName,
        protein: newProtein,
        fat: newFat,
        carbs: newCarbs,
        calories: newCalories,
      },
    });

    return updatedFood;
  } catch (error) {
    console.error(`Error updating food with ID ${foodId}:`, error);
    throw new Error(`Failed to update food entry: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Gets food entries summary statistics for a user by day
 * 
 * @param username - The username of the user
 * @returns Promise resolving to an object with daily totals
 */
export async function getFoodStatsByDay(username: string) {
  if (!username) {
    throw new Error("Username is required");
  }

  try {
    const foods = await getAllFoods(username);
    
    // Group foods by day and calculate totals
    const statsByDay = foods.reduce((acc, food) => {
      const day = new Date(food.createdAt).toISOString().split('T')[0];
      
      if (!acc[day]) {
        acc[day] = {
          date: day,
          totalCalories: 0,
          totalProtein: 0,
          totalFat: 0,
          totalCarbs: 0,
          entries: 0
        };
      }
      
      acc[day].totalCalories += food.calories;
      acc[day].totalProtein += food.protein;
      acc[day].totalFat += food.fat;
      acc[day].totalCarbs += food.carbs;
      acc[day].entries += 1;
      
      return acc;
    }, {});
    
    return Object.values(statsByDay);
  } catch (error) {
    console.error(`Error getting food stats for user ${username}:`, error);
    throw new Error(`Failed to retrieve food statistics: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
