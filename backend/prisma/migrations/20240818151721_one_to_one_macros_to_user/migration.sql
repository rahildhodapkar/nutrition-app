/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `Macros` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Macros_userId_key" ON "Macros"("userId");
