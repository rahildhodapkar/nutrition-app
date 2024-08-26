import prisma from "../prisma";

export async function getWeights(username: string) {
  const user = await prisma.user.findUnique({
    where: { username },
    include: {
      weights: true,
    },
  });

  return user?.weights || [];
}

export async function addWeight(username: string, weight: number) {
  const user = await prisma.user.findUnique({
    where: { username },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const newWeight = await prisma.weight.create({
    data: {
      weight: weight,
      userId: user.id,
    },
  });

  return newWeight;
}
