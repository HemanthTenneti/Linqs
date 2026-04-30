"use client";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: boolean;
  hover?: boolean;
}

// Notion-style card: white bg, subtle border, 8px radius, minimal shadow
export function Card({
  children,
  className = "",
  padding = true,
  hover = false,
}: CardProps) {
  return (
    <div
      className={`
        bg-[color-mix(in_srgb,var(--color-bg)_94%,white_6%)] rounded-[var(--radius-lg)]
        border border-[var(--color-border)]/70
        shadow-[0_8px_22px_rgba(44,29,14,0.06)]
        ${hover ? "hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-hover)] transition-all duration-150" : ""}
        ${padding ? "p-5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
