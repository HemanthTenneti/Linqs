"use client";

import { ShieldCheck } from "@phosphor-icons/react";

export function Footer() {
  return (
    <footer className="border-t-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="container-narrow py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Privacy note */}
          <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)]">
            <ShieldCheck size={16} className="text-[var(--color-success)]" />
            <span>No data stored after 7 days. Your files, your privacy.</span>
          </div>

          {/* Credits */}
          <div className="text-xs text-[var(--color-text-placeholder)]">
            LinkCleaner &middot; Built for a cleaner web
          </div>
        </div>
      </div>
    </footer>
  );
}
