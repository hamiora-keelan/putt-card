"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  name: string;
  score?: number;
  active?: boolean;
  onClick?: () => void;
};

export function PlayerChip({ name, score, active, onClick }: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-full border border-border bg-bg px-3 py-2 text-left text-sm text-text transition",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
        active ? "border-primary text-primary" : "hover:border-primary/60"
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate">{name}</span>
        <span className="text-xs text-muted">{typeof score === "number" ? score : "–"}</span>
      </div>
    </button>
  );
}
