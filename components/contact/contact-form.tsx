"use client";
import * as React from "react";
import { useFluxLynx } from "@fluxlynx/react";
import { cn } from "@/lib/utils";

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
  const { submit } = useFluxLynx("contact", { componentId });
  const [state, setState] = React.useState<{
    name: string;
    email: string;
    message: string;
  }>({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await submit(state);
      onSubmitted?.(res.ok);
      if (res.ok) {
        setState({ name: "", email: "", message: "" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn("flx-contact", className)}>
      <label>
        Name
        <input
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          required
        />
      </label>
      <label>
        Email
        <input
          type="email"
          value={state.email}
          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
          required
        />
      </label>
      <label>
        Message
        <textarea
          value={state.message}
          onChange={(e) => setState((s) => ({ ...s, message: e.target.value }))}
          required
          rows={4}
        />
      </label>
      <button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send"}
      </button>
      <style jsx>{`
        .flx-contact {
          display: grid;
          gap: 0.5rem;
          max-width: 28rem;
        }
        label {
          display: grid;
          gap: 0.25rem;
          font-size: 0.9rem;
        }
        input,
        textarea {
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 0.5rem 0.625rem;
          font: inherit;
        }
        button {
          background: #111827;
          color: white;
          border: 0;
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.6;
          cursor: default;
        }
      `}</style>
    </form>
  );
}
