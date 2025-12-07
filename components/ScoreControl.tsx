"use client";

import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
};

export function ScoreControl({ value, onChange, min = 0, max = 20 }: Props) {
  const decrement = () => onChange(Math.max(min, value - 1));
  const increment = () => onChange(Math.min(max, value + 1));

  return (
    <div className="mt-2 flex items-center justify-between rounded-full border border-border bg-surface px-3 py-2 text-sm">
      <button
        type="button"
        onClick={decrement}
        className={cn(
          "h-8 w-8 rounded-full border border-border bg-bg text-lg font-semibold text-text transition hover:border-primary",
          value <= min && "opacity-50"
        )}
      >
        –
      </button>
      <span className="text-base font-semibold tabular-nums">{value}</span>
      <button
        type="button"
        onClick={increment}
        className={cn(
          "h-8 w-8 rounded-full border border-border bg-bg text-lg font-semibold text-text transition hover:border-primary",
          value >= max && "opacity-50"
        )}
      >
        +
      </button>
    </div>
  );
}
