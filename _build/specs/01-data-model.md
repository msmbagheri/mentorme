# 01 — Data Model Spec (MentorMe)

Source: `CMS + ADMIN PANEL + DATABASE ARCHITECTURE.txt v2.0` + `FINAL MASTER IMPLEMENTATION PROMPT` (lines 440-560).

**Global rules**
- DB: PostgreSQL. ORM: Prisma. Client generator: `prisma-client-js`.
- PK: `id String @id @default(uuid())` on every model (except `VerificationToken`).
- Every major content model has: `id`, `createdAt @default(now())`, `updatedAt @updatedAt`, `isActive @default(true)`.
- Localized primary content = **paired columns** (`title_en`/`title_fa`, etc.). NO JSON blobs for localized text.
- JSON allowed ONLY for: metadata, social links, contact info, campaign data, audit snapshots, structured data, specialty tags, technical/analytics config.
- Soft delete via `isActive` (and `isDeleted` on HomepageSection). Passwords always hashed+salted.

**Reconciliation notes (ambiguities resolved):**
- Canonical list (master prompt) names `GradeLevel` + `Locale`. Architecture doc names the same grade enum `Grade` and omits `Locale`. → **Use `GradeLevel`** (canonical) for `Lead.grade` & `GradeOption.grade`; **add `Locale {EN, FA}`** (canonical). `Grade` is treated as alias = dropped in favor of `GradeLevel`.
- Doc defines extra enums not in canonical list: `SectionGroup`, `MenuItemType`, `MediaType` — **kept** (needed by HomepageSection/MenuItem/MediaAsset).
- `FinalCta`, `FooterSetting`, `GradeOption` appear in canonical model list but have no schema body in the doc → **fields inferred**, marked `(inferred)`.
- `EventRegistration` exists in doc but not in the assignment's model list; **included** (real, doc-defined) since `Event` references it.

---

## 1. ENUMS

| Enum | Values |
|---|---|
| `Role` | ADMIN, EDITOR, VIEWER |
| `LeadStatus` | NEW, CONTACTED, QUALIFIED, CONVERTED, CLOSED |
| `ContentStatus` | DRAFT, IN_REVIEW, PUBLISHED, ARCHIVED |
| `Locale` | EN, FA |
| `GradeLevel` | GRADE_6, GRADE_7, GRADE_8, GRADE_9, GRADE_10, GRADE_11, GRADE_12, TRANSFER |
| `CtaActionType` | OPEN_LEAD_FORM, OPEN_CONTACT_PAGE, OPEN_CALENDLY, OPEN_CALCOM, INTERNAL_URL, EXTERNAL_URL, DOWNLOAD_ASSET |
| `EventStatus` | DRAFT, PUBLISHED, ARCHIVED |
| `AuditAction` | CREATE, UPDATE, DELETE, PUBLISH, ARCHIVE, ROLLBACK, LOGIN, PERMISSION_CHANGE |
| `SectionGroup` | TRUST, METHOD, PROOF, HUMAN, CONVERSION, FOOTER |
| `MenuItemType` | SCROLL_TO_SECTION, INTERNAL_PAGE, EXTERNAL_URL |
| `MediaType` | IMAGE, VIDEO, DOCUMENT |

---

## 2. MODELS

Legend: `R`=required, `O`=optional(`?`), `T`=`@db.Text`, `U`=`@unique`. Defaults in `[brackets]`.

### Authentication

**User**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK uuid |
| name | String | R | |
| email | String | R | U |
| passwordHash | String | R | hashed+salted |
| role | Role | R | [EDITOR] |
| image | String | O | |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| accounts | Account[] | — | relation |
| sessions | Session[] | — | relation |
| auditLogs | AuditLog[] | — | relation |

**Account**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| userId | String | R | FK→User.id, onDelete Cascade |
| type | String | R | |
| provider | String | R | |
| providerAccountId | String | R | |
| refresh_token | String | O | |
| access_token | String | O | |
| expires_at | Int | O | |
| token_type | String | O | |
| scope | String | O | |
| id_token | String | O | |
| session_state | String | O | |
| user | User | — | relation |
- `@@unique([provider, providerAccountId])`

**Session**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| sessionToken | String | R | U |
| userId | String | R | FK→User.id, onDelete Cascade |
| expires | DateTime | R | |
| user | User | — | relation |

