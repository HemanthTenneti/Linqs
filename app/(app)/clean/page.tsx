"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Broom, ArrowCounterClockwise } from "@phosphor-icons/react";
import { DropZone } from "@/components/upload/DropZone";
import { FileList } from "@/components/upload/FileList";
import { DocWarning } from "@/components/upload/DocWarning";
import { ProcessingStatus } from "@/components/processing/ProcessingStatus";
import { ResultsSection } from "@/components/results/ResultsSection";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { ToastProvider } from "@/components/ui/Toast";

type CleanPageState =
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
    totalLinksFound?: number;
    totalLinksCleaned?: number;
  };
  totalFiles?: number;
}

// The main clean tool page — iLovePDF-inspired single-screen flow
function CleanPageContent() {
  const { addToast } = useToast();

  const [pageState, setPageState] = useState<CleanPageState>("idle");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [results, setResults] = useState<CleanedFileResult[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Processing state for per-file status tracking
  const [processingFiles, setProcessingFiles] = useState<
    { name: string; status: "pending" | "processing" | "completed" | "failed" }[]
  >([]);

  // Check if any selected file is a .doc file
  const hasDocFile = selectedFiles.some((f) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    return ext === "doc";
  });

  const handleFilesSelected = useCallback((files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setPageState("ready");
  }, []);

  const handleRemoveFile = useCallback((index: number) => {
    setSelectedFiles((prev) => {
      const updated = prev.filter((_, i) => i !== index);
      if (updated.length === 0) setPageState("idle");
      return updated;
    });
  }, []);

  // Submit files for cleaning
  const handleClean = async () => {
    if (selectedFiles.length === 0) return;

    setPageState("uploading");
    setErrorMessage(null);

    // Build per-file processing status
    const fileStatuses = selectedFiles.map((f) => ({
      name: f.name,
      status: "pending" as const,
    }));
    setProcessingFiles(fileStatuses);

    try {
      const formData = new FormData();
      selectedFiles.forEach((file) => {
        formData.append("files", file);
      });

      setPageState("processing");

      // Animate through processing statuses
      const progressInterval = setInterval(() => {
        setProcessingFiles((prev) => {
          const nextPending = prev.findIndex((f) => f.status === "pending");
          if (nextPending === -1) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev.map((f, i) =>
            i === nextPending ? { ...f, status: "processing" as const } : f
          );
        });
      }, 800);

      const res = await fetch("/api/clean", {
        method: "POST",
        body: formData,
      });

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

      const normalizedResults: CleanedFileResult[] = rawResults.map((r, idx) => {
        const linksFound = r.linksFound ?? 0;
        const linksCleaned = r.linksCleaned ?? 0;
        const linksUntouched =
          r.linksUntouched ?? Math.max(0, linksFound - linksCleaned);

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
          cleanedName: r.cleanedName ?? r.originalName ?? selectedFiles[idx]?.name ?? "cleaned-file",
          warning: r.warning,
          // fallback to 7 days if backend omitted this field
          expiresAt:
            r.expiresAt ??
            new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
      });

      // Mark all files as completed
      setProcessingFiles((prev) =>
        prev.map((f) => ({ ...f, status: "completed" as const }))
      );

      setResults(normalizedResults);
      setBatchId(data.batchId ?? `batch-${Date.now()}`);
      setPageState(
        normalizedResults.length > 0 &&
          normalizedResults.every((r) => r.status === "completed")
          ? "results"
          : "partial_results"
      );

      const totalLinksCleaned =
        data.summary?.totalLinksCleaned ??
        normalizedResults.reduce((sum, r) => sum + r.linksCleaned, 0);
      const totalFiles =
        data.summary?.totalFiles ?? data.totalFiles ?? normalizedResults.length;

      addToast(
        "success",
        `${totalLinksCleaned} links cleaned across ${totalFiles} files`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setErrorMessage(message);
      setPageState("error");
      addToast("error", message);

      // Mark all as failed
      setProcessingFiles((prev) =>
        prev.map((f) => ({ ...f, status: "failed" as const }))
      );
    }
  };

  // Reset to start a new cleaning session
  const handleReset = () => {
    setSelectedFiles([]);
    setResults([]);
    setBatchId(null);
    setErrorMessage(null);
    setProcessingFiles([]);
    setPageState("idle");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Page header */}
        <div className="sketch-frame p-6 sm:p-8 mb-6 rotate-[-0.35deg]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-xs uppercase tracking-[0.22em] text-[var(--color-text-secondary)] mb-4">
            <Broom size={14} weight="bold" />
            Clean workspace
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] handwritten">
            Clean Your Files
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-text-secondary)] mt-2 max-w-2xl leading-relaxed">
            Upload documents and we&apos;ll strip all tracking parameters from every URL
          </p>
        </div>

        {/* State machine: show different UI based on current state */}
        <AnimatePresence mode="wait">
          {/* ─── IDLE / READY: Show DropZone ─── */}
          {(pageState === "idle" || pageState === "ready") && (
            <motion.div
              key="upload"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="sketch-frame p-4 sm:p-5 rotate-[0.2deg]">
                <DropZone
                  onFilesSelected={handleFilesSelected}
                  disabled={pageState === "ready"}
                />
              </div>

              {/* File list with animated pills */}
              <FileList files={selectedFiles} onRemove={handleRemoveFile} />

              {/* .doc warning */}
              <DocWarning show={hasDocFile} />

              {/* Clean button */}
              {selectedFiles.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sketch-frame p-4"
                >
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
                </motion.div>
              )}
            </motion.div>
          )}

          {/* ─── UPLOADING / PROCESSING: Show Processing Status ─── */}
          {(pageState === "uploading" || pageState === "processing") && (
            <motion.div
              key="processing"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="sketch-frame p-4 sm:p-6"
            >
              <ProcessingStatus files={processingFiles} />
            </motion.div>
          )}

          {/* ─── RESULTS / PARTIAL_RESULTS: Show Results ─── */}
          {(pageState === "results" || pageState === "partial_results") && batchId && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              <div className="sketch-frame p-4 sm:p-6">
                <ResultsSection results={results} batchId={batchId} />
              </div>

              {/* Clean more button */}
              <div className="flex justify-center pt-4">
                <Button
                  variant="secondary"
                  icon={<ArrowCounterClockwise size={16} />}
                  onClick={handleReset}
                >
                  Clean More Files
                </Button>
              </div>
            </motion.div>
          )}

          {/* ─── ERROR: Show error + retry ─── */}
          {pageState === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-center py-12 sketch-frame p-8"
            >
              <p className="text-sm text-[var(--color-danger)] mb-4">
                {errorMessage || "Something went wrong"}
              </p>
              <Button
                variant="secondary"
                icon={<ArrowCounterClockwise size={16} />}
                onClick={handleReset}
              >
                Try Again
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

export default function CleanPage() {
  return (
    <ToastProvider>
      <CleanPageContent />
    </ToastProvider>
  );
}
