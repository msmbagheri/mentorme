"use client";

import * as React from "react";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/** Section header for admin pages: title, optional description + actions slot. */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-h2 font-bold text-[var(--color-text-primary)]">{title}</h1>
        {description ? (
          <p className="mt-1 text-small text-[var(--color-text-secondary)]">{description}</p>
        ) : null}
      </div>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </div>
  );
}

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  DRAFT: "neutral",
  IN_REVIEW: "warning",
  PUBLISHED: "success",
  ARCHIVED: "error",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={STATUS_VARIANT[status] ?? "neutral"}>
      {status.replace(/_/g, " ")}
    </Badge>
  );
}

const LEAD_STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  NEW: "info",
  CONTACTED: "warning",
  QUALIFIED: "brand",
  CONVERTED: "success",
  CLOSED: "neutral",
};

export function LeadStatusBadge({ status }: { status: string }) {
  return <Badge variant={LEAD_STATUS_VARIANT[status] ?? "neutral"}>{status}</Badge>;
}

/** Labeled text field. */
export function Field({
  label,
  htmlFor,
  required,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-[var(--color-error)]"> *</span> : null}
      </Label>
      {children}
      {hint ? (
        <p className="mt-1 text-caption text-[var(--color-text-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}

/** A pair of EN/FA inputs (or textareas) side by side. */
export function BilingualField({
  label,
  baseName,
  valueEn,
  valueFa,
  onChange,
  textarea,
  required,
}: {
  label: string;
  baseName: string;
  valueEn: string;
  valueFa: string;
  onChange: (key: string, value: string) => void;
  textarea?: boolean;
  required?: boolean;
}) {
  const Control = textarea ? Textarea : Input;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Field label={`${label} (EN)`} htmlFor={`${baseName}_en`} required={required}>
        <Control
          id={`${baseName}_en`}
          dir="ltr"
          value={valueEn}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            onChange(`${baseName}_en`, e.target.value)
          }
        />
      </Field>
      <Field label={`${label} (FA)`} htmlFor={`${baseName}_fa`} required={required}>
        <Control
          id={`${baseName}_fa`}
          dir="rtl"
          value={valueFa}
          onChange={(e: React.ChangeEvent<HTMLInputElement & HTMLTextAreaElement>) =>
            onChange(`${baseName}_fa`, e.target.value)
          }
        />
      </Field>
    </div>
  );
}

/** Inline label + switch row. */
export function SwitchRow({
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  const id = React.useId();
  return (
    <div className="flex items-center justify-between gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3">
      <div>
        <Label htmlFor={id} className="mb-0">
          {label}
        </Label>
        {description ? (
          <p className="text-caption text-[var(--color-text-muted)]">{description}</p>
        ) : null}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
      />
    </div>
  );
}

/** Centered empty-state for empty tables/grids. */
export function EmptyState({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-[var(--color-border-strong)] p-12 text-center">
      <p className="text-h4 font-semibold text-[var(--color-text-primary)]">{title}</p>
      {description ? (
        <p className="max-w-md text-small text-[var(--color-text-secondary)]">{description}</p>
      ) : null}
      {children}
    </div>
  );
}

export function ReadOnlyNotice({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-md)] bg-[var(--color-info-soft)] px-4 py-2 text-small text-[var(--color-info)]",
        className,
      )}
    >
      You have read-only access. Editing controls are hidden for your role.
    </div>
  );
}
