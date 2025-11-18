// @ts-nocheck
"use client";

import * as React from "react";
import { useFluxLynx } from "@fluxlynx/react";
import { cn } from "../lib/utils";
import { Button } from "./button";
import { Heart, ThumbsUp, Star } from "lucide-react";

type IconType = "heart" | "thumbs-up" | "star";

const Icons = {
  heart: Heart,
  "thumbs-up": ThumbsUp,
  star: Star,
};

interface InteractionToggleProps {
  targetId: string; // The ID of the thing being interacted with (e.g. changelog item ID)
  kind?: string; // "like", "upvote", "star"
  icon?: IconType;
  className?: string;
  showCount?: boolean;
}

export function InteractionToggle({
  targetId,
  kind = "like",
  icon = "heart",
  className,
  showCount = true,
}: InteractionToggleProps) {
  const { trpc } = useFluxLynx();
  const [count, setCount] = React.useState<number>(0);
  const [active, setActive] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  // Fetch initial stats
  // Note: React Query will cache this, but we want fresh stats
  const statsQuery = trpc.interactions.stats.useQuery(
    { targetId, kind },
    { 
      enabled: !!targetId,
      refetchOnWindowFocus: false 
    }
  );

  React.useEffect(() => {
    if (statsQuery.data) {
      setCount(statsQuery.data.counts?.[kind] ?? 0);
      setIsLoading(false);
      // We don't know if *this* user liked it unless we track it locally or have auth.
      // For now, we use local storage to remember "active" state for anonymous users.
      const key = `flx_int_${kind}_${targetId}`;
      setActive(!!localStorage.getItem(key));
    }
  }, [statsQuery.data, kind, targetId]);

  const submitMutation = trpc.interactions.submit.useMutation();

  const handleClick = async () => {
    // Optimistic update
    const nextActive = !active;
    setActive(nextActive);
    setCount((prev) => (nextActive ? prev + 1 : Math.max(0, prev - 1)));

    // Persist local state
    const key = `flx_int_${kind}_${targetId}`;
    if (nextActive) {
      localStorage.setItem(key, "1");
    } else {
      localStorage.removeItem(key);
    }

    // Send to backend
    // If un-liking, we don't actually have an "un-submit" in the basic router yet
    // The current router is append-only interactions.
    // To keep it simple for this version: we only allow "adding" interactions on the backend,
    // but UI toggles.
    // Ideally backend supports "delete" or "value: -1".
    // Let's just send value: 1. The router doesn't support "undo" yet.
    // TODO: Update router to support undo/delete.
    // For now, we will only fire mutation if `nextActive` is true.
    
    if (nextActive) {
      submitMutation.mutate({
        targetId,
        kind,
        value: 1,
        // actorId: getFingerprint() // could implement fingerprinting
      });
    }
  };

  const Icon = Icons[icon] || Heart;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={cn(
        "gap-2 transition-colors",
        active ? "text-red-500 hover:text-red-600" : "text-muted-foreground",
        className
      )}
      onClick={handleClick}
    >
      <Icon className={cn("h-4 w-4", active && "fill-current")} />
      {showCount && (
        <span className="text-xs font-medium tabular-nums">
          {isLoading ? "-" : count}
        </span>
      )}
    </Button>
  );
}