**VerificationToken** (no `id` PK)
| field | type | R/O | notes |
|---|---|---|---|
| identifier | String | R | |
| token | String | R | U |
| expires | DateTime | R | |
- `@@unique([identifier, token])`

### Content Core

**Page**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| slug | String | R | U |
| title_en | String | R | |
| title_fa | String | R | |
| meta_title_en | String | O | |
| meta_title_fa | String | O | |
| meta_description_en | String | O | T |
| meta_description_fa | String | O | T |
| ogImageUrl | String | O | |
| canonicalUrl | String | O | |
| status | ContentStatus | R | [DRAFT] |
| isIndexed | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| homepageSections | HomepageSection[] | — | relation |
| seoSetting | SeoSetting? | — | relation |

**HomepageSection**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | FK→Page.id, onDelete Cascade |
| sectionType | String | R | one of required section types (below) |
| stageGroup | SectionGroup | R | |
| orderIndex | Int | R | [0] |
| isActive | Boolean | R | [true] |
| isDeleted | Boolean | R | [false] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| page | Page | — | relation |
- `@@unique([pageId, sectionType])`
- **Required section types (mandatory order):** `hero, as_seen_in, methodology, why_choose_us, brand_philosophy, services, success_stories, founder_message, team, events, final_cta, footer`. Admin may toggle visibility but MUST NOT reorder/break trust-flow.

**ContentVersion**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| entityType | String | R | model name |
| entityId | String | R | record id |
| version | Int | R | monotonic per (entityType,entityId) |
| payload | Json | R | full snapshot |
| createdAt | DateTime | R | [now()] |
| createdBy | String | O | user id |
- Index `(inferred)`: `@@index([entityType, entityId])`; `@@unique([entityType, entityId, version])` `(inferred)`.

### Homepage Content

**HeroSection**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | U (1:1 Page) |
| eyebrow_en | String | O | |
| eyebrow_fa | String | O | |
| headline_en | String | R | |
| headline_fa | String | R | |
| subheadline_en | String | R | T |
| subheadline_fa | String | R | T |
| primaryCtaId | String | O | →CtaConfig.id |
| secondaryCtaId | String | O | →CtaConfig.id |
| heroImageUrl | String | O | |
| heroImageAlt_en | String | O | |
| heroImageAlt_fa | String | O | |
| trustBadgeText_en | String | O | |
| trustBadgeText_fa | String | O | |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**AsSeenInLogo**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| title_en | String | R | |
| title_fa | String | O | |
| imageUrl | String | R | |
| altText_en | String | O | |
| altText_fa | String | O | |
| url | String | O | if present→clickable, else non-clickable |
| sortOrder | Int | R | [0] |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**MethodologyStep** (min 3, max 5; stepNumber auto)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | FK→Page `(inferred relation)` |
| stepNumber | Int | R | auto-generated |
| icon | String | O | |
| title_en | String | R | |
| title_fa | String | R | |
| description_en | String | R | T |
| description_fa | String | R | T |
| sortOrder | Int | R | [0] |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**Testimonial**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| name | String | R | |
| role_en | String | O | |
| role_fa | String | O | |
| company | String | O | |
| content_en | String | R | T |
| content_fa | String | R | T |
| rating | Int | R | 1–5 |
| avatarUrl | String | O | |
| avatarAlt_en | String | O | |
| avatarAlt_fa | String | O | |
| isFeatured | Boolean | R | [false] |
| sortOrder | Int | R | [0] |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**ValueProposition** (homepage shows exactly 3 active)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| icon | String | O | |
| title_en | String | R | |
| title_fa | String | R | |
| description_en | String | R | T |
| description_fa | String | R | T |
| sortOrder | Int | R | [0] |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**BrandPhilosophy**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | U (1:1) |
| eyebrow_en | String | O | |
| eyebrow_fa | String | O | |
| title_en | String | R | |
| title_fa | String | R | |
| content_en | String | R | T |
| content_fa | String | R | T |
| imageUrl | String | O | |
| imageAlt_en | String | O | |
| imageAlt_fa | String | O | |
| ctaId | String | O | →CtaConfig.id |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**SuccessMetric**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | FK→Page `(inferred relation)` |
| metricValue | String | R | e.g. "95%" |
| metricLabel_en | String | R | |
| metricLabel_fa | String | R | |
| sortOrder | Int | R | [0] |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**FounderMessage**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | U (1:1) |
| name_en | String | R | |
| name_fa | String | R | |
| title_en | String | R | |
| title_fa | String | R | |
| message_en | String | R | T |
| message_fa | String | R | T |
| photoUrl | String | O | |
| photoAlt_en | String | O | |
| photoAlt_fa | String | O | |
| signatureUrl | String | O | |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**FinalCta** `(inferred — no schema body in doc; maps to `final_cta` section)`
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | U (1:1) `(inferred)` |
| eyebrow_en | String | O | `(inferred)` |
| eyebrow_fa | String | O | `(inferred)` |
| headline_en | String | R | `(inferred)` |
| headline_fa | String | R | `(inferred)` |
| subheadline_en | String | O | T `(inferred)` |
| subheadline_fa | String | O | T `(inferred)` |
| primaryCtaId | String | O | →CtaConfig.id `(inferred)` |
| secondaryCtaId | String | O | →CtaConfig.id `(inferred)` |
| backgroundImageUrl | String | O | `(inferred)` |
| isActive | Boolean | R | [true] `(inferred)` |
| createdAt | DateTime | R | [now()] `(inferred)` |
| updatedAt | DateTime | R | @updatedAt `(inferred)` |

