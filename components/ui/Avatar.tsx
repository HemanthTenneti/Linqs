"use client";

import { User } from "@phosphor-icons/react";

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: "sm" | "md" | "lg";
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-12 h-12 text-base",
};

// Returns initials from a name string (e.g., "John Doe" → "JD")
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function Avatar({ src, name, size = "md" }: AvatarProps) {
  const initials = name ? getInitials(name) : null;

  return (
    <div
      className={`
        ${sizeClasses[size]}
        rounded-full flex items-center justify-center overflow-hidden
        bg-[var(--color-bg-secondary)] border border-[var(--color-border)]
        flex-shrink-0
      `}
    >
      {src ? (
        <img
          src={src}
          alt={name || "User avatar"}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : initials ? (
        <span className="font-medium text-[var(--color-text-secondary)]">{initials}</span>
      ) : (
        <User size={16} className="text-[var(--color-text-placeholder)]" />
      )}
    </div>
  );
}
