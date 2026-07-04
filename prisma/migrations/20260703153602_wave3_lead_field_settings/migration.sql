-- CreateTable
CREATE TABLE "LeadFieldSetting" (
    "id" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "isShown" BOOLEAN NOT NULL DEFAULT true,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadFieldSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LeadFieldSetting_field_key" ON "LeadFieldSetting"("field");
