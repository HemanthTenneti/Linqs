"use client";

import { DownloadSimple, Trash } from "@phosphor-icons/react";
import { Badge, FileTypeIcon } from "@/components/ui/Badge";
import { ExpiryBadge } from "./ExpiryBadge";

interface FileEntry {
  id: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  linksFound: number;
  linksCleaned: number;
  status: string;
  createdAt: string;
  expiresAt: string;
  downloadUrl: string | null;
  cleanedName: string | null;
}

interface FileHistoryRowProps {
  file: FileEntry;
}

const badgeVariantMap: Record<string, "docx" | "doc" | "pdf" | "md" | "txt"> = {
  docx: "docx",
  doc: "doc",
  pdf: "pdf",
  md: "md",
  txt: "txt",
};

function formatRelativeDate(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function FileHistoryRow({ file }: FileHistoryRowProps) {
  const isFailed = file.status === "failed";
  const variant = badgeVariantMap[file.fileType] || "txt";

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-[var(--color-bg)] border border-[var(--color-border)]/70 rounded-[18px] hover:border-[var(--color-border-hover)] transition-colors shadow-[0_4px_12px_rgba(44,29,14,0.04)]">
      {/* File icon */}
      <div className="flex-shrink-0">
        <FileTypeIcon type={file.fileType} size={20} />
      </div>

      {/* File info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--color-text)] truncate">
            {file.originalName}
          </span>
          <Badge variant={variant}>.{file.fileType}</Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {formatRelativeDate(file.createdAt)}
          </span>
          {!isFailed && (
            <>
              <span className="text-xs text-[var(--color-text-secondary)]">
                {file.linksCleaned}/{file.linksFound} links cleaned
              </span>
            </>
          )}
        </div>
      </div>

      {/* Status badge */}
      <div className="flex-shrink-0 hidden sm:block">
        <ExpiryBadge expiresAt={file.expiresAt} status={file.status} />
      </div>

      {/* Download button */}
      {file.downloadUrl && !isFailed && (
        <a
          href={file.downloadUrl}
          download={file.cleanedName}
          className="flex-shrink-0 p-2 rounded-[var(--radius-md)] text-[var(--color-text-secondary)] hover:text-[var(--color-accent)] hover:bg-[var(--color-bg-hover)] transition-colors"
          aria-label={`Download ${file.cleanedName}`}
        >
          <DownloadSimple size={16} />
        </a>
      )}
    </div>
  );
}
