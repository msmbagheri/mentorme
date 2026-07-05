import { Star } from "lucide-react";
import { SectionHeader } from "./SectionHeader";
import { TestimonialsCarousel } from "./TestimonialsCarousel";
import { SiteMediaServer } from "@/components/site/SiteMediaServer";
import { resolveIcon } from "@/lib/icons";
import type { AppLocale } from "@/types/locale";
import type { WhyChooseUsDTO, SectionHeaderDTO } from "@/types/cms";

interface WhyChooseUsSectionProps {
  data: WhyChooseUsDTO;
  locale: AppLocale;
  header?: SectionHeaderDTO;
}

function Stars({ rating, label }: { rating: number; label: string }) {
  const rounded = Math.round(rating);
  return (
    <div className="flex items-center gap-1" aria-label={label}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rounded
              ? "size-5 fill-[var(--color-warning)] text-[var(--color-warning)]"
              : "size-5 text-[var(--color-border-strong)]"
          }
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/** Why Choose Us: header → featured review → testimonials carousel → value-prop cards. */
export function WhyChooseUsSection({
  data,
  locale,
  header,
}: WhyChooseUsSectionProps) {
  const { featuredTestimonial, testimonials, testimonialsPerRow, valueProps, averageRating, reviewCount } =
    data;
  if (!featuredTestimonial && valueProps.length === 0 && testimonials.length === 0) return null;
  // The featured review is highlighted above; the carousel shows the rest so no
  // testimonial appears twice.
  const carouselItems = testimonials.filter((t) => t.id !== featuredTestimonial?.id);
  const title =
    header?.title ??
    (locale === "fa" ? "چرا ما را انتخاب می‌کنند" : "Why Clients Choose Us");
  const eyebrow = header?.eyebrow ?? null;
  const description = header?.description ?? null;
  const ratingLabel =
    locale === "fa"
      ? `${averageRating} از ۵ بر اساس ${reviewCount} نظر`
      : `${averageRating} out of 5 from ${reviewCount} reviews`;

  return (
    <section
      id="why-choose-us"
      aria-label={title}
      className="section-spacing bg-[var(--color-surface)]"
    >
      <div className="container-page flex flex-col gap-12">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          description={description}
        />

        {featuredTestimonial && (
          <figure className="flex flex-col items-center gap-6 rounded-[var(--radius-xl)] border border-[var(--color-border)] bg-[var(--color-surface-alt)] p-8 text-center md:p-12">
            <blockquote className="max-w-3xl text-h4 font-medium text-[var(--color-text-primary)]">
              “{featuredTestimonial.content}”
            </blockquote>
            <figcaption className="flex flex-col items-center gap-3">
              {featuredTestimonial.avatarUrl && (
                <SiteMediaServer
                  src={featuredTestimonial.avatarUrl}
                  alt={featuredTestimonial.avatarAlt ?? featuredTestimonial.name}
                  width={64}
                  height={64}
                  background
                  className="size-16 rounded-full object-cover"
                />
              )}
              <div>
                <p className="text-body font-semibold text-[var(--color-text-primary)]">
                  {featuredTestimonial.name}
                </p>
                {(featuredTestimonial.role || featuredTestimonial.company) && (
                  <p className="text-small text-[var(--color-text-secondary)]">
                    {[featuredTestimonial.role, featuredTestimonial.company]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                )}
              </div>
              <Stars rating={featuredTestimonial.rating} label={ratingLabel} />
            </figcaption>
          </figure>
        )}

        {carouselItems.length > 0 && (
          <TestimonialsCarousel
            testimonials={carouselItems}
            perRow={testimonialsPerRow}
            locale={locale}
          />
        )}

        {valueProps.length > 0 && (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {valueProps.map((vp) => {
              const Icon = resolveIcon(vp.icon);
              return (
                <li
                  key={vp.id}
                  className="flex h-full flex-col gap-4 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)]"
                >
                  <span className="flex size-12 items-center justify-center rounded-[var(--radius-md)] bg-[var(--color-surface-alt)] text-[var(--brand-primary)]">
                    <Icon className="size-6" aria-hidden="true" />
                  </span>
                  <h3 className="text-h4 font-semibold text-[var(--color-text-primary)]">
                    {vp.title}
                  </h3>
                  <p className="text-body text-[var(--color-text-secondary)]">
                    {vp.description}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
