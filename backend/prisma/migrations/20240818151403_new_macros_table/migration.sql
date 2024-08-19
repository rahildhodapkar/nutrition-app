-- CreateTable
CREATE TABLE "Macros" (
    "id" SERIAL NOT NULL,
    "calories" INTEGER NOT NULL,
    "protein" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Macros_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Macros" ADD CONSTRAINT "Macros_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
