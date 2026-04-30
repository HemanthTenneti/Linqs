"use client";

import { motion } from "framer-motion";
import { Timer } from "@phosphor-icons/react";
import { FileResultCard } from "./FileResultCard";
import { DownloadAllButton } from "./DownloadAllButton";
import { StatsBar } from "@/components/processing/StatsBar";

interface CleanedLink {
  original: string;
  cleaned: string;
  removedParams: string[];
}

interface CleanedFileResult {
  id: string;
  originalName: string;
  fileType: "docx" | "doc" | "pdf" | "md" | "txt";
  fileSize: number;
  status: "completed" | "failed";
  linksFound: number;
  linksCleaned: number;
  linksUntouched: number;
  cleanedLinks: CleanedLink[];
  downloadUrl: string;
  cleanedName: string;
  warning?: string;
  expiresAt: string;
}

interface ResultsSectionProps {
  results: CleanedFileResult[];
  batchId: string;
}

// Formats expiry date into a human-readable countdown
function getExpiryText(isoDate: string): string {
  const expires = new Date(isoDate);
  const now = new Date();
  const diffMs = expires.getTime() - now.getTime();
  const days = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  return days > 0 ? `Expires in ${days} day${days !== 1 ? "s" : ""}` : "Expired";
}

export function ResultsSection({ results, batchId }: ResultsSectionProps) {
  const totalLinksFound = results.reduce((sum, r) => sum + r.linksFound, 0);
  const totalLinksCleaned = results.reduce((sum, r) => sum + r.linksCleaned, 0);
  const totalLinksUntouched = results.reduce((sum, r) => sum + r.linksUntouched, 0);
  const expiryDate = results[0]?.expiresAt || "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-5"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-[var(--color-text)]">
            Cleaning Complete
          </h2>
          {expiryDate && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-text-secondary)] mt-1">
              <Timer size={14} />
              {getExpiryText(expiryDate)}
            </div>
          )}
        </div>
        {results.length > 1 && (
          <DownloadAllButton results={results} batchId={batchId} />
        )}
      </div>

      {/* Stats */}
      <StatsBar
        linksFound={totalLinksFound}
        linksCleaned={totalLinksCleaned}
        linksUntouched={totalLinksUntouched}
      />

      {/* File result cards — staggered entry */}
      <div className="flex flex-col gap-4">
        {results.map((result, i) => (
          <motion.div
            key={result.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
          >
            <FileResultCard result={result} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
