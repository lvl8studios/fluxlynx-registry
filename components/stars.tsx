// @ts-nocheck
"use client";
import * as React from "react";
import { useFluxLynx } from "@fluxlynx/react";
import { cn } from "../lib/utils";
import { useState } from "react";

export type StarsProps = {
  max?: number;
  value?: number;
  componentId?: string;
  className?: string;
  onSubmitted?: (ok: boolean) => void;
};

export default function Stars({
  max = 5,
  value = 0,
  componentId,
  className,
  onSubmitted,
}: StarsProps) {
  const [hover, setHover] = useState<number | null>(null);
  const [current, setCurrent] = useState<number>(value);
  const [submitting, setSubmitting] = useState(false);
  const { trpc } = useFluxLynx();

  async function handleSubmit(next: number) {
    setSubmitting(true);
    try {
      const res = await trpc.feedback.submit.mutate({
        kind: "stars",
        componentId,
        data: { rating: next },
      });
      onSubmitted?.(res.ok);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="radiogroup"
      aria-label="Rating"
    >
      {Array.from({ length: max }).map((_, i) => {
        const idx = i + 1;
        const active = (hover ?? current) >= idx;
        return (
          <button
            key={idx}
            type="button"
            aria-checked={current === idx}
            role="radio"
            disabled={submitting}
            onMouseEnter={() => setHover(idx)}
            onMouseLeave={() => setHover(null)}
            onFocus={() => setHover(idx)}
            onBlur={() => setHover(null)}
            onClick={() => {
              setCurrent(idx);
              handleSubmit(idx);
            }}
            className={cn(
              "cursor-pointer text-2xl leading-none bg-transparent border-0 px-0.5 transition-colors disabled:opacity-60 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-3)] rounded-sm",
              active
                ? "text-yellow-400"
                : "text-neutral-400 dark:text-neutral-600"
            )}
            title={`${idx} star${idx > 1 ? "s" : ""}`}
          >
            {active ? "★" : "☆"}
          </button>
        );
      })}
    </div>
  );
}
