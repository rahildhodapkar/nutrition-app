import bcrypt from "bcryptjs";
import prisma from "../prisma";

const saltNumber = 10;

export async function getUser(username: string) {
  const user = await prisma.users.findFirst({
    where: {
      username: username,
    },
  });
  return user;
}

export async function createUser(username: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, saltNumber);
  const user = await prisma.users.create({
    data: {
      username: username,
      password: hashedPassword,
    },
  });
  return user;
}
