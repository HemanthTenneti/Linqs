"use client";

import { Sidebar } from "@/components/layout/Sidebar";

// Dashboard layout: sidebar on desktop + main content area
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-3.5rem)] gap-4">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        <div className="container-narrow py-6 sm:py-8">{children}</div>
      </div>
    </div>
  );
}
