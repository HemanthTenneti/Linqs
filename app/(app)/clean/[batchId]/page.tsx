"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft } from "@phosphor-icons/react";
import { ResultsSection } from "@/components/results/ResultsSection";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import Link from "next/link";

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

function BatchResultsContent() {
  const { batchId } = useParams<{ batchId: string }>();
  const router = useRouter();
  const { addToast } = useToast();
  const [results, setResults] = useState<CleanedFileResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchResults() {
      try {
        // Fetch files filtered by batch ID
        const res = await fetch(`/api/files?batchId=${batchId}&limit=10`);
        if (!res.ok) throw new Error("Failed to fetch batch results");
        const data = await res.json();
        setResults(data.files);
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        setError(message);
        addToast("error", message);
      } finally {
        setLoading(false);
      }
    }

    if (batchId) fetchResults();
  }, [batchId, addToast]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex items-center justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || results.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <p className="text-sm text-[var(--color-danger)] mb-4">
          {error || "Batch not found or expired"}
        </p>
        <Link href="/clean">
          <Button variant="secondary">Back to Clean</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="space-y-5"
      >
        {/* Back link */}
        <Link
          href="/clean"
          className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors"
        >
          <ArrowLeft size={16} />
          Clean more files
        </Link>

        <ResultsSection results={results} batchId={batchId} />
      </motion.div>
    </div>
  );
}

export default function BatchResultsPage() {
  return (
    <ToastProvider>
      <BatchResultsContent />
    </ToastProvider>
  );
}
