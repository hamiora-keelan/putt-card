import React from "react";
import { cn } from "@/lib/utils";

type Props = React.HTMLAttributes<HTMLDivElement> & {
  children: React.ReactNode;
};

export function Card({ children, className, ...rest }: Props) {
  return (
    <div className={cn("rounded-lg border border-border bg-surface p-3", className)} {...rest}>
      {children}
    </div>
  );
}
