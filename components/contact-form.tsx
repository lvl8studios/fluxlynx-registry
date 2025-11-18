// @ts-nocheck
"use client";
import * as React from "react";
import { useFluxLynx } from "@fluxlynx/react";
import { cn } from "../lib/utils";
import { useState } from "react";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";
import { Textarea } from "./textarea";

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
    <form onSubmit={onSubmit} className={cn("grid gap-4 max-w-md", className)}>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="firstName">First name</Label>
          <Input
            id="firstName"
            value={state.firstName}
            onChange={(e) =>
              setState((s) => ({ ...s, firstName: e.target.value }))
            }
            required
            placeholder="Jane"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input
            id="lastName"
            value={state.lastName}
            onChange={(e) =>
              setState((s) => ({ ...s, lastName: e.target.value }))
            }
            required
            placeholder="Doe"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={state.email}
          onChange={(e) => setState((s) => ({ ...s, email: e.target.value }))}
          required
          placeholder="you@example.com"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="company">Company (optional)</Label>
          <Input
            id="company"
            value={state.company}
            onChange={(e) =>
              setState((s) => ({ ...s, company: e.target.value }))
            }
            placeholder="Acme Inc."
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone number</Label>
          <Input
            id="phone"
            value={state.phone}
            onChange={(e) => setState((s) => ({ ...s, phone: e.target.value }))}
            required
            placeholder="(555) 123-4567"
          />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="comments">Comments</Label>
        <Textarea
          id="comments"
          value={state.comments}
          onChange={(e) =>
            setState((s) => ({ ...s, comments: e.target.value }))
          }
          required
          rows={4}
          placeholder="Tell us a bit about your needs..."
        />
      </div>
      <Button type="submit" disabled={submitting}>
        {submitting ? "Sending..." : "Send message"}
      </Button>
    </form>
  );
}
