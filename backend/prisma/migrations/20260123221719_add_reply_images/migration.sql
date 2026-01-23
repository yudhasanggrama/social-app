/*
  Warnings:

  - The `image` column on the `Reply` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Reply" DROP COLUMN "image",
ADD COLUMN     "image" TEXT[];
