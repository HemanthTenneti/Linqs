"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { DownloadSimple, FileZip } from "@phosphor-icons/react";

interface CleanedFileResult {
  id: string;
  downloadUrl: string;
  cleanedName: string;
}

interface DownloadAllButtonProps {
  results: CleanedFileResult[];
  batchId: string;
}

export function DownloadAllButton({ results, batchId }: DownloadAllButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Call the zip download API
      const res = await fetch("/api/files/download-zip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileIds: results.map((r) => r.id) }),
      });

      if (!res.ok) throw new Error("Failed to create zip");

      const data = await res.json();
      if (data.downloadUrl) {
        window.open(data.downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Zip download failed:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={handleDownload}
      disabled={loading}
      className="inline-flex items-center gap-2 px-4 py-2 bg-[var(--color-text)] text-[var(--color-bg)] text-sm font-medium rounded-[var(--radius-md)] hover:bg-[var(--color-accent)] hover:text-white transition-colors disabled:opacity-50 disabled:pointer-events-none border-2 border-[var(--color-border)]"
    >
      {loading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        <FileZip size={18} weight="bold" />
      )}
      {loading ? "Creating zip..." : "Download All as ZIP"}
    </motion.button>
  );
}
