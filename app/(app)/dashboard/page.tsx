"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowCounterClockwise, Broom } from "@phosphor-icons/react";
import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { DashboardSkeleton } from "@/components/dashboard/DashboardSkeleton";
import { StatsOverview } from "@/components/dashboard/StatsOverview";
import { FileHistory } from "@/components/dashboard/FileHistory";
import { DropZone } from "@/components/upload/DropZone";
import { FileList } from "@/components/upload/FileList";
import { DocWarning } from "@/components/upload/DocWarning";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { ResultsSection } from "@/components/results/ResultsSection";
import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";

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

type CleanState =
  | "idle"
  | "ready"
  | "uploading"
  | "processing"
  | "results"
  | "partial_results"
  | "error";

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

interface ApiCleanResponseFile {
  id?: string;
  originalName?: string;
  fileType?: "docx" | "doc" | "pdf" | "md" | "txt";
  fileSize?: number;
  status?: "completed" | "failed";
  linksFound?: number;
  linksCleaned?: number;
  linksUntouched?: number;
  cleanedLinks?: CleanedLink[];
  downloadUrl?: string;
  cleanedDownloadUrl?: string;
  cleanedName?: string;
  warning?: string;
  expiresAt?: string;
  error?: string;
}

interface ApiCleanResponse {
  batchId?: string;
  results?: ApiCleanResponseFile[];
  files?: ApiCleanResponseFile[];
  summary?: {
    totalFiles?: number;
    totalLinksCleaned?: number;
  };
  totalFiles?: number;
}

function DashboardContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const { addToast } = useToast();
  const cleanRef = useRef<HTMLElement>(null);
  const historyRef = useRef<HTMLElement>(null);

  const [files, setFiles] = useState<FileEntry[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [stats, setStats] = useState({ totalFiles: 0, totalLinksCleaned: 0 });
  const [refreshTick, setRefreshTick] = useState(0);

  const [cleanState, setCleanState] = useState<CleanState>("idle");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CleanedFileResult[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [processingFiles, setProcessingFiles] = useState<
    { name: string; status: "pending" | "processing" | "completed" | "failed" }[]
  >([]);

  useEffect(() => {
    const section = searchParams.get("section");
    if (section !== "clean" && section !== "history") return;
    const timeout = setTimeout(() => {
      if (section === "clean") cleanRef.current?.scrollIntoView({ behavior: "smooth" });
      if (section === "history") historyRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 80);
    return () => clearTimeout(timeout);
  }, [searchParams]);

  useEffect(() => {
    let cancelled = false;

    async function fetchFiles() {
      try {
        if (page === 1) setLoadingHistory(true);
        const res = await fetch(`/api/files?page=${page}&limit=20`);
        if (!res.ok) return;
        const data = await res.json();
        if (cancelled) return;

        setTotal(data.pagination.total);
        setHasMore(data.pagination.hasMore);
        setFiles((prev) => {
          const merged = page === 1 ? (data.files as FileEntry[]) : [...prev, ...data.files];
          setStats({
            totalFiles: data.pagination.total,
            totalLinksCleaned: merged.reduce((sum, item) => sum + item.linksCleaned, 0),
          });
          return merged;
        });
      } catch (err) {
        console.error("Failed to fetch files:", err);
      } finally {
        if (!cancelled) setLoadingHistory(false);
      }
    }

    if (session) fetchFiles();
    return () => {
      cancelled = true;
    };
  }, [session, page, refreshTick]);

  const hasDocFile = useMemo(
    () => selectedFiles.some((file) => file.name.split(".").pop()?.toLowerCase() === "doc"),
    [selectedFiles]
  );

  const handleFilesSelected = (incoming: File[]) => {
    setSelectedFiles((prev) => [...prev, ...incoming]);
    setCleanState("ready");
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length === 0) setCleanState("idle");
      return next;
    });
  };

  const handleResetClean = () => {
    setSelectedFiles([]);
    setResults([]);
    setBatchId(null);
    setErrorMessage(null);
    setProcessingFiles([]);
    setCleanState("idle");
  };

  const handleClean = async () => {
    if (selectedFiles.length === 0) return;

    setCleanState("uploading");
    setErrorMessage(null);
    setProcessingFiles(selectedFiles.map((file) => ({ name: file.name, status: "pending" })));

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => formData.append("files", file));

      setCleanState("processing");
      const progressInterval = setInterval(() => {
        setProcessingFiles((prev) => {
          const idx = prev.findIndex((f) => f.status === "pending");
          if (idx === -1) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev.map((f, i) =>
            i === idx ? { ...f, status: "processing" as const } : f
          );
        });
      }, 750);

      const res = await fetch("/api/clean", { method: "POST", body: formData });
      clearInterval(progressInterval);

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(errData.error || "Processing failed");
      }

      const data = (await res.json()) as ApiCleanResponse;
      const rawResults = Array.isArray(data.results)
        ? data.results
        : Array.isArray(data.files)
        ? data.files
        : [];

      const normalized: CleanedFileResult[] = rawResults.map((r, idx) => {
        const linksFound = r.linksFound ?? 0;
        const linksCleaned = r.linksCleaned ?? 0;
        const linksUntouched = r.linksUntouched ?? Math.max(0, linksFound - linksCleaned);
        return {
          id: r.id && r.id.length > 0 ? r.id : `${idx}-${Date.now()}`,
          originalName: r.originalName ?? selectedFiles[idx]?.name ?? `file-${idx + 1}`,
          fileType: r.fileType ?? "txt",
          fileSize: r.fileSize ?? selectedFiles[idx]?.size ?? 0,
          status: r.status ?? (r.error ? "failed" : "completed"),
          linksFound,
          linksCleaned,
          linksUntouched,
          cleanedLinks: Array.isArray(r.cleanedLinks) ? r.cleanedLinks : [],
          downloadUrl: r.downloadUrl ?? r.cleanedDownloadUrl ?? "",
          cleanedName:
            r.cleanedName ?? r.originalName ?? selectedFiles[idx]?.name ?? "cleaned-file",
          warning: r.warning,
          expiresAt:
            r.expiresAt ??
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
      });

      setProcessingFiles((prev) =>
        prev.map((file) => ({ ...file, status: "completed" as const }))
      );
      setResults(normalized);
      setBatchId(data.batchId ?? `batch-${Date.now()}`);
      setCleanState(
        normalized.length > 0 && normalized.every((item) => item.status === "completed")
          ? "results"
          : "partial_results"
      );

      const totalLinksCleaned =
        data.summary?.totalLinksCleaned ??
        normalized.reduce((sum, item) => sum + item.linksCleaned, 0);
      const totalFiles = data.summary?.totalFiles ?? data.totalFiles ?? normalized.length;
      addToast("success", `${totalLinksCleaned} links cleaned across ${totalFiles} files`);
      setPage(1);
      setRefreshTick((tick) => tick + 1);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrorMessage(message);
      setCleanState("error");
      addToast("error", message);
      setProcessingFiles((prev) =>
        prev.map((file) => ({ ...file, status: "failed" as const }))
      );
    }
  };

  const formatStorage = (fileCount: number) => {
    const mb = fileCount * 0.5;
    return mb < 1 ? `${(mb * 1024).toFixed(0)} KB` : `${mb.toFixed(1)} MB`;
  };

  if (loadingHistory) {
    return (
      <DashboardShell>
        <DashboardSkeleton />
      </DashboardShell>
    );
  }

  return (
    <DashboardShell>
      <div className="space-y-6">
        <section className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
          <h1 className="text-3xl font-semibold text-[var(--color-text)]">Dashboard</h1>
          <p className="mt-2 text-[var(--color-text-secondary)]">
            Clean links and review your recent files in one place.
          </p>
        </section>

        <section ref={cleanRef} className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-[var(--color-text)]">Clean Files</h2>
            {(cleanState === "results" || cleanState === "partial_results") && (
              <Button
                variant="secondary"
                size="sm"
                icon={<ArrowCounterClockwise size={16} />}
                onClick={handleResetClean}
              >
                New Batch
              </Button>
            )}
          </div>

          <AnimatePresence mode="wait">
            {(cleanState === "idle" || cleanState === "ready") && (
              <motion.div
                key="upload"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                <div className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                  <DropZone
                    onFilesSelected={handleFilesSelected}
                    disabled={cleanState === "ready"}
                  />
                </div>
                <FileList files={selectedFiles} onRemove={handleRemoveFile} />
                <DocWarning show={hasDocFile} />
                {selectedFiles.length > 0 && (
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4">
                    <span className="text-sm text-[var(--color-text-secondary)]">
                      {selectedFiles.length} file{selectedFiles.length !== 1 ? "s" : ""} selected
                    </span>
                    <Button
                      variant="primary"
                      size="lg"
                      icon={<Broom size={18} weight="bold" />}
                      onClick={handleClean}
                    >
                      Clean Links
                    </Button>
                  </div>
                )}
              </motion.div>
            )}

            {(cleanState === "uploading" || cleanState === "processing") && (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
              >
                <ProcessingStatus files={processingFiles} />
              </motion.div>
            )}

            {(cleanState === "results" || cleanState === "partial_results") && batchId && (
              <motion.div
                key="results"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-4"
              >
                <ResultsSection results={results} batchId={batchId} />
              </motion.div>
            )}

            {cleanState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-center rounded-[14px] border border-[var(--color-border)] bg-[var(--color-bg)] p-8"
              >
                <p className="text-sm text-[var(--color-danger)] mb-4">
                  {errorMessage || "Something went wrong"}
                </p>
                <Button
                  variant="secondary"
                  icon={<ArrowCounterClockwise size={16} />}
                  onClick={handleResetClean}
                >
                  Try Again
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        <section
          ref={historyRef}
          className="rounded-[18px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)] p-6"
        >
          <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">History</h2>
          <div className="mb-4">
            <StatsOverview
              totalFiles={stats.totalFiles}
              totalLinksCleaned={stats.totalLinksCleaned}
              storageUsed={formatStorage(stats.totalFiles)}
            />
          </div>
          <FileHistory
            files={files}
            pagination={{ page, limit: 20, total, hasMore }}
            onLoadMore={() => setPage((p) => p + 1)}
          />
        </section>
      </div>
    </DashboardShell>
  );
}

export default function DashboardPage() {
  return (
    <ToastProvider>
      <DashboardContent />
    </ToastProvider>
  );
}
