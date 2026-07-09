-- AlterTable
ALTER TABLE "FooterSetting" ADD COLUMN     "badges" JSONB,
ADD COLUMN     "showServices" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "HomepageSection" ADD COLUMN     "cardBgColor" TEXT,
ADD COLUMN     "fontScale" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "Page" ADD COLUMN     "body_en" TEXT,
ADD COLUMN     "body_fa" TEXT;
