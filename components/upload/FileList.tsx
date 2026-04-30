"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "@phosphor-icons/react";
import { Badge, FileTypeIcon } from "@/components/ui/Badge";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
}

// Format bytes to human-readable size
function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Get the file extension from a filename
function getExtension(name: string): string {
  return name.split(".").pop()?.toLowerCase() || "";
}

const badgeVariantMap: Record<string, "docx" | "doc" | "pdf" | "md" | "txt"> = {
  docx: "docx",
  doc: "doc",
  pdf: "pdf",
  md: "md",
  txt: "txt",
};

export function FileList({ files, onRemove }: FileListProps) {
  if (files.length === 0) return null;

  return (
    <div className="mt-4 flex flex-col gap-2">
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => {
          const ext = getExtension(file.name);
          const badgeVariant = badgeVariantMap[ext] || "txt";

          return (
            <motion.div
              key={`${file.name}-${file.size}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.9, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-3 px-4 py-2.5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-md)]"
            >
              {/* File type icon */}
              <div className="flex-shrink-0 text-[var(--color-text-secondary)]">
                <FileTypeIcon type={ext} size={20} />
              </div>

              {/* File name */}
              <span className="flex-1 text-sm text-[var(--color-text)] truncate">
                {file.name}
              </span>

              {/* Type badge */}
              <Badge variant={badgeVariant}>.{ext}</Badge>

              {/* Size */}
              <span className="text-xs text-[var(--color-text-secondary)] flex-shrink-0">
                {formatSize(file.size)}
              </span>

              {/* Remove button */}
              <button
                onClick={() => onRemove(index)}
                className="flex-shrink-0 p-1 rounded-[var(--radius-sm)] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] transition-colors"
                aria-label={`Remove ${file.name}`}
              >
                <X size={14} />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