**FooterSetting** `(inferred — no schema body in doc; maps to `footer` section)`
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK `(inferred)` |
| pageId | String | O | U `(inferred)` (global if null) |
| tagline_en | String | O | `(inferred)` |
| tagline_fa | String | O | `(inferred)` |
| copyright_en | String | O | `(inferred)` |
| copyright_fa | String | O | `(inferred)` |
| address_en | String | O | T `(inferred)` |
| address_fa | String | O | T `(inferred)` |
| contactEmail | String | O | `(inferred)` |
| contactPhone | String | O | `(inferred)` |
| socialLinks | Json | O | `(inferred)` JSON allowed (social links) |
| footerMenuId | String | O | →Menu.id `(inferred)` |
| isActive | Boolean | R | [true] `(inferred)` |
| createdAt | DateTime | R | [now()] `(inferred)` |
| updatedAt | DateTime | R | @updatedAt `(inferred)` |

### Content Types (with detail pages + independent SEO)

**Service** (homepage shows featured only; needs detail page)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| slug | String | R | U |
| title_en | String | R | |
| title_fa | String | R | |
| shortDescription_en | String | R | T |
| shortDescription_fa | String | R | T |
| fullDescription_en | String | R | T |
| fullDescription_fa | String | R | T |
| imageUrl | String | O | |
| imageAlt_en | String | O | |
| imageAlt_fa | String | O | |
| ctaId | String | O | →CtaConfig.id |
| metaTitle_en | String | O | |
| metaTitle_fa | String | O | |
| metaDescription_en | String | O | T |
| metaDescription_fa | String | O | T |
| isFeatured | Boolean | R | [false] |
| isActive | Boolean | R | [true] |
| sortOrder | Int | R | [0] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**CaseStudy** (featured may show on homepage; needs detail page)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| slug | String | R | U |
| name | String | R | client/subject name |
| title_en | String | R | |
| title_fa | String | R | |
| outcomeBadge_en | String | R | |
| outcomeBadge_fa | String | R | |
| story_en | String | R | T |
| story_fa | String | R | T |
| fullStory_en | String | O | T |
| fullStory_fa | String | O | T |
| imageUrl | String | O | |
| imageAlt_en | String | O | |
| imageAlt_fa | String | O | |
| ctaId | String | O | →CtaConfig.id |
| metaTitle_en | String | O | |
| metaTitle_fa | String | O | |
| metaDescription_en | String | O | T |
| metaDescription_fa | String | O | T |
| isFeatured | Boolean | R | [false] |
| isActive | Boolean | R | [true] |
| sortOrder | Int | R | [0] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**TeamCategory**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| slug | String | R | U |
| title_en | String | R | |
| title_fa | String | R | |
| sortOrder | Int | R | [0] |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| members | TeamMember[] | — | relation |

**TeamMember** (needs profile page; CMS-ordered)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| categoryId | String | R | FK→TeamCategory.id |
| slug | String | R | U |
| name_en | String | R | |
| name_fa | String | R | |
| role_en | String | R | |
| role_fa | String | R | |
| bio_en | String | R | T |
| bio_fa | String | R | T |
| fullBio_en | String | O | T |
| fullBio_fa | String | O | T |
| photoUrl | String | O | |
| photoAlt_en | String | O | |
| photoAlt_fa | String | O | |
| linkedinUrl | String | O | |
| email | String | O | |
| location | String | O | |
| specialtyTags | Json | O | JSON allowed (tags) |
| isActive | Boolean | R | [true] |
| sortOrder | Int | R | [0] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| category | TeamCategory | — | relation |

