import prisma from "../prisma";

export async function getMacros(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      macros: true,
    },
  });

  return user?.macros || null;
}

export async function upsertMacros(
  username: string,
  calories: string,
  protein: string,
  fat: string,
  carbs: string
) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new Error(`User with username ${username} not found`);
  }

  const macros = await prisma.macros.upsert({
    where: {
      userId: user.id, 
    },
    update: {
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      carbs: parseFloat(carbs),
    },
    create: {
      calories: parseFloat(calories),
      protein: parseFloat(protein),
      fat: parseFloat(fat),
      carbs: parseFloat(carbs),
      userId: user.id, 
    },
  });

  return macros;
}

