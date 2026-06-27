"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { dictionary } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { AppLocale } from "@/types/locale";
import type { GradeOptionDTO } from "@/types/cms";

interface LeadFormProps {
  locale: AppLocale;
  /** Lead source attribution, e.g. "contact_form" | "event:{slug}". */
  source: string;
  grades?: GradeOptionDTO[];
  /** Preselected grade value (from the hero grade funnel). */
  defaultGrade?: string | null;
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

/** Public lead-capture form. POSTs to /api/leads and reports the envelope result. */
export function LeadForm({
  locale,
  source,
  grades = [],
  defaultGrade = null,
  className,
}: LeadFormProps) {
  const t = dictionary[locale].contactForm;
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  const formRef = React.useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMessage("");

    const fd = new FormData(e.currentTarget);
    const payload: Record<string, string> = {
      firstName: String(fd.get("firstName") ?? "").trim(),
      lastName: String(fd.get("lastName") ?? "").trim(),
      email: String(fd.get("email") ?? "").trim(),
      phone: String(fd.get("phone") ?? "").trim(),
      country: String(fd.get("country") ?? "").trim(),
      notes: String(fd.get("notes") ?? "").trim(),
      source,
    };
    const grade = String(fd.get("grade") ?? "").trim();
    if (grade) payload.grade = grade;

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.status === "success") {
        setStatus("success");
        formRef.current?.reset();
      } else {
        setStatus("error");
        setErrorMessage(json?.error?.message ?? t.error);
      }
    } catch {
      setStatus("error");
      setErrorMessage(t.error);
    }
  }

  if (status === "success") {
    return (
      <div
        id="lead-form"
        role="status"
        aria-live="polite"
        className={cn(
          "rounded-[var(--radius-lg)] border border-[var(--color-success)] bg-[var(--color-success-soft)] p-8 text-center",
          className,
        )}
      >
        <p className="text-h4 font-semibold text-[var(--color-text-primary)]">
          {t.success}
        </p>
      </div>
    );
  }

  return (
    <form
      id="lead-form"
      ref={formRef}
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={status === "error" ? "lead-form-error" : undefined}
      className={cn(
        "flex flex-col gap-5 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-sm)] md:p-8",
        className,
      )}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-firstName">{t.firstName}</Label>
          <Input
            id="lead-firstName"
            name="firstName"
            autoComplete="given-name"
            required
            aria-required="true"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-lastName">{t.lastName}</Label>
          <Input
            id="lead-lastName"
            name="lastName"
            autoComplete="family-name"
            required
            aria-required="true"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-email">{t.email}</Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-phone">{t.phone}</Label>
          <Input
            id="lead-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {grades.length > 0 && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-grade">{t.grade}</Label>
            <Select
              id="lead-grade"
              name="grade"
              defaultValue={defaultGrade ?? ""}
            >
              <option value="">{t.selectGrade}</option>
              {grades.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          </div>
        )}
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-country">{t.country}</Label>
          <Input
            id="lead-country"
            name="country"
            autoComplete="country-name"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="lead-notes">{t.notes}</Label>
        <Textarea id="lead-notes" name="notes" rows={4} />
      </div>

      {status === "error" && (
        <p
          id="lead-form-error"
          role="alert"
          className="text-small font-medium text-[var(--color-error)]"
        >
          {errorMessage || t.error}
        </p>
      )}

      <Button
        type="submit"
        variant="cta"
        size="lg"
        className="w-full sm:w-auto"
        disabled={status === "submitting"}
        aria-label={t.submit}
      >
        {status === "submitting" ? t.submitting : t.submit}
      </Button>
    </form>
  );
}
