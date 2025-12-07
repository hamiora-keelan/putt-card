/* eslint-disable react/button-has-type */
"use client";

import React from "react";
import { cn } from "@/lib/utils";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function PrimaryButton({ className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "w-full rounded-full bg-primary px-4 py-3 text-center text-sm font-semibold text-bg",
        "disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    />
  );
}

export function GhostButton({ className, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        "w-full rounded-full border border-border px-4 py-2.5 text-center text-sm font-medium text-muted",
        "hover:border-primary hover:text-text disabled:cursor-not-allowed disabled:opacity-40",
        className
      )}
    />
  );
}
