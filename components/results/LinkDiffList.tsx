"use client";

import { motion, AnimatePresence } from "framer-motion";

interface CleanedLink {
  original: string;
  cleaned: string;
  removedParams: string[];
}

interface LinkDiffListProps {
  links: CleanedLink[];
}

export function LinkDiffList({ links }: LinkDiffListProps) {
  return (
    <div className="border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
      <div className="p-4 space-y-3">
        {links.map((link, i) => (
          <motion.div
            key={`${link.original}-${i}`}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex flex-col gap-1 text-xs font-mono"
          >
            {/* Original URL */}
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-danger)] flex-shrink-0">-</span>
              <span className="text-[var(--color-text-secondary)] break-all">
                {link.original}
              </span>
            </div>

            {/* Cleaned URL */}
            <div className="flex items-start gap-2">
              <span className="text-[var(--color-success)] flex-shrink-0">+</span>
              <span className="text-[var(--color-text)] break-all">
                {link.cleaned}
              </span>
            </div>

            {/* Removed params tag */}
            {link.removedParams.length > 0 && (
              <div className="flex flex-wrap gap-1 ml-4">
                {link.removedParams.map((param) => (
                  <span
                    key={param}
                    className="inline-block px-1.5 py-0.5 bg-[var(--color-danger-bg)] text-[var(--color-danger)] rounded text-[10px]"
                  >
                    {param}
                  </span>
                ))}
              </div>
            )}

            {/* Separator between links */}
            {i < links.length - 1 && (
              <div className="h-px bg-[var(--color-border)] mt-2" />
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
