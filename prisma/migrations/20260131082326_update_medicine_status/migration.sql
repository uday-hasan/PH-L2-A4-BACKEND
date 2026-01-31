/*
  Warnings:

  - The `status` column on the `Medicine` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "STATUS" AS ENUM ('ACTIVE', 'INACTIVE');

-- AlterTable
ALTER TABLE "Medicine" DROP COLUMN "status",
ADD COLUMN     "status" "STATUS" NOT NULL DEFAULT 'ACTIVE';
