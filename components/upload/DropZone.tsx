"use client";

import { useCallback, useState, useRef } from "react";
import { motion } from "framer-motion";
import { CloudArrowUp, File, X } from "@phosphor-icons/react";

// Allowed MIME types and their corresponding extensions
const ALLOWED_TYPES: Record<string, string> = {
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "docx",
  "application/msword": "doc",
  "application/pdf": "pdf",
  "text/markdown": "md",
  "text/plain": "txt",
};

// Also allow common extensions for when MIME detection is inconsistent
const ALLOWED_EXTENSIONS = new Set(["docx", "doc", "pdf", "md", "txt"]);
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_FILES = 5;

interface DropZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
}

export function DropZone({ onFilesSelected, disabled = false }: DropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Validates a single file — checks MIME and extension, and size
  const validateFile = (file: File): string | null => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";

    // Check extension first (more reliable than MIME in some browsers)
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return `"${file.name}" is not a supported format. Use .docx, .doc, .pdf, .md, or .txt`;
    }

    // Also verify MIME type if available
    if (file.type && !(file.type in ALLOWED_TYPES) && file.type !== "text/x-markdown") {
      // Some browsers report .md as text/x-markdown, that's fine
      if (ext !== "md") {
        return `"${file.name}" has an unsupported MIME type.`;
      }
    }

    if (file.size > MAX_FILE_SIZE) {
      return `"${file.name}" exceeds the 10MB limit.`;
    }

    if (file.size === 0) {
      return `"${file.name}" is empty.`;
    }

    return null;
  };

  const handleFiles = useCallback(
    (fileList: FileList | File[]) => {
      if (disabled) return;
      setError(null);

      const files = Array.from(fileList);

      if (files.length > MAX_FILES) {
        setError(`Maximum ${MAX_FILES} files at a time.`);
        return;
      }

      // Validate each file
      for (const file of files) {
        const err = validateFile(file);
        if (err) {
          setError(err);
          return;
        }
      }

      onFilesSelected(files);
    },
    [disabled, onFilesSelected]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) setIsDragOver(true);
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [disabled, handleFiles]
  );

  const handleClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.click();
    }
  };

  return (
    <div>
      <motion.div
        whileHover={!disabled ? { scale: 1.005 } : undefined}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`
          relative flex flex-col items-center justify-center py-16 px-8
          border-2 border-dashed rounded-[var(--radius-xl)]
          transition-colors duration-200
          ${
            disabled
              ? "opacity-50 border-[var(--color-border)]"
              : isDragOver
              ? "border-[var(--color-accent)] bg-[var(--color-accent)]/5 drag-glow"
              : "border-[var(--color-border)] hover:border-[var(--color-border-hover)] hover:bg-[var(--color-bg-hover)]"
          }
        `}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Drop files here or click to browse"
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") handleClick();
        }}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".docx,.doc,.pdf,.md,.txt"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center mb-4
            transition-colors duration-200
            ${isDragOver ? "bg-[var(--color-accent)]/10" : "bg-[var(--color-bg-secondary)]"}
          `}
        >
          <CloudArrowUp
            size={32}
            weight="duotone"
            className={`transition-colors ${isDragOver ? "text-[var(--color-accent)]" : "text-[var(--color-text-placeholder)]"}`}
          />
        </div>

        <p className="text-base font-medium text-[var(--color-text)] mb-1">
          {isDragOver ? "Drop your files here" : "Drag & drop your files here"}
        </p>
        <p className="text-sm text-[var(--color-text-secondary)]">
          or click to browse &middot; .docx, .pdf, .md, .txt, .doc
        </p>
        <p className="text-xs text-[var(--color-text-placeholder)] mt-2">
          Up to 5 files, 10MB each
        </p>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 flex items-center gap-2 px-3 py-2 bg-[var(--color-danger-bg)] rounded-[var(--radius-md)]"
        >
          <X size={14} className="text-[var(--color-danger)] flex-shrink-0" />
          <span className="text-sm text-[var(--color-danger)]">{error}</span>
        </motion.div>
      )}
    </div>
  );
}
