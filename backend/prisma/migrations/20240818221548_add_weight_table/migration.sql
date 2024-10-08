-- CreateTable
CREATE TABLE "Weight" (
    "id" SERIAL NOT NULL,
    "weight" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Weight_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Weight" ADD CONSTRAINT "Weight_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