**Event** (needs detail page; independent SEO; registration)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| slug | String | R | U |
| title_en | String | R | |
| title_fa | String | R | |
| shortDescription_en | String | R | T |
| shortDescription_fa | String | R | T |
| content_en | String | R | T |
| content_fa | String | R | T |
| imageUrl | String | O | |
| imageAlt_en | String | O | |
| imageAlt_fa | String | O | |
| location_en | String | O | |
| location_fa | String | O | |
| startDate | DateTime | R | |
| endDate | DateTime | O | |
| timezone | String | O | |
| registrationUrl | String | O | |
| capacity | Int | O | |
| eventStatus | EventStatus | R | [DRAFT] |
| isFeatured | Boolean | R | [false] |
| metaTitle_en | String | O | |
| metaTitle_fa | String | O | |
| metaDescription_en | String | O | T |
| metaDescription_fa | String | O | T |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| registrations | EventRegistration[] | — | relation `(inferred back-relation)` |

**EventRegistration**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| eventId | String | R | FK→Event.id, onDelete Cascade |
| firstName | String | R | |
| lastName | String | R | |
| email | String | R | |
| phone | String | O | |
| notes | String | O | T |
| createdAt | DateTime | R | [now()] |
| event | Event | — | relation |

### Operations

**Lead**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| firstName | String | R | |
| lastName | String | R | |
| email | String | R | |
| phone | String | O | |
| grade | GradeLevel | O | |
| country | String | O | |
| source | String | O | e.g. homepage_cta, contact_form, event |
| status | LeadStatus | R | [NEW] |
| notes | String | O | T |
| assignedToId | String | O | →User.id (editable in Admin) `(inferred relation to User)` |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| activities | LeadActivity[] | — | relation `(inferred back-relation)` |
- Index `(inferred)`: `@@index([status])`, `@@index([assignedToId])`, `@@index([createdAt])`.

**LeadActivity** (timeline)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| leadId | String | R | FK→Lead.id, onDelete Cascade `(inferred relation)` |
| activityType | String | R | e.g. created, email_sent, call, scheduled, qualified, converted, closed |
| description | String | R | T |
| createdAt | DateTime | R | [now()] |
| lead | Lead | — | relation `(inferred)` |

**AuditLog**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| userId | String | O | FK→User.id (nullable) |
| action | AuditAction | R | |
| entityType | String | O | |
| entityId | String | O | |
| details | String | R | T |
| ipAddress | String | O | |
| userAgent | String | O | |
| createdAt | DateTime | R | [now()] |
| user | User? | — | relation |
- Index `(inferred)`: `@@index([entityType, entityId])`, `@@index([userId])`, `@@index([createdAt])`.

### CMS

**Menu**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| internalName | String | R | U (e.g. "header", "footer") |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| items | MenuItem[] | — | relation |

**MenuItem**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| menuId | String | R | FK→Menu.id, onDelete Cascade |
| label_en | String | R | |
| label_fa | String | R | |
| type | MenuItemType | R | |
| internalUrl | String | O | |
| externalUrl | String | O | |
| sectionAnchor | String | O | for SCROLL_TO_SECTION |
| sortOrder | Int | R | [0] |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| menu | Menu | — | relation |

**GradeOption** `(inferred — drives the grade funnel dropdown in lead forms)`
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK `(inferred)` |
| grade | GradeLevel | R | U `(inferred)` |
| label_en | String | R | `(inferred)` |
| label_fa | String | R | `(inferred)` |
| sortOrder | Int | R | [0] `(inferred)` |
| isActive | Boolean | R | [true] `(inferred)` |
| createdAt | DateTime | R | [now()] `(inferred)` |
| updatedAt | DateTime | R | @updatedAt `(inferred)` |

