"use client";

import { motion } from "framer-motion";
import { File, CheckCircle, WarningCircle, Spinner } from "@phosphor-icons/react";
import { Spinner as LoadingSpinner } from "@/components/ui/Spinner";

type FileStatus = "pending" | "processing" | "completed" | "failed";

interface FileStatusItem {
  name: string;
  status: FileStatus;
}

interface ProcessingStatusProps {
  files: FileStatusItem[];
}

const statusIcons: Record<FileStatus, React.ReactNode> = {
  pending: <div className="w-4 h-4 rounded-full border-2 border-[var(--color-text-placeholder)]" />,
  processing: <LoadingSpinner size="sm" />,
  completed: <CheckCircle size={18} weight="fill" className="text-[var(--color-success)]" />,
  failed: <WarningCircle size={18} weight="fill" className="text-[var(--color-danger)]" />,
};

export function ProcessingStatus({ files }: ProcessingStatusProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-[var(--color-bg)] border-2 border-[var(--color-border)] rounded-[var(--radius-xl)] p-6 shadow-[var(--shadow-sm)]"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/10 flex items-center justify-center border border-[var(--color-border)]">
          <Spinner size={22} className="text-[var(--color-accent)] animate-spin" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text)]">
            Processing your files
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            Extracting and cleaning links...
          </p>
        </div>
      </div>

      {/* Per-file status list */}
      <div className="flex flex-col gap-2.5">
        {files.map((file, i) => (
          <motion.div
            key={file.name}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--color-bg-secondary)] border border-[var(--color-border)]"
          >
            <File size={16} className="text-[var(--color-text-secondary)] flex-shrink-0" />
            <span className="flex-1 text-sm text-[var(--color-text)] truncate">
              {file.name}
            </span>
            <div className="flex-shrink-0">{statusIcons[file.status]}</div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
