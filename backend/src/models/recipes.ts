import prisma from "../prisma";

export async function getAllRecipes(username: string) {
  const recipes = await prisma.recipes.findMany({
    where: {
      username: username,
    },
  });
  return recipes;
}

export async function addRecipe(
  username: string,
  recipeLabel: string,
  recipeUrl: string
) {
  const recipe = await prisma.recipes.create({
    data: {
      username: username,
      recipe_label: recipeLabel,
      recipe_url: recipeUrl,
    },
  });
  return recipe;
}

export async function removeRecipe(username: string, recipeLabel: string) {
  const deleteRecipe = await prisma.recipes.delete({
    where: {
      username_recipe_label: { username: username, recipe_label: recipeLabel },
    },
  });
  return deleteRecipe;
}
