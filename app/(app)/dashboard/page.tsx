"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { FileHistory } from "@/components/dashboard/FileHistory";
import { Spinner } from "@/components/ui/Spinner";

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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ totalFiles: 0, totalLinksCleaned: 0 });

  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch(`/api/files?page=${page}&limit=20`);
        if (res.ok) {
          const data = await res.json();
          setFiles((prev) => (page === 1 ? data.files : [...prev, ...data.files]));
          setTotal(data.pagination.total);
          setHasMore(data.pagination.hasMore);

          // Compute stats from accumulated files
          const allFiles = page === 1 ? data.files : files;
          setStats({
            totalFiles: data.pagination.total,
            totalLinksCleaned: allFiles.reduce((sum: number, f: FileEntry) => sum + f.linksCleaned, 0),
          });
        }
      } catch (err) {
        console.error("Failed to fetch files:", err);
      } finally {
        setLoading(false);
      }
    }

    if (session) fetchFiles();
  }, [session, page]);

  const formatStorage = (fileCount: number) => {
    // Approximate: assume average 500KB per file in R2
    const mb = fileCount * 0.5;
    return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (loading) {
    return (
      <DashboardShell>
        <div className="flex items-center justify-center py-20">
          <Spinner size="lg" />
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-8"
      >
        {/* Page header */}
        <div>
          <h1 className="text-xl font-bold text-[var(--color-text)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Your cleaning history and statistics
          </p>
        </div>

        {/* Stats cards */}
        <StatsOverview
          totalFiles={stats.totalFiles}
          totalLinksCleaned={stats.totalLinksCleaned}
          storageUsed={formatStorage(stats.totalFiles)}
        />

        {/* File history */}
        <FileHistory
          files={files}
          pagination={{ page, limit: 20, total, hasMore }}
          onLoadMore={() => setPage((p) => p + 1)}
        />
      </motion.div>
    </DashboardShell>
  );
}
