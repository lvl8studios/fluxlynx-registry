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
import { ScrollArea } from "./scroll-area";
import { Badge } from "./badge";

export function ChangelogWidget({ className }: { className?: string }) {
  const { trpc } = useFluxLynx();
  const [isOpen, setIsOpen] = React.useState(false);
  
  // Fetch updates
  const { data, isLoading } = trpc.content.list.useQuery({ kind: "changelog", limit: 10 });
  
  const hasUpdates = (data?.items?.length ?? 0) > 0;

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className={cn("relative rounded-full w-10 h-10", className)}
        >
          <Bell className="h-5 w-5" />
          {hasUpdates && (
            <span className="absolute top-0 right-0 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h4 className="font-semibold">What's New</h4>
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
              {data?.items.map((item: any) => (
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
                    {format(new Date(item.publishedAt), "MMMM d, yyyy")}
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