**CtaConfig**
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| internalName | String | R | U |
| label_en | String | R | |
| label_fa | String | R | |
| actionType | CtaActionType | R | |
| internalUrl | String | O | |
| externalUrl | String | O | |
| calendlyUrl | String | O | |
| calcomUrl | String | O | |
| isActive | Boolean | R | [true] |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**ThemeSetting** (single global; rebrand without code)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| brandName | String | R | |
| tagline_en | String | R | |
| tagline_fa | String | R | |
| primaryLogoUrl | String | O | |
| darkLogoUrl | String | O | |
| mobileLogoUrl | String | O | |
| faviconUrl | String | O | |
| primaryColor | String | O | |
| accentColor | String | O | |
| ctaGradientStart | String | O | |
| ctaGradientEnd | String | O | |
| socialLinks | Json | O | JSON allowed |
| contactInformation | Json | O | JSON allowed |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

**SeoSetting** (1:1 Page)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| pageId | String | R | U; FK→Page.id |
| metaTitle_en | String | O | |
| metaTitle_fa | String | O | |
| metaDescription_en | String | O | T |
| metaDescription_fa | String | O | T |
| canonicalUrl | String | O | |
| ogImageUrl | String | O | |
| noIndex | Boolean | R | [false] |
| noFollow | Boolean | R | [false] |
| structuredData | Json | O | JSON allowed |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |
| page | Page | — | relation `(inferred back-relation)` |
- Structured data types supported (dynamic): Organization, WebPage, Service, Event, FAQPage, AggregateRating, Article, ProfilePage.

### Media

**MediaAsset** (centralized library; provider-abstracted)
| field | type | R/O | notes |
|---|---|---|---|
| id | String | R | PK |
| fileName | String | R | |
| fileUrl | String | R | provider-abstracted (Local/S3/R2/Supabase) |
| mediaType | MediaType | R | |
| mimeType | String | O | |
| fileSize | Int | O | bytes |
| width | Int | O | |
| height | Int | O | |
| altText_en | String | O | |
| altText_fa | String | O | |
| createdAt | DateTime | R | [now()] |
| updatedAt | DateTime | R | @updatedAt |

---

## 3. RBAC PERMISSION MATRIX

`C`=create `R`=read `U`=update `D`=delete `P`=publish/archive/rollback. VIEWER = read-only everywhere, no publish.

| Module | ADMIN | EDITOR | VIEWER |
|---|---|---|---|
| Dashboard | R | R | R |
| Pages / Homepage sections | CRUD+P | CRU+P | R |
| Homepage content (Hero, Methodology, Testimonials, ValueProp, BrandPhilosophy, SuccessMetric, FounderMessage, FinalCta, Footer, AsSeenIn) | CRUD+P | CRU+P | R |
| Services | CRUD+P | CRU+P | R |
| Case Studies | CRUD+P | CRU+P | R |
| Team (Categories, Members) | CRUD+P | CRU+P | R |
| Events / Registrations | CRUD+P | CRU+P | R |
| Leads / LeadActivity | CRUD | CRU (manage/assign) | R |
| Media Library | CRUD | CRUD | R |
| Menus / MenuItems | CRUD | CRU | R |
| CTA Manager | CRUD | CRU | R |
| Theme Manager | CRUD | CRU | R |
| SEO Settings | CRUD | CRU | R |
| Grade Options | CRUD | CRU | R |
| Users | CRUD | — (no access) | — |
| Audit Logs | R | R (own/content) | R |
| Settings (system) | CRUD | — | — |

Rules: RBAC enforced server-side + API-side + admin-side. EDITOR never manages Users. VIEWER never writes/publishes. ADMIN full access. Delete of content typically restricted to ADMIN (EDITOR archives instead) — EDITOR `D` shown only for Media/Leads where ownership applies.

---

## 4. VERSIONING / PUBLISHING / AUDIT RULES

**Content workflow:** `DRAFT → IN_REVIEW(Review) → PUBLISHED → ARCHIVED`. Actions: Preview, Publish, Unpublish, Archive, Rollback.

**Snapshot (ContentVersion) triggers** — write a snapshot on:
- Every successful `UPDATE` to a versioned content entity (capture full record as `payload`, increment `version`).
- Every `PUBLISH` (snapshot the published state).
- Optionally on `CREATE` (version 1 = initial state).
Each snapshot records `entityType`, `entityId`, `version`, `payload` (Json full record), `createdBy`.

**Rollback behavior:**
- Restores a chosen `ContentVersion.payload` onto the live record.
- Does NOT delete history — creates a NEW version (post-rollback state) so the timeline is preserved.
- Emits an `AuditLog` with `action=ROLLBACK`.

**Publishing side-effects:**
- Set `status=PUBLISHED` (or `eventStatus=PUBLISHED` for Event).
- Trigger cache revalidation: `revalidatePath()` / `revalidateTag()` (homepage ISR window 60s).
- Emit `AuditLog` (`action=PUBLISH`).

