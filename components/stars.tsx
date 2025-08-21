"use client";
import * as React from "react";
import { useFluxLynx } from "@fluxlynx/react";
import { cn } from "@/lib/utils";

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
  const [hover, setHover] = React.useState<number | null>(null);
  const [current, setCurrent] = React.useState<number>(value);
  const [submitting, setSubmitting] = React.useState(false);
  const { submit } = useFluxLynx("stars", { componentId });

  async function handleSubmit(next: number) {
    setSubmitting(true);
    try {
      const res = await submit({ rating: next });
      onSubmitted?.(res.ok);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={cn("flx-stars", className)} role="radiogroup" aria-label="Rating">
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
              "flx-star",
              active ? "flx-star--active" : "flx-star--inactive"
            )}
            title={`${idx} star${idx > 1 ? "s" : ""}`}
          >
            {active ? "★" : "☆"}
          </button>
        );
      })}
      <style jsx>{`
        .flx-star {
          cursor: pointer;
          font-size: 1.25rem;
          line-height: 1;
          background: none;
          border: 0;
          padding: 0 2px;
        }
        .flx-star--active {
          color: #f5b301;
        }
        .flx-star--inactive {
          color: #c7c7c7;
        }
        .flx-stars {
          display: inline-flex;
          align-items: center;
        }
      `}</style>
    </div>
  );
}
