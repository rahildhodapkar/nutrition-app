"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFoodsAtDate = getFoodsAtDate;
exports.getAllFoods = getAllFoods;
exports.addFoodAtDate = addFoodAtDate;
exports.deleteFoodById = deleteFoodById;
exports.updateFoodById = updateFoodById;
const prisma_1 = __importDefault(require("../prisma"));
async function getFoodsAtDate(username, date) {
    const startOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0));
    const endOfDay = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999));
    const user = await prisma_1.default.user.findUnique({
        where: { username },
        include: {
            foods: {
                where: {
                    createdAt: {
                        gte: startOfDay,
                        lt: endOfDay,
                    },
                },
            },
        },
    });
    return user?.foods || [];
}
async function getAllFoods(username) {
    const user = await prisma_1.default.user.findUnique({
        where: { username },
        include: {
            foods: true,
        },
    });
    return user?.foods || [];
}
async function addFoodAtDate(username, description, brandName, protein, fat, carbs, calories, date) {
    const user = await prisma_1.default.user.findUnique({
        where: { username },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const utcDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds(), date.getUTCMilliseconds()));
    const newFood = await prisma_1.default.food.create({
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
}
async function deleteFoodById(foodId) {
    const deletedFood = await prisma_1.default.food.delete({
        where: { id: foodId },
    });
    return deletedFood;
}
async function updateFoodById(foodId, newDescription, newBrandName, newProtein, newFat, newCarbs, newCalories) {
    const updatedFood = await prisma_1.default.food.update({
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
}
//# sourceMappingURL=food.js.map