"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  DownloadSimple,
  CaretDown,
  CaretUp,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";
import { Badge, FileTypeIcon } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { LinkDiffList } from "./LinkDiffList";

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

interface FileResultCardProps {
  result: CleanedFileResult;
}

const badgeVariantMap: Record<string, "docx" | "doc" | "pdf" | "md" | "txt"> = {
  docx: "docx",
  doc: "doc",
  pdf: "pdf",
  md: "md",
  txt: "txt",
};

export function FileResultCard({ result }: FileResultCardProps) {
  const [expanded, setExpanded] = useState(false);
  const isFailed = result.status === "failed";

  return (
    <div className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[var(--shadow-sm)] overflow-hidden rotate-[-0.2deg]">
      <div className="p-4">
        {/* Top row: icon + name + status + download */}
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <FileTypeIcon type={result.fileType} size={22} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[var(--color-text)] truncate">
                {result.originalName}
              </span>
              <Badge variant={badgeVariantMap[result.fileType] || "txt"}>
                .{result.fileType}
              </Badge>
            </div>

            {/* Stats line */}
            {!isFailed && (
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-[var(--color-text-secondary)]">
                  {result.linksFound} links found
                </span>
                <span className="text-xs text-[var(--color-success)]">
                  {result.linksCleaned} cleaned
                </span>
                {result.linksUntouched > 0 && (
                  <span className="text-xs text-[var(--color-text-placeholder)]">
                    {result.linksUntouched} already clean
                  </span>
                )}
              </div>
            )}

            {isFailed && (
              <div className="flex items-center gap-1.5 mt-1">
                <WarningCircle size={14} className="text-[var(--color-danger)]" />
                <span className="text-xs text-[var(--color-danger)]">Processing failed</span>
              </div>
            )}

            {result.warning && (
              <p className="text-xs text-[var(--color-warning)] mt-1">{result.warning}</p>
            )}
          </div>

          {/* Download button */}
          {!isFailed && result.downloadUrl && (
            <motion.a
              href={result.downloadUrl}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            className="flex-shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-text)] text-[var(--color-bg)] text-xs font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-accent)] hover:text-white transition-colors"
              download={result.cleanedName}
            >
              <DownloadSimple size={14} weight="bold" />
              Download
            </motion.a>
          )}
        </div>
      </div>

      {/* Expandable link diff */}
      {result.cleanedLinks.length > 0 && (
        <div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-center gap-1.5 px-4 py-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] border-t-2 border-[var(--color-border)] transition-colors"
          >
            {expanded ? (
              <>
                <CaretUp size={14} /> Hide link details
              </>
            ) : (
              <>
                <CaretDown size={14} /> Show {result.cleanedLinks.length} cleaned links
              </>
            )}
          </button>
          {expanded && <LinkDiffList links={result.cleanedLinks} />}
        </div>
      )}
    </div>
  );
}
