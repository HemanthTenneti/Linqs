"use client";

import { motion } from "framer-motion";
import { FileHistoryRow } from "./FileHistoryRow";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { Broom } from "@phosphor-icons/react";
import Link from "next/link";

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

interface FileHistoryProps {
  files: FileEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
  onLoadMore: () => void;
}

export function FileHistory({ files, pagination, onLoadMore }: FileHistoryProps) {
  if (files.length === 0) {
    return (
      <EmptyState
        title="No files yet"
        description="Upload your first document to start cleaning tracking parameters from URLs."
        action={
          <Link href="/clean">
            <Button icon={<Broom size={16} />}>Clean Your First File</Button>
          </Link>
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-base font-semibold text-[var(--color-text)]">
          Recent Cleans
        </h3>
        <span className="text-xs text-[var(--color-text-secondary)]">
          {pagination.total} file{pagination.total !== 1 ? "s" : ""}
        </span>
      </div>

      {/* File list */}
      <div className="flex flex-col gap-2">
        {files.map((file, i) => (
          <motion.div
            key={file.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <FileHistoryRow file={file} />
          </motion.div>
        ))}
      </div>

      {/* Load more */}
      {pagination.hasMore && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={onLoadMore}>
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}
