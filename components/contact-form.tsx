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
    name: string;
    email: string;
    message: string;
  }>({
    name: "",
    email: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await trpc.feedback.submit.mutate({
        kind: "contact",
        componentId,
        data: state,
      });
      onSubmitted?.(res.ok);
      if (res.ok) {
        setState({ name: "", email: "", message: "" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        "grid gap-2 max-w-md",
        className
      )}
    >
      <label className="grid gap-1 text-[0.9rem]">
        Name
        <input
          value={state.name}
          onChange={(e) => setState((s) => ({ ...s, name: e.target.value }))}
          required
          className="border border-gray-300 rounded-md px-2.5 py-2 text-base"
        />
      </label>
      <label className="grid gap-1 text-[0.9rem]">
        Email
        <input
          type="email"
          value={state.email}
          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
          required
          className="border border-gray-300 rounded-md px-2.5 py-2 text-base"
        />
      </label>
      <label className="grid gap-1 text-[0.9rem]">
        Message
        <textarea
          value={state.message}
          onChange={(e) => setState((s) => ({ ...s, message: e.target.value }))}
          required
          rows={4}
          className="border border-gray-300 rounded-md px-2.5 py-2 text-base"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className={cn(
          "bg-gray-900 text-white rounded-md px-3 py-2 cursor-pointer disabled:opacity-60 disabled:cursor-default"
        )}
      >
        {submitting ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
