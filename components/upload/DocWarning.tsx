"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Warning } from "@phosphor-icons/react";

interface DocWarningProps {
  show: boolean;
}

// Yellow warning banner shown when .doc files are detected
export function DocWarning({ show }: DocWarningProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden"
        >
          <div className="flex items-start gap-3 px-4 py-3 bg-[var(--color-warning-bg)] border border-[var(--color-warning)]/20 rounded-[var(--radius-md)] mt-4">
            <Warning size={18} weight="fill" className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-[var(--color-warning)]">
                Legacy .doc format detected
              </p>
              <p className="text-xs text-[var(--color-warning)]/80 mt-0.5">
                Formatting may not be fully preserved for .doc files. For best results, convert to .docx before uploading.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
