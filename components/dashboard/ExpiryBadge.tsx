"use client";

interface ExpiryBadgeProps {
  expiresAt: string;
  status: string;
}

export function ExpiryBadge({ expiresAt, status }: ExpiryBadgeProps) {
  // Handle failed status
  if (status === "failed") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
        Failed
      </span>
    );
  }

  if (status === "processing") {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
        Processing
      </span>
    );
  }

  const expires = new Date(expiresAt);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

  // Expired
  if (days === 0) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--color-danger-bg)] text-[var(--color-danger)]">
        Expired
      </span>
    );
  }

  // Less than 2 days — warning
  if (days <= 2) {
    return (
      <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--color-warning-bg)] text-[var(--color-warning)]">
        {days} day{days !== 1 ? "s" : ""} left
      </span>
    );
  }

  // Normal
  return (
    <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-[var(--radius-sm)] bg-[var(--color-success-bg)] text-[var(--color-success)]">
      {days} days left
    </span>
  );
}
