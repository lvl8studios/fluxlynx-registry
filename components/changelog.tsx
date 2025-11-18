// @ts-nocheck
"use client";

import * as React from "react";
import { useFluxLynx } from "@fluxlynx/react";
import { cn } from "../lib/utils";
import { Bell, X } from "lucide-react";
import { format } from "date-fns";
import { Button } from "./button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog";
import { ScrollArea } from "./scroll-area";
import { Badge } from "./badge";

const DEFAULT_KIND = "changelog";
const DEFAULT_LIMIT = 20;
const STORAGE_KEY = "fluxlynx:lastChangelogVersion";

function getEntryVersion(entry?: any) {
  if (!entry) return null;
  return entry.metadata?.version ?? entry.id ?? null;
}

function useChangelogSeen(kind: string, version?: string) {
  const key = React.useMemo(() => `${STORAGE_KEY}:${kind}`, [kind]);
  const [seenVersion, setSeenVersion] = React.useState<string | null | undefined>(
    undefined,
  );

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    setSeenVersion(localStorage.getItem(key));
  }, [key]);

  const markSeen = React.useCallback(() => {
    if (typeof window === "undefined" || !version) return;
    localStorage.setItem(key, version);
    setSeenVersion(version);
  }, [key, version]);

  const hasUnread =
    Boolean(version) &&
    seenVersion !== undefined &&
    seenVersion !== version;

  return { hasUnread, markSeen, ready: seenVersion !== undefined };
}

export type UseChangelogOptions = {
  kind?: string;
  limit?: number;
};

export function useChangelogEntries(options?: UseChangelogOptions) {
  const kind = options?.kind ?? DEFAULT_KIND;
  const limit = options?.limit ?? DEFAULT_LIMIT;
  const { trpc } = useFluxLynx();
  const query = trpc.content.list.useQuery({ kind, limit });
  const items = query.data?.items ?? [];
  const latest = items[0];
  const latestVersion = getEntryVersion(latest);

  return {
    ...query,
    items,
    latest,
    latestVersion,
    kind,
  };
}

export type ChangelogWidgetProps = UseChangelogOptions & {
  className?: string;
};

export function ChangelogWidget({
  className,
  kind,
  limit = 10,
}: ChangelogWidgetProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { items, isLoading, latestVersion, kind: resolvedKind } =
    useChangelogEntries({ kind, limit });
  const { hasUnread, markSeen } = useChangelogSeen(resolvedKind, latestVersion);
  const hasUpdates = items.length > 0;

  React.useEffect(() => {
    if (isOpen && latestVersion) {
      markSeen();
    }
  }, [isOpen, latestVersion, markSeen]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("relative rounded-full w-10 h-10", className)}
        >
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">What&apos;s New</h4>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              Loading updates...
            </div>
          ) : !hasUpdates ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              No updates yet.
            </div>
          ) : (
            <div className="divide-y">
              {items.map((item: any) => (
                <div key={item.id} className="p-4 hover:bg-muted/50">
                  <div className="mb-1 flex items-center justify-between">
                    <h5 className="font-medium text-sm">{item.title}</h5>
                    {item.metadata?.version && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                        {item.metadata.version}
                      </Badge>
                    )}
                  </div>
                  <div className="mb-2 text-xs text-muted-foreground">
                    {item.publishedAt
                      ? format(new Date(item.publishedAt), "MMMM d, yyyy")
                      : "—"}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

export type ChangelogDialogProps = UseChangelogOptions & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
};

export function ChangelogDialog({
  open,
  onOpenChange,
  kind,
  limit,
  title = "Product Updates",
}: ChangelogDialogProps) {
  const { items, isLoading } = useChangelogEntries({ kind, limit: limit ?? 30 });

  if (!items.length && !isLoading) return null;

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-h-[80vh] overflow-hidden">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>
            Stay up to date with the latest improvements.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 max-h-[60vh] overflow-y-auto pr-2">
          {isLoading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Loading changelog...
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((entry: any) => (
                <div key={entry.id} className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      {entry.metadata?.version ? `Version ${entry.metadata.version}` : entry.title}
                    </span>
                    {entry.publishedAt && (
                      <span>{format(new Date(entry.publishedAt), "MMM d, yyyy")}</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">
                    {entry.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => onOpenChange(false)}>
            Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type ChangelogUpdatePromptProps = UseChangelogOptions & {
  highlightCount?: number;
  title?: string;
};

export function ChangelogUpdatePrompt({
  kind,
  limit = 5,
  highlightCount = 3,
  title = "New update available!",
}: ChangelogUpdatePromptProps) {
  const { items, isLoading, latest, latestVersion, kind: resolvedKind } =
    useChangelogEntries({ kind, limit });
  const { hasUnread, markSeen, ready } = useChangelogSeen(resolvedKind, latestVersion);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (!ready || isLoading) return;
    if (hasUnread) {
      setOpen(true);
    }
  }, [hasUnread, ready, isLoading]);

  if (!latest || !latestVersion) return null;

  const highlights = Array.isArray(latest.metadata?.changes)
    ? latest.metadata?.changes.slice(0, highlightCount)
    : latest.body
      ?.split("\n")
      .map((line: string) => line.trim())
      .filter(Boolean)
      .slice(0, highlightCount);

  const close = () => {
    markSeen();
    setOpen(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={(value) => (value ? setOpen(true) : close())}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            {latest.metadata?.version && (
              <div className="text-sm font-semibold text-foreground">
                Version {latest.metadata.version}
              </div>
            )}
            {highlights?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-left text-sm text-muted-foreground">
                {highlights.map((change: string, index: number) => (
                  <li key={index}>{change}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground whitespace-pre-line">
                {latest.body}
              </p>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={close}>Great!</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export type ChangelogIndicatorProps = UseChangelogOptions & {
  className?: string;
};

export function ChangelogIndicator({
  kind,
  limit = 1,
  className,
}: ChangelogIndicatorProps) {
  const { latestVersion, kind: resolvedKind } = useChangelogEntries({ kind, limit });
  const { hasUnread } = useChangelogSeen(resolvedKind, latestVersion);

  if (!hasUnread) return null;

  return (
    <span
      className={cn(
        "inline-flex h-2 w-2 rounded-full bg-red-500",
        className,
      )}
    />
  );
}
