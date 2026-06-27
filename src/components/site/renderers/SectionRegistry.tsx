import type { ComponentType } from "react";
import type { HomepageDTO, SectionType } from "@/types/cms";
import { SECTION_ORDER } from "@/types/cms";

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
  />
);

const SuccessStories: ComponentType<SectionProps> = ({ homepage }) => (
  <SuccessStoriesSection
    data={homepage.successStories}
    locale={homepage.locale}
    header={homepage.sectionHeaders.success_stories}
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
  />
);

const Events: ComponentType<SectionProps> = ({ homepage }) => (
  <EventsSection
    data={homepage.events}
    locale={homepage.locale}
    header={homepage.sectionHeaders.events}
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
 * Iterates SECTION_ORDER, skips sections whose visibility is false (or which
 * have no registered renderer, e.g. footer), and renders from the registry.
 */
export function HomeSections({ homepage }: { homepage: HomepageDTO }) {
  return (
    <>
      {SECTION_ORDER.map((type) => {
        if (homepage.visibility[type] === false) return null;
        const Section = sectionRegistry[type];
        if (!Section) return null;
        return <Section key={type} homepage={homepage} />;
      })}
    </>
  );
}
