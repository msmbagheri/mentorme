-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "Locale" AS ENUM ('EN', 'FA');

-- CreateEnum
CREATE TYPE "GradeLevel" AS ENUM ('GRADE_6', 'GRADE_7', 'GRADE_8', 'GRADE_9', 'GRADE_10', 'GRADE_11', 'GRADE_12', 'TRANSFER');

-- CreateEnum
CREATE TYPE "CtaActionType" AS ENUM ('OPEN_LEAD_FORM', 'OPEN_CONTACT_PAGE', 'OPEN_CALENDLY', 'OPEN_CALCOM', 'INTERNAL_URL', 'EXTERNAL_URL', 'DOWNLOAD_ASSET');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "AuditAction" AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'PUBLISH', 'ARCHIVE', 'ROLLBACK', 'LOGIN', 'PERMISSION_CHANGE');

-- CreateEnum
CREATE TYPE "SectionGroup" AS ENUM ('TRUST', 'METHOD', 'PROOF', 'HUMAN', 'CONVERSION', 'FOOTER');

-- CreateEnum
CREATE TYPE "MenuItemType" AS ENUM ('SCROLL_TO_SECTION', 'INTERNAL_PAGE', 'EXTERNAL_URL');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'DOCUMENT');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'EDITOR',
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Page" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "meta_title_en" TEXT,
    "meta_title_fa" TEXT,
    "meta_description_en" TEXT,
    "meta_description_fa" TEXT,
    "ogImageUrl" TEXT,
    "canonicalUrl" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "isIndexed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HomepageSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "sectionType" TEXT NOT NULL,
    "stageGroup" "SectionGroup" NOT NULL,
    "orderIndex" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HomepageSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContentVersion" (
    "id" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "payload" JSONB NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContentVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HeroSection" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "eyebrow_en" TEXT,
    "eyebrow_fa" TEXT,
    "headline_en" TEXT NOT NULL,
    "headline_fa" TEXT NOT NULL,
    "subheadline_en" TEXT NOT NULL,
    "subheadline_fa" TEXT NOT NULL,
    "primaryCtaId" TEXT,
    "secondaryCtaId" TEXT,
    "heroImageUrl" TEXT,
    "heroImageAlt_en" TEXT,
    "heroImageAlt_fa" TEXT,
    "trustBadgeText_en" TEXT,
    "trustBadgeText_fa" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HeroSection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AsSeenInLogo" (
    "id" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT,
    "imageUrl" TEXT NOT NULL,
    "altText_en" TEXT,
    "altText_fa" TEXT,
    "url" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AsSeenInLogo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MethodologyStep" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "icon" TEXT,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_fa" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MethodologyStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Testimonial" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role_en" TEXT,
    "role_fa" TEXT,
    "company" TEXT,
    "content_en" TEXT NOT NULL,
    "content_fa" TEXT NOT NULL,
    "rating" INTEGER NOT NULL DEFAULT 5,
    "avatarUrl" TEXT,
    "avatarAlt_en" TEXT,
    "avatarAlt_fa" TEXT,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Testimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ValueProposition" (
    "id" TEXT NOT NULL,
    "icon" TEXT,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_fa" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ValueProposition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandPhilosophy" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "eyebrow_en" TEXT,
    "eyebrow_fa" TEXT,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_fa" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageAlt_en" TEXT,
    "imageAlt_fa" TEXT,
    "ctaId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandPhilosophy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuccessMetric" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "metricValue" TEXT NOT NULL,
    "metricLabel_en" TEXT NOT NULL,
    "metricLabel_fa" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SuccessMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FounderMessage" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fa" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "message_en" TEXT NOT NULL,
    "message_fa" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoAlt_en" TEXT,
    "photoAlt_fa" TEXT,
    "signatureUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FounderMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FinalCta" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "eyebrow_en" TEXT,
    "eyebrow_fa" TEXT,
    "headline_en" TEXT NOT NULL,
    "headline_fa" TEXT NOT NULL,
    "subheadline_en" TEXT,
    "subheadline_fa" TEXT,
    "trustStatement_en" TEXT,
    "trustStatement_fa" TEXT,
    "primaryCtaId" TEXT,
    "secondaryCtaId" TEXT,
    "backgroundImageUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinalCta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FooterSetting" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "tagline_en" TEXT,
    "tagline_fa" TEXT,
    "description_en" TEXT,
    "description_fa" TEXT,
    "copyright_en" TEXT,
    "copyright_fa" TEXT,
    "address_en" TEXT,
    "address_fa" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "businessHours_en" TEXT,
    "businessHours_fa" TEXT,
    "socialLinks" JSONB,
    "footerMenuId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FooterSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "shortDescription_en" TEXT NOT NULL,
    "shortDescription_fa" TEXT NOT NULL,
    "fullDescription_en" TEXT NOT NULL,
    "fullDescription_fa" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageAlt_en" TEXT,
    "imageAlt_fa" TEXT,
    "ctaId" TEXT,
    "metaTitle_en" TEXT,
    "metaTitle_fa" TEXT,
    "metaDescription_en" TEXT,
    "metaDescription_fa" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CaseStudy" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "outcomeBadge_en" TEXT NOT NULL,
    "outcomeBadge_fa" TEXT NOT NULL,
    "story_en" TEXT NOT NULL,
    "story_fa" TEXT NOT NULL,
    "fullStory_en" TEXT,
    "fullStory_fa" TEXT,
    "university" TEXT,
    "imageUrl" TEXT,
    "imageAlt_en" TEXT,
    "imageAlt_fa" TEXT,
    "ctaId" TEXT,
    "metaTitle_en" TEXT,
    "metaTitle_fa" TEXT,
    "metaDescription_en" TEXT,
    "metaDescription_fa" TEXT,
    "status" "ContentStatus" NOT NULL DEFAULT 'PUBLISHED',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CaseStudy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamCategory" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "name_fa" TEXT NOT NULL,
    "role_en" TEXT NOT NULL,
    "role_fa" TEXT NOT NULL,
    "bio_en" TEXT NOT NULL,
    "bio_fa" TEXT NOT NULL,
    "fullBio_en" TEXT,
    "fullBio_fa" TEXT,
    "photoUrl" TEXT,
    "photoAlt_en" TEXT,
    "photoAlt_fa" TEXT,
    "linkedinUrl" TEXT,
    "email" TEXT,
    "location" TEXT,
    "specialtyTags" JSONB,
    "isFeatured" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "shortDescription_en" TEXT NOT NULL,
    "shortDescription_fa" TEXT NOT NULL,
    "content_en" TEXT NOT NULL,
    "content_fa" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imageAlt_en" TEXT,
    "imageAlt_fa" TEXT,
    "location_en" TEXT,
    "location_fa" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "timezone" TEXT,
    "registrationUrl" TEXT,
    "registrationCtaId" TEXT,
    "capacity" INTEGER,
    "eventStatus" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "metaTitle_en" TEXT,
    "metaTitle_fa" TEXT,
    "metaDescription_en" TEXT,
    "metaDescription_fa" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventRegistration" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lead" (
    "id" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "grade" "GradeLevel",
    "country" TEXT,
    "source" TEXT,
    "campaignData" JSONB,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "assignedToId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadActivity" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "activityType" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" "AuditAction" NOT NULL,
    "entityType" TEXT,
    "entityId" TEXT,
    "details" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Menu" (
    "id" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Menu_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuItem" (
    "id" TEXT NOT NULL,
    "menuId" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "label_fa" TEXT NOT NULL,
    "type" "MenuItemType" NOT NULL,
    "internalUrl" TEXT,
    "externalUrl" TEXT,
    "sectionAnchor" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MenuItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GradeOption" (
    "id" TEXT NOT NULL,
    "grade" "GradeLevel" NOT NULL,
    "label_en" TEXT NOT NULL,
    "label_fa" TEXT NOT NULL,
    "ctaLabel_en" TEXT,
    "ctaLabel_fa" TEXT,
    "funnelMode" TEXT,
    "leadSource" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GradeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CtaConfig" (
    "id" TEXT NOT NULL,
    "internalName" TEXT NOT NULL,
    "label_en" TEXT NOT NULL,
    "label_fa" TEXT NOT NULL,
    "actionType" "CtaActionType" NOT NULL,
    "internalUrl" TEXT,
    "externalUrl" TEXT,
    "calendlyUrl" TEXT,
    "calcomUrl" TEXT,
    "assetUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CtaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ThemeSetting" (
    "id" TEXT NOT NULL,
    "brandName" TEXT NOT NULL,
    "tagline_en" TEXT NOT NULL,
    "tagline_fa" TEXT NOT NULL,
    "primaryLogoUrl" TEXT,
    "darkLogoUrl" TEXT,
    "mobileLogoUrl" TEXT,
    "faviconUrl" TEXT,
    "primaryColor" TEXT,
    "accentColor" TEXT,
    "ctaGradientStart" TEXT,
    "ctaGradientEnd" TEXT,
    "socialLinks" JSONB,
    "contactInformation" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThemeSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeoSetting" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "metaTitle_en" TEXT,
    "metaTitle_fa" TEXT,
    "metaDescription_en" TEXT,
    "metaDescription_fa" TEXT,
    "canonicalUrl" TEXT,
    "ogImageUrl" TEXT,
    "noIndex" BOOLEAN NOT NULL DEFAULT false,
    "noFollow" BOOLEAN NOT NULL DEFAULT false,
    "structuredData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeoSetting_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MediaAsset" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "mediaType" "MediaType" NOT NULL,
    "mimeType" TEXT,
    "fileSize" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "altText_en" TEXT,
    "altText_fa" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "Page"("slug");

-- CreateIndex
CREATE INDEX "HomepageSection_pageId_orderIndex_idx" ON "HomepageSection"("pageId", "orderIndex");

-- CreateIndex
CREATE UNIQUE INDEX "HomepageSection_pageId_sectionType_key" ON "HomepageSection"("pageId", "sectionType");

-- CreateIndex
CREATE INDEX "ContentVersion_entityType_entityId_idx" ON "ContentVersion"("entityType", "entityId");

-- CreateIndex
CREATE UNIQUE INDEX "ContentVersion_entityType_entityId_version_key" ON "ContentVersion"("entityType", "entityId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "HeroSection_pageId_key" ON "HeroSection"("pageId");

-- CreateIndex
CREATE INDEX "AsSeenInLogo_sortOrder_idx" ON "AsSeenInLogo"("sortOrder");

-- CreateIndex
CREATE INDEX "MethodologyStep_pageId_sortOrder_idx" ON "MethodologyStep"("pageId", "sortOrder");

-- CreateIndex
CREATE INDEX "Testimonial_isFeatured_idx" ON "Testimonial"("isFeatured");

-- CreateIndex
CREATE INDEX "Testimonial_sortOrder_idx" ON "Testimonial"("sortOrder");

-- CreateIndex
CREATE INDEX "ValueProposition_sortOrder_idx" ON "ValueProposition"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "BrandPhilosophy_pageId_key" ON "BrandPhilosophy"("pageId");

-- CreateIndex
CREATE INDEX "SuccessMetric_pageId_sortOrder_idx" ON "SuccessMetric"("pageId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "FounderMessage_pageId_key" ON "FounderMessage"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "FinalCta_pageId_key" ON "FinalCta"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "FooterSetting_pageId_key" ON "FooterSetting"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "Service_slug_key" ON "Service"("slug");

-- CreateIndex
CREATE INDEX "Service_isFeatured_idx" ON "Service"("isFeatured");

-- CreateIndex
CREATE INDEX "Service_status_idx" ON "Service"("status");

-- CreateIndex
CREATE INDEX "Service_sortOrder_idx" ON "Service"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CaseStudy_slug_key" ON "CaseStudy"("slug");

-- CreateIndex
CREATE INDEX "CaseStudy_isFeatured_idx" ON "CaseStudy"("isFeatured");

-- CreateIndex
CREATE INDEX "CaseStudy_status_idx" ON "CaseStudy"("status");

-- CreateIndex
CREATE INDEX "CaseStudy_sortOrder_idx" ON "CaseStudy"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TeamCategory_slug_key" ON "TeamCategory"("slug");

-- CreateIndex
CREATE INDEX "TeamCategory_sortOrder_idx" ON "TeamCategory"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "TeamMember_slug_key" ON "TeamMember"("slug");

-- CreateIndex
CREATE INDEX "TeamMember_categoryId_idx" ON "TeamMember"("categoryId");

-- CreateIndex
CREATE INDEX "TeamMember_sortOrder_idx" ON "TeamMember"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_eventStatus_idx" ON "Event"("eventStatus");

-- CreateIndex
CREATE INDEX "Event_startDate_idx" ON "Event"("startDate");

-- CreateIndex
CREATE INDEX "Event_isFeatured_idx" ON "Event"("isFeatured");

-- CreateIndex
CREATE INDEX "EventRegistration_eventId_idx" ON "EventRegistration"("eventId");

-- CreateIndex
CREATE INDEX "Lead_status_idx" ON "Lead"("status");

-- CreateIndex
CREATE INDEX "Lead_assignedToId_idx" ON "Lead"("assignedToId");

-- CreateIndex
CREATE INDEX "Lead_createdAt_idx" ON "Lead"("createdAt");

-- CreateIndex
CREATE INDEX "LeadActivity_leadId_idx" ON "LeadActivity"("leadId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Menu_internalName_key" ON "Menu"("internalName");

-- CreateIndex
CREATE INDEX "MenuItem_menuId_sortOrder_idx" ON "MenuItem"("menuId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GradeOption_grade_key" ON "GradeOption"("grade");

-- CreateIndex
CREATE INDEX "GradeOption_sortOrder_idx" ON "GradeOption"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "CtaConfig_internalName_key" ON "CtaConfig"("internalName");

-- CreateIndex
CREATE UNIQUE INDEX "SeoSetting_pageId_key" ON "SeoSetting"("pageId");

-- CreateIndex
CREATE INDEX "MediaAsset_mediaType_idx" ON "MediaAsset"("mediaType");

-- CreateIndex
CREATE INDEX "MediaAsset_createdAt_idx" ON "MediaAsset"("createdAt");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HomepageSection" ADD CONSTRAINT "HomepageSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_primaryCtaId_fkey" FOREIGN KEY ("primaryCtaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HeroSection" ADD CONSTRAINT "HeroSection_secondaryCtaId_fkey" FOREIGN KEY ("secondaryCtaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MethodologyStep" ADD CONSTRAINT "MethodologyStep_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandPhilosophy" ADD CONSTRAINT "BrandPhilosophy_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandPhilosophy" ADD CONSTRAINT "BrandPhilosophy_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuccessMetric" ADD CONSTRAINT "SuccessMetric_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FounderMessage" ADD CONSTRAINT "FounderMessage_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalCta" ADD CONSTRAINT "FinalCta_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalCta" ADD CONSTRAINT "FinalCta_primaryCtaId_fkey" FOREIGN KEY ("primaryCtaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FinalCta" ADD CONSTRAINT "FinalCta_secondaryCtaId_fkey" FOREIGN KEY ("secondaryCtaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FooterSetting" ADD CONSTRAINT "FooterSetting_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Service" ADD CONSTRAINT "Service_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CaseStudy" ADD CONSTRAINT "CaseStudy_ctaId_fkey" FOREIGN KEY ("ctaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "TeamCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_registrationCtaId_fkey" FOREIGN KEY ("registrationCtaId") REFERENCES "CtaConfig"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventRegistration" ADD CONSTRAINT "EventRegistration_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lead" ADD CONSTRAINT "Lead_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadActivity" ADD CONSTRAINT "LeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuItem" ADD CONSTRAINT "MenuItem_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "Menu"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeoSetting" ADD CONSTRAINT "SeoSetting_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;
