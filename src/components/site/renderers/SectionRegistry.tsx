import type { ComponentType, CSSProperties } from "react";
import type { HomepageDTO, SectionType, SectionLayoutDTO } from "@/types/cms";
import { sectionFontVars } from "@/lib/fonts";

import { HeroSection } from "./HeroSection";
import { AsSeenInSection } from "./AsSeenInSection";
import { MethodologySection } from "./MethodologySection";
import { WhyChooseUsSection } from "./WhyChooseUsSection";
import { BrandPhilosophySection } from "./BrandPhilosophySection";
import { ServicesSection } from "./ServicesSection";
import { SuccessStoriesSection } from "./SuccessStoriesSection";
import { FounderMessageSection } from "./FounderMessageSection";
import { TeamSection } from "./TeamSection";
import { EventsSection } from "./EventsSection";
import { FinalCtaSection } from "./FinalCtaSection";

/** Uniform props every registry section adapter receives. */
export interface SectionProps {
  homepage: HomepageDTO;
}

// Each adapter pulls its slice from the assembled homepage payload and renders
// the matching renderer (or null when the slice has no content).
const Hero: ComponentType<SectionProps> = ({ homepage }) =>
  homepage.hero ? (
    <HeroSection data={homepage.hero} locale={homepage.locale} />
  ) : null;

const AsSeenIn: ComponentType<SectionProps> = ({ homepage }) => (
  <AsSeenInSection
    data={homepage.asSeenIn}
    locale={homepage.locale}
    header={homepage.sectionHeaders.as_seen_in}
  />
);

const Methodology: ComponentType<SectionProps> = ({ homepage }) => (
  <MethodologySection
    data={homepage.methodology}
    locale={homepage.locale}
    header={homepage.sectionHeaders.methodology}
  />
);

const WhyChooseUs: ComponentType<SectionProps> = ({ homepage }) => (
  <WhyChooseUsSection
    data={homepage.whyChooseUs}
    locale={homepage.locale}
    header={homepage.sectionHeaders.why_choose_us}
  />
);

const BrandPhilosophy: ComponentType<SectionProps> = ({ homepage }) =>
  homepage.brandPhilosophy ? (
    <BrandPhilosophySection
      data={homepage.brandPhilosophy}
      locale={homepage.locale}
    />
  ) : null;

const Services: ComponentType<SectionProps> = ({ homepage }) => (
  <ServicesSection
    data={homepage.services}
    locale={homepage.locale}
    header={homepage.sectionHeaders.services}
    cardsPerRow={homepage.sectionSettings.services?.cardsPerRow}
  />
);

const SuccessStories: ComponentType<SectionProps> = ({ homepage }) => (
  <SuccessStoriesSection
    data={homepage.successStories}
    locale={homepage.locale}
    header={homepage.sectionHeaders.success_stories}
    cardsPerRow={homepage.sectionSettings.success_stories?.cardsPerRow}
  />
);

const FounderMessage: ComponentType<SectionProps> = ({ homepage }) =>
  homepage.founderMessage ? (
    <FounderMessageSection
      data={homepage.founderMessage}
      locale={homepage.locale}
    />
  ) : null;

const Team: ComponentType<SectionProps> = ({ homepage }) => (
  <TeamSection
    data={homepage.team}
    locale={homepage.locale}
    header={homepage.sectionHeaders.team}
    cardsPerRow={homepage.sectionSettings.team?.cardsPerRow}
  />
);

const Events: ComponentType<SectionProps> = ({ homepage }) => (
  <EventsSection
    data={homepage.events}
    locale={homepage.locale}
    header={homepage.sectionHeaders.events}
    cardsPerRow={homepage.sectionSettings.events?.cardsPerRow}
  />
);

const FinalCta: ComponentType<SectionProps> = ({ homepage }) =>
  homepage.finalCta ? (
    <FinalCtaSection data={homepage.finalCta} locale={homepage.locale} />
  ) : null;

/**
 * Registry object (NOT a switch) mapping every content SectionType to its
 * renderer adapter. `footer` is handled by the layout, so it has no entry.
 */
export const sectionRegistry: Partial<
  Record<SectionType, ComponentType<SectionProps>>
> = {
  hero: Hero,
  as_seen_in: AsSeenIn,
  methodology: Methodology,
  why_choose_us: WhyChooseUs,
  brand_philosophy: BrandPhilosophy,
  services: Services,
  success_stories: SuccessStories,
  founder_message: FounderMessage,
  team: Team,
  events: Events,
  final_cta: FinalCta,
};

/**
 * Build scoped CSS-variable overrides for a section from its admin-configured
 * colors. Set on a wrapper <div>, the vars cascade into the section's own
 * `bg-[var(--color-surface)]` / text / accent tokens. Only valid hex values are
 * stored (validated server-side), so no runtime sanitizing is needed here.
 */
export function sectionVars(s?: SectionLayoutDTO): CSSProperties | undefined {
  if (!s) return undefined;
  const vars: Record<string, string> = {};
  if (s.bgColor) {
    vars["--color-surface"] = s.bgColor;
    vars["--color-bg"] = s.bgColor;
    // Hero paints `background-image: var(--gradient-soft)` and Final CTA paints a
    // dark surface var; override both so every section's background truly follows
    // the admin color (not just the ones using --color-bg/--color-surface).
    vars["--gradient-soft"] = `linear-gradient(0deg, ${s.bgColor}, ${s.bgColor})`;
    vars["--section-dark-bg"] = s.bgColor;
  }
  if (s.textColor) {
    vars["--color-text-primary"] = s.textColor;
    vars["--color-text-secondary"] = s.textColor;
  }
  if (s.accentColor) vars["--brand-primary"] = s.accentColor;
  // Cards read bg-[var(--card-surface,var(--color-surface))], so this stays
  // independent of the section background above.
  if (s.cardBgColor) vars["--card-surface"] = s.cardBgColor;
  // Type-scale tokens are calc(base * var(--font-scale, 1)) in globals.css.
  if (s.fontScale && s.fontScale !== 1) vars["--font-scale"] = String(s.fontScale);
  const font = sectionFontVars(s.fontFamily);
  if (font) Object.assign(vars, font);
  return Object.keys(vars).length ? (vars as CSSProperties) : undefined;
}

/**
 * Iterates SECTION_ORDER, skips sections whose visibility is false (or which
 * have no registered renderer, e.g. footer), and renders from the registry.
 * Sections with color overrides are wrapped in a div that scopes the CSS vars.
 */
export function HomeSections({ homepage }: { homepage: HomepageDTO }) {
  return (
    <>
      {homepage.sectionOrder.map((type) => {
        if (homepage.visibility[type] === false) return null;
        const Section = sectionRegistry[type];
        if (!Section) return null;
        const style = sectionVars(homepage.sectionSettings[type]);
        if (style) {
          return (
            <div key={type} style={style}>
              <Section homepage={homepage} />
            </div>
          );
        }
        return <Section key={type} homepage={homepage} />;
      })}
    </>
  );
}
