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
        bg-[var(--color-bg)] rounded-[var(--radius-lg)]
        border-2 border-[var(--color-border)]
        shadow-[var(--shadow-sm)]
        ${hover ? "hover:shadow-[var(--shadow-md)] hover:border-[var(--color-border-hover)] transition-all duration-150" : ""}
        ${padding ? "p-5" : ""}
        ${className}
      `}
    >
      {children}
    </div>
  );
}