**Audit logging — log on:** CREATE, UPDATE, DELETE, PUBLISH, ARCHIVE, ROLLBACK, LOGIN, PERMISSION_CHANGE. Each entry captures `userId`, `action`, `entityType`, `entityId`, `details` (human + diff summary), `ipAddress`, `userAgent`, `createdAt`. Required structured log streams: Authentication, Lead, Publishing, System errors, Permission changes.

**Homepage integrity rule:** Admin may toggle section visibility (`isActive`) but the mandatory section order (trust-flow) must not be breakable.

---

## 5. ADMIN MODULES

| Module | Manages |
|---|---|
| Dashboard | Lead overview, recent leads, lead-status breakdown, upcoming events, published-content summary, recent content activity, system status, quick actions (modular widgets) |
| Pages | Page records, slugs, page-level meta, status, indexability |
| Homepage Manager | All 12 homepage sections (Hero, As Seen In, Methodology, Why Choose Us, Brand Philosophy, Services block, Success Stories, Founder Message, Team, Events, Final CTA, Footer) — visibility + content, order locked |
| Services | Service CRUD + per-service SEO + featured flag |
| Case Studies | Case study CRUD + SEO + featured flag |
| Testimonials | Testimonial CRUD, featured, ordering |
| Team Members | TeamCategory + TeamMember CRUD, ordering |
| Events | Event CRUD + registrations + status/SEO |
| Leads | Lead lifecycle, status, assignment, activity timeline |
| Media Library | Centralized MediaAsset upload/CRUD, alt text |
| Menus | Menu + MenuItem CRUD (header/footer) |
| CTA Manager | CtaConfig CRUD (centralized CTA behavior) |
| Theme Manager | ThemeSetting (branding, logos, colors, social, contact) |
| SEO | SeoSetting per page + structured data |
| Users | User CRUD + roles (ADMIN only) |
| Audit Logs | View AuditLog entries |
| Settings | System/global config; Grade Options funnel |

---

## 6. SEED DATA REQUIREMENTS

Passwords hashed during seeding. Minimum working dataset:

| Entity | Count | Content |
|---|---|---|
| User (Admin) | 1 | admin@example.com / `Admin12345!` / role ADMIN |
| User (Editor) | 1 | editor@example.com / `Editor12345!` / role EDITOR |
| User (Viewer) | 1 | viewer@example.com / `Viewer12345!` / role VIEWER |
| ThemeSetting | 1 | MentorMe brand, tagline EN/FA, logos, colors, social/contact |
| Page | 1+ | homepage (slug `home`) PUBLISHED + indexed; (+ contact `(inferred)`) |
| HomepageSection | 12 | all required types, correct order + stageGroup |
| HeroSection | 1 | bilingual headline/subheadline + CTAs + image |
| AsSeenInLogo | 3–6 | partner/press logos |
| MethodologyStep | 3–5 | bilingual steps (min 3, max 5) |
| Testimonial | 3+ | bilingual, ratings, ≥1 featured |
| ValueProposition | 3 | exactly 3 active |
| BrandPhilosophy | 1 | bilingual eyebrow/title/content |
| SuccessMetric | 3–4 | bilingual metric labels |
| FounderMessage | 1 | bilingual name/title/message |
| FinalCta | 1 | bilingual headline + CTAs |
| FooterSetting | 1 | tagline, copyright, contact, social, footer menu |
| Service | 3+ | bilingual, ≥1 featured, with SEO + slug |
| CaseStudy | 3+ | bilingual, ≥1 featured, with SEO + slug |
| TeamCategory | 1–2 | bilingual |
| TeamMember | 3+ | bilingual, with category + slug |
| Event | 2+ | bilingual, ≥1 PUBLISHED, future dates |
| Menu | 2 | header + footer |
| MenuItem | several | per menu, bilingual labels |
| GradeOption | 8 | one per GradeLevel (GRADE_6…GRADE_12, TRANSFER) |
| CtaConfig | 4+ | Book Consultation, Get Started, Schedule Call, Register, View Details |
| SeoSetting | 1+ | for homepage (+ per content page) |
| Lead | sample | a few across statuses + activities |
| MediaAsset | optional | `(inferred)` referenced media |

`npx prisma generate`, `migrate dev`, `db seed` must all pass with zero errors.
