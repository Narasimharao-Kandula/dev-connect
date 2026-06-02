-- AlterTable
ALTER TABLE "Review" ADD COLUMN     "communication" INTEGER,
ADD COLUMN     "reliability" INTEGER,
ADD COLUMN     "teamwork" INTEGER,
ADD COLUMN     "technicalSkill" INTEGER;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "collaborationScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "projectSuccessCount" INTEGER NOT NULL DEFAULT 0;
