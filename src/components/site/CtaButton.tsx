"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button, type ButtonProps } from "@/components/ui/button";
import type { CtaDTO } from "@/types/cms";
import { isLocale, DEFAULT_LOCALE } from "@/types/locale";

interface CtaButtonProps extends Omit<ButtonProps, "asChild" | "children"> {
  cta: CtaDTO;
  /** Optional override label (defaults to cta.label). */
  label?: string;
  className?: string;
}

/**
 * Renders a CTA from a resolved CtaDTO. Behavior keyed by actionType:
 * - OPEN_LEAD_FORM → scroll to #lead-form if present, else navigate /{locale}/contact
 * - OPEN_CONTACT_PAGE / INTERNAL_URL → next/link
 * - OPEN_CALENDLY / OPEN_CALCOM / EXTERNAL_URL / DOWNLOAD_ASSET → new-tab anchor
 */
export function CtaButton({
  cta,
  label,
  variant = "cta",
  size = "md",
  className,
  ...rest
}: CtaButtonProps) {
  const router = useRouter();
  const params = useParams();
  const text = label ?? cta.label;

  const rawLocale = Array.isArray(params?.locale)
    ? params.locale[0]
    : (params?.locale as string | undefined);
  const locale = rawLocale && isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE;

  // OPEN_LEAD_FORM: scroll-to-form on the current page, else go to contact.
  if (cta.actionType === "OPEN_LEAD_FORM") {
    const handleLeadForm = (e: React.MouseEvent) => {
      e.preventDefault();
      const el =
        typeof document !== "undefined"
          ? document.getElementById("lead-form")
          : null;
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        const focusable = el.querySelector<HTMLElement>(
          "input, select, textarea, button",
        );
        focusable?.focus();
      } else {
        router.push(`/${locale}/contact`);
      }
    };
    return (
      <Button
        variant={variant}
        size={size}
        className={className}
        aria-label={text}
        onClick={handleLeadForm}
        {...rest}
      >
        {text}
      </Button>
    );
  }

  // External / new-tab targets.
  if (cta.external) {
    return (
      <Button
        asChild
        variant={variant}
        size={size}
        className={className}
        {...rest}
      >
        <a
          href={cta.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={text}
        >
          {text}
        </a>
      </Button>
    );
  }

  // Internal navigation (contact page, internal url, lead-form anchor fallback).
  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={className}
      {...rest}
    >
      <Link href={cta.href} aria-label={text}>
        {text}
      </Link>
    </Button>
  );
}
