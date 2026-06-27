import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail } from "@/lib/api-response";
import type { Resource } from "@/lib/permissions";
import { assertCan } from "@/lib/permissions";
import { requireAdmin, isResponse, handleApiError } from "@/lib/api/admin-guard";
import { isContentEntityType, listVersions } from "@/services/content.service";

/** Maps a content entityType to the RBAC resource that governs reading it. */
const ENTITY_RESOURCE: Record<string, Resource> = {
  Service: "services",
  CaseStudy: "case-studies",
  TeamMember: "team",
  TeamCategory: "team",
  Event: "events",
  Testimonial: "testimonials",
  ValueProposition: "homepage",
  MethodologyStep: "homepage",
  HeroSection: "homepage",
  BrandPhilosophy: "homepage",
  FounderMessage: "homepage",
  FinalCta: "homepage",
  FooterSetting: "homepage",
  SuccessMetric: "homepage",
  AsSeenInLogo: "homepage",
  Page: "pages",
};

export async function GET(req: NextRequest) {
  try {
    const ctx = await requireAdmin(req);
    if (isResponse(ctx)) return ctx.response;

    const entityType = req.nextUrl.searchParams.get("entityType") ?? "";
    if (!isContentEntityType(entityType)) {
      return fail("INVALID_ENTITY", "Unknown or missing entityType.", 400);
    }
    const entityId = z.string().uuid().parse(req.nextUrl.searchParams.get("entityId"));
    assertCan(ctx.role, "read", ENTITY_RESOURCE[entityType] ?? "pages");

    return ok(await listVersions(entityType, entityId));
  } catch (error) {
    return handleApiError(error);
  }
}
