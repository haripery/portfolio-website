-- CreateTable
CREATE TABLE "ExperienceMetric" (
    "id" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "experienceId" TEXT NOT NULL,

    CONSTRAINT "ExperienceMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExperienceMetric_experienceId_idx" ON "ExperienceMetric"("experienceId");

-- AddForeignKey
ALTER TABLE "ExperienceMetric" ADD CONSTRAINT "ExperienceMetric_experienceId_fkey" FOREIGN KEY ("experienceId") REFERENCES "Experience"("id") ON DELETE CASCADE ON UPDATE CASCADE;
