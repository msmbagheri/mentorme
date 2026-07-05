-- AlterTable
ALTER TABLE "FooterSetting" ADD COLUMN     "servicesHeading_en" TEXT,
ADD COLUMN     "servicesHeading_fa" TEXT,
ADD COLUMN     "servicesMenuId" TEXT;

-- AlterTable
ALTER TABLE "HomepageSection" ADD COLUMN     "fontFamily" TEXT;

-- AlterTable
ALTER TABLE "MediaAsset" ADD COLUMN     "posterUrl" TEXT;
