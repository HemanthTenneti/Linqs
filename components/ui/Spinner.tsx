"use client";

// Accessible loading spinner with pulsing dots (Notion-style)
export function Spinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dotSize = { sm: "w-1.5 h-1.5", md: "w-2.5 h-2.5", lg: "w-3.5 h-3.5" }[size];
  const gap = { sm: "gap-1", md: "gap-1.5", lg: "gap-2" }[size];

  return (
    <div className="flex items-center justify-center" role="status" aria-label="Loading">
      <span className={`flex items-center ${gap}`}>
        <span
          className={`${dotSize} rounded-full bg-[var(--color-accent)] pulse-dot`}
        />
        <span
          className={`${dotSize} rounded-full bg-[var(--color-accent)] pulse-dot`}
        />
        <span
          className={`${dotSize} rounded-full bg-[var(--color-accent)] pulse-dot`}
        />
      </span>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
