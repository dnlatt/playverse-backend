/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `platforms` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `platforms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."platforms" ADD COLUMN     "slug" VARCHAR(50) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "platforms_slug_key" ON "public"."platforms"("slug");
