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

/** Admin-configured visibility/required flags for the optional lead fields. */
export interface LeadFieldConfig {
  field: "phone" | "country" | "notes";
  isShown: boolean;
  isRequired: boolean;
}

interface LeadFormProps {
  locale: AppLocale;
  /** Lead source attribution, e.g. "contact_form" | "event:{slug}". */
  source: string;
  grades?: GradeOptionDTO[];
  /** Preselected grade value (from the hero grade funnel). */
  defaultGrade?: string | null;
  /** Per-field shown/required config (phone/country/notes). Defaults to shown+optional. */
  fields?: LeadFieldConfig[];
  className?: string;
}

type Status = "idle" | "submitting" | "success" | "error";

/** Public lead-capture form. POSTs to /api/leads and reports the envelope result. */
export function LeadForm({
  locale,
  source,
  grades = [],
  defaultGrade = null,
  fields,
  className,
}: LeadFormProps) {
  const t = dictionary[locale].contactForm;
  const [status, setStatus] = React.useState<Status>("idle");
  const [errorMessage, setErrorMessage] = React.useState<string>("");
  // Names of fields flagged invalid (empty required, or rejected by the server).
  const [invalid, setInvalid] = React.useState<Set<string>>(new Set());
  const formRef = React.useRef<HTMLFormElement>(null);

  // Per-field config for the optional fields, with sensible defaults.
  const cfg = React.useMemo(() => {
    const base: Record<string, LeadFieldConfig> = {
      phone: { field: "phone", isShown: true, isRequired: false },
      country: { field: "country", isShown: true, isRequired: false },
      notes: { field: "notes", isShown: true, isRequired: false },
    };
    for (const f of fields ?? []) base[f.field] = f;
    return base;
  }, [fields]);

  // Required fields: the core identity fields plus any optional field the admin
  // marked required. Mirrors the server enforcement (the source of truth).
  const REQUIRED = React.useMemo(
    () => [
      "firstName",
      "lastName",
      "email",
      ...(["phone", "country", "notes"] as const).filter(
        (f) => cfg[f].isShown && cfg[f].isRequired,
      ),
    ],
    [cfg],
  );

  /** Clear a field's invalid flag as the user edits it. */
  function clearInvalid(name: string) {
    setInvalid((prev) => {
      if (!prev.has(name)) return prev;
      const next = new Set(prev);
      next.delete(name);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

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

    // Client-side required-field check: highlight empty required fields and stop
    // before the network call.
    const missing = REQUIRED.filter((name) => !payload[name]);
    if (missing.length > 0) {
      setInvalid(new Set(missing));
      setStatus("error");
      setErrorMessage(t.requiredError);
      document.getElementById(`lead-${missing[0]}`)?.focus();
      return;
    }

    setStatus("submitting");
    setErrorMessage("");
    setInvalid(new Set());

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
        // Highlight any fields the server rejected (validation envelope details).
        const details: Array<{ path?: unknown }> = json?.error?.details ?? [];
        const rejected = details
          .map((d) => (Array.isArray(d.path) ? d.path[0] : d.path))
          .filter((p): p is string => typeof p === "string" && p.length > 0);
        if (rejected.length > 0) {
          setInvalid(new Set(rejected));
          setErrorMessage(t.requiredError);
          document.getElementById(`lead-${rejected[0]}`)?.focus();
        } else {
          setErrorMessage(json?.error?.message ?? t.error);
        }
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
          <Label htmlFor="lead-firstName" required>
            {t.firstName}
          </Label>
          <Input
            id="lead-firstName"
            name="firstName"
            autoComplete="given-name"
            required
            aria-required="true"
            aria-invalid={invalid.has("firstName") || undefined}
            onChange={() => clearInvalid("firstName")}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-lastName" required>
            {t.lastName}
          </Label>
          <Input
            id="lead-lastName"
            name="lastName"
            autoComplete="family-name"
            required
            aria-required="true"
            aria-invalid={invalid.has("lastName") || undefined}
            onChange={() => clearInvalid("lastName")}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-email" required>
            {t.email}
          </Label>
          <Input
            id="lead-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={invalid.has("email") || undefined}
            onChange={() => clearInvalid("email")}
          />
        </div>
        {cfg.phone.isShown && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-phone" required={cfg.phone.isRequired}>
              {t.phone}
            </Label>
            <Input
              id="lead-phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              inputMode="tel"
              aria-invalid={invalid.has("phone") || undefined}
              onChange={() => clearInvalid("phone")}
            />
          </div>
        )}
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
        {cfg.country.isShown && (
          <div className="flex flex-col gap-2">
            <Label htmlFor="lead-country" required={cfg.country.isRequired}>
              {t.country}
            </Label>
            <Input
              id="lead-country"
              name="country"
              autoComplete="country-name"
              aria-invalid={invalid.has("country") || undefined}
              onChange={() => clearInvalid("country")}
            />
          </div>
        )}
      </div>

      {cfg.notes.isShown && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="lead-notes" required={cfg.notes.isRequired}>
            {t.notes}
          </Label>
          <Textarea
            id="lead-notes"
            name="notes"
            rows={4}
            aria-invalid={invalid.has("notes") || undefined}
            onChange={() => clearInvalid("notes")}
          />
        </div>
      )}

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
