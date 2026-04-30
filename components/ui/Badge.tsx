"use client";

import {
  FileDoc,
  FilePdf,
  FileText,
  File,
} from "@phosphor-icons/react";

type BadgeVariant =
  | "docx"
  | "doc"
  | "pdf"
  | "md"
  | "txt"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "neutral";

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
  docx: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-blue-700 dark:text-blue-300" },
  doc: { bg: "bg-orange-50 dark:bg-orange-950/40", text: "text-orange-700 dark:text-orange-300" },
  pdf: { bg: "bg-red-50 dark:bg-red-950/40", text: "text-red-700 dark:text-red-300" },
  md: { bg: "bg-green-50 dark:bg-green-950/40", text: "text-green-700 dark:text-green-300" },
  txt: { bg: "bg-gray-50 dark:bg-gray-800/60", text: "text-gray-600 dark:text-gray-300" },
  success: { bg: "bg-[var(--color-success-bg)]", text: "text-[var(--color-success)]" },
  warning: { bg: "bg-[var(--color-warning-bg)]", text: "text-[var(--color-warning)]" },
  danger: { bg: "bg-[var(--color-danger-bg)]", text: "text-[var(--color-danger)]" },
  info: { bg: "bg-blue-50 dark:bg-blue-950/40", text: "text-[var(--color-accent)]" },
  neutral: { bg: "bg-[var(--color-bg-secondary)]", text: "text-[var(--color-text-secondary)]" },
};

// Maps file type to the correct Phosphor icon
export function FileTypeIcon({ type, size = 16 }: { type: string; size?: number }) {
  switch (type) {
    case "docx":
    case "doc":
      return <FileDoc size={size} weight="fill" />;
    case "pdf":
      return <FilePdf size={size} weight="fill" />;
    case "md":
    case "txt":
      return <FileText size={size} weight="fill" />;
    default:
      return <File size={size} weight="fill" />;
  }
}

export function Badge({ variant, children, className = "" }: BadgeProps) {
  const style = variantStyles[variant];
  return (
    <span
      className={`
        inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)]
        ${style.bg} ${style.text}
        ${className}
      `}
    >
      {children}
    </span>
  );
}
