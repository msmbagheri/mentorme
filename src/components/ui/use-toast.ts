"use client";

import * as React from "react";

export type ToastVariant = "default" | "success" | "error" | "info";

export interface ToastInput {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export interface ToastRecord extends ToastInput {
  id: string;
}

type Listener = (toasts: ToastRecord[]) => void;

let memory: ToastRecord[] = [];
const listeners = new Set<Listener>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

function emit() {
  for (const listener of listeners) listener(memory);
}

export function dismissToast(id: string) {
  memory = memory.filter((t) => t.id !== id);
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
  emit();
}

export function toast(input: ToastInput): string {
  const id = Math.random().toString(36).slice(2);
  const record: ToastRecord = { id, variant: "default", duration: 4500, ...input };
  memory = [...memory, record];
  emit();
  const timer = setTimeout(() => dismissToast(id), record.duration);
  timers.set(id, timer);
  return id;
}

/** Subscribe to the in-memory toast store. */
export function useToast() {
  const [toasts, setToasts] = React.useState<ToastRecord[]>(memory);

  React.useEffect(() => {
    const listener: Listener = (next) => setToasts(next);
    listeners.add(listener);
    setToasts(memory);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return { toasts, toast, dismiss: dismissToast };
}
