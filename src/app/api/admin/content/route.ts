import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, created, fail } from "@/lib/api-response";
import type { Resource, Capability } from "@/lib/permissions";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import {
  isContentEntityType,
  createContent,
  updateContent,
  deleteContent,
  publishEntity,
  archiveEntity,
  rollback,
  type ContentEntityType,
} from "@/services/content.service";
import { record } from "@/services/audit.service";
import {
  serviceCreateSchema,
  serviceUpdateSchema,
  caseStudyCreateSchema,
  caseStudyUpdateSchema,
  teamMemberCreateSchema,
  teamMemberUpdateSchema,
  teamCategoryCreateSchema,
  teamCategoryUpdateSchema,
  eventCreateSchema,
  eventUpdateSchema,
  testimonialCreateSchema,
  testimonialUpdateSchema,
  valuePropCreateSchema,
  valuePropUpdateSchema,
  methodologyStepCreateSchema,
  methodologyStepUpdateSchema,
  heroCreateSchema,
  heroUpdateSchema,
  brandPhilosophyCreateSchema,
  brandPhilosophyUpdateSchema,
  founderCreateSchema,
  founderUpdateSchema,
  finalCtaCreateSchema,
  finalCtaUpdateSchema,
  footerCreateSchema,
  footerUpdateSchema,
  asSeenInCreateSchema,
  asSeenInUpdateSchema,
  successMetricCreateSchema,
  successMetricUpdateSchema,
  pageCreateSchema,
  pageUpdateSchema,
} from "@/lib/validation/cms.schema";

/** entityType → { create/update schema, RBAC resource }. */
const ENTITY_MAP: Record<
  ContentEntityType,
  { create: z.ZodTypeAny; update: z.ZodTypeAny; resource: Resource }
> = {
  Service: { create: serviceCreateSchema, update: serviceUpdateSchema, resource: "services" },
  CaseStudy: {
    create: caseStudyCreateSchema,
    update: caseStudyUpdateSchema,
    resource: "case-studies",
  },
  TeamMember: {
    create: teamMemberCreateSchema,
    update: teamMemberUpdateSchema,
    resource: "team",
  },
  TeamCategory: {
    create: teamCategoryCreateSchema,
    update: teamCategoryUpdateSchema,
    resource: "team",
  },
  Event: { create: eventCreateSchema, update: eventUpdateSchema, resource: "events" },
  Testimonial: {
    create: testimonialCreateSchema,
    update: testimonialUpdateSchema,
    resource: "testimonials",
  },
  ValueProposition: {
    create: valuePropCreateSchema,
    update: valuePropUpdateSchema,
    resource: "homepage",
  },
  MethodologyStep: {
    create: methodologyStepCreateSchema,
    update: methodologyStepUpdateSchema,
    resource: "homepage",
  },
  HeroSection: { create: heroCreateSchema, update: heroUpdateSchema, resource: "homepage" },
  BrandPhilosophy: {
    create: brandPhilosophyCreateSchema,
    update: brandPhilosophyUpdateSchema,
    resource: "homepage",
  },
  FounderMessage: {
    create: founderCreateSchema,
    update: founderUpdateSchema,
    resource: "homepage",
  },
  FinalCta: { create: finalCtaCreateSchema, update: finalCtaUpdateSchema, resource: "homepage" },
  FooterSetting: {
    create: footerCreateSchema,
    update: footerUpdateSchema,
    resource: "homepage",
  },
  SuccessMetric: {
    create: successMetricCreateSchema,
    update: successMetricUpdateSchema,
    resource: "homepage",
  },
  AsSeenInLogo: {
    create: asSeenInCreateSchema,
    update: asSeenInUpdateSchema,
    resource: "homepage",
  },
  Page: { create: pageCreateSchema, update: pageUpdateSchema, resource: "pages" },
};

function readEntityType(value: unknown): ContentEntityType | null {
  if (typeof value !== "string" || !isContentEntityType(value)) return null;
  return value;
}

export async function POST(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;

    const body = await req.json().catch(() => ({}));
    const entityType = readEntityType(body.entityType);
    if (!entityType) return fail("INVALID_ENTITY", "Unknown or missing entityType.", 400);
    const map = ENTITY_MAP[entityType];

    assertCan(ctx.role, "create", map.resource);
    const data = map.create.parse(body.data ?? {}) as Record<string, unknown>;
    const result = await createContent(entityType, data, ctx.userId);
    await record({
      userId: ctx.userId,
      action: "CREATE",
      entityType,
      entityId: (result as { id: string }).id,
      details: `Created ${entityType}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return created(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;

    const body = await req.json().catch(() => ({}));
    const entityType = readEntityType(body.entityType);
    if (!entityType) return fail("INVALID_ENTITY", "Unknown or missing entityType.", 400);
    const map = ENTITY_MAP[entityType];

    const action = typeof body.action === "string" ? body.action : "update";

    // Publish / archive / rollback workflow operations require publish capability.
    if (action === "publish" || action === "archive" || action === "rollback") {
      assertCan(ctx.role, "publish" as Capability, map.resource);
      const id = z.string().uuid().parse(body.id);
      let result;
      if (action === "publish") result = await publishEntity(entityType, id, ctx.userId);
      else if (action === "archive") result = await archiveEntity(entityType, id, ctx.userId);
      else {
        const version = z.number().int().parse(body.version);
        result = await rollback(entityType, id, version, ctx.userId);
      }
      return ok(result);
    }

    assertCan(ctx.role, "update", map.resource);
    const parsed = map.update.parse(body.data ?? body) as { id: string } & Record<
      string,
      unknown
    >;
    const { id, ...data } = parsed;
    const result = await updateContent(entityType, id, data, ctx.userId);
    await record({
      userId: ctx.userId,
      action: "UPDATE",
      entityType,
      entityId: id,
      details: `Updated ${entityType}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok(result);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;

    const entityTypeParam = req.nextUrl.searchParams.get("entityType");
    const idParam = req.nextUrl.searchParams.get("id");
    const entityType = readEntityType(entityTypeParam);
    if (!entityType) return fail("INVALID_ENTITY", "Unknown or missing entityType.", 400);
    const id = z.string().uuid().parse(idParam);
    const map = ENTITY_MAP[entityType];

    assertCan(ctx.role, "delete", map.resource);
    await deleteContent(entityType, id);
    await record({
      userId: ctx.userId,
      action: "DELETE",
      entityType,
      entityId: id,
      details: `Deleted ${entityType}.`,
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
    return ok({ id });
  } catch (error) {
    return handleApiError(error);
  }
}
