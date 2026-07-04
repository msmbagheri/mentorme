-- Data migration: existing HomepageSection rows all default cardsPerRow=1 (from
-- the wave1 migration). Give the grid/carousel sections sensible column counts
-- so they don't regress to a single column after the carousel rollout. Only
-- touches rows still at the default 1 — never overrides an admin choice.
UPDATE "HomepageSection" SET "cardsPerRow" = 3
  WHERE "sectionType" IN ('services', 'success_stories', 'events') AND "cardsPerRow" = 1;

UPDATE "HomepageSection" SET "cardsPerRow" = 4
  WHERE "sectionType" = 'team' AND "cardsPerRow" = 1;
