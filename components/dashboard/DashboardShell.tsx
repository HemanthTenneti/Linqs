"use client";

// Simple full-width shell for the unified dashboard workspace
export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full">
      <div className="max-w-[1400px] mx-auto w-full py-2 sm:py-4">
        {children}
      </div>
    </div>
  );
}
