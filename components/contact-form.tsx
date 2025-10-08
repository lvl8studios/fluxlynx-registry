// @ts-nocheck
"use client";
import * as React from "react";
import { useFluxLynx } from "@fluxlynx/react";
import { cn } from "../lib/utils";
import { useState } from "react";

export type ContactFormProps = {
  componentId?: string;
  className?: string;
  onSubmitted?: (ok: boolean) => void;
};

export default function ContactForm({
  componentId,
  className,
  onSubmitted,
}: ContactFormProps) {
  const { trpc } = useFluxLynx();
  const [state, setState] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    phone: string;
    comments: string;
  }>({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    phone: "",
    comments: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const fullName = `${state.firstName} ${state.lastName}`.trim();
      const res = await trpc.feedback.submit.mutate({
        kind: "contact",
        componentId,
        data: {
          name: fullName || state.email,
          firstName: state.firstName,
          lastName: state.lastName,
          email: state.email,
          company: state.company,
          phone: state.phone,
          comments: state.comments,
        },
      });
      onSubmitted?.(res.ok);
      if (res.ok) {
        setState({
          firstName: "",
          lastName: "",
          email: "",
          company: "",
          phone: "",
          comments: "",
        });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("grid gap-3 max-w-md", className)}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-[0.9rem]">
          First name
          <input
            value={state.firstName}
            onChange={(e) =>
              setState((s) => ({ ...s, firstName: e.target.value }))
            }
            required
            className="mt-1 rounded-md border bg-white/70 px-3 py-2 text-base backdrop-blur-md placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-3)] dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-white"
            placeholder="Jane"
          />
        </label>
        <label className="grid gap-1 text-[0.9rem]">
          Last name
          <input
            value={state.lastName}
            onChange={(e) =>
              setState((s) => ({ ...s, lastName: e.target.value }))
            }
            required
            className="mt-1 rounded-md border bg-white/70 px-3 py-2 text-base backdrop-blur-md placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-3)] dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-white"
            placeholder="Doe"
          />
        </label>
      </div>
      <label className="grid gap-1 text-[0.9rem]">
        Email
        <input
          type="email"
          value={state.email}
          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
          required
          className="mt-1 rounded-md border bg-white/70 px-3 py-2 text-base backdrop-blur-md placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-3)] dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-white"
          placeholder="you@example.com"
        />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-[0.9rem]">
          Company (optional)
          <input
            value={state.company}
            onChange={(e) =>
              setState((s) => ({ ...s, company: e.target.value }))
            }
            className="mt-1 rounded-md border bg-white/70 px-3 py-2 text-base backdrop-blur-md placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-3)] dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-white"
            placeholder="Acme Inc."
          />
        </label>
        <label className="grid gap-1 text-[0.9rem]">
          Phone number
          <input
            value={state.phone}
            onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
            required
            className="mt-1 rounded-md border bg-white/70 px-3 py-2 text-base backdrop-blur-md placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-3)] dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-white"
            placeholder="(555) 123-4567"
          />
        </label>
      </div>
      <label className="grid gap-1 text-[0.9rem]">
        Comments
        <textarea
          value={state.comments}
          onChange={(e) =>
            setState((s) => ({ ...s, comments: e.target.value }))
          }
          required
          rows={4}
          className="mt-1 rounded-md border bg-white/70 px-3 py-2 text-base backdrop-blur-md placeholder:text-neutral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-3)] dark:border-neutral-800 dark:bg-neutral-900/40 dark:text-white"
          placeholder="Tell us a bit about your needs..."
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "inline-flex items-center justify-center rounded-md bg-gradient-to-b from-[var(--brand-2)] to-[var(--brand-3)] px-4 py-2 text-sm font-medium text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] disabled:opacity-60"
        )}
      >
        {submitting ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}
