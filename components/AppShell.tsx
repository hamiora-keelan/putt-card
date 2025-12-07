import React from "react";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex min-h-screen max-w-md flex-col px-4 pt-3 pb-6">
        {children}
      </div>
    </div>
  );
}
