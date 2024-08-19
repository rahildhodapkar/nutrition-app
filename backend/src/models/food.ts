import prisma from "../prisma";

export async function getFoodsAtDate(username: string, date: Date) {
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
      },
    },
  });

  return user?.foods || [];
}

export async function getAllFoods(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      foods: true,
    },
  });

  return user?.foods || [];
}

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
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

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
}

export async function deleteFoodById(foodId: number) {
  const deletedFood = await prisma.food.delete({
    where: { id: foodId },
  });

  return deletedFood;
}

export async function updateFoodById(
  foodId: number,
  newDescription: string,
  newBrandName: string | null,
  newProtein: number,
  newFat: number,
  newCarbs: number,
  newCalories: number
) {
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
}
