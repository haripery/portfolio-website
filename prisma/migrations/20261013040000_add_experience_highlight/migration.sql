-- AlterTable
ALTER TABLE "Experience" ADD COLUMN     "headline" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "ExperienceHighlight" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL DEFAULT '',
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "experienceId" TEXT NOT NULL,

    CONSTRAINT "ExperienceHighlight_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExperienceHighlight_experienceId_idx" ON "ExperienceHighlight"("experienceId");

-- AddForeignKey
ALTER TABLE "ExperienceHighlight" ADD CONSTRAINT "ExperienceHighlight_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
