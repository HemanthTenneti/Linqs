"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";

// ─── Sign-In Page ───
// Uses next-auth/react signIn() so CSRF token handling is automatic.
// This avoids manual POST forms to /api/auth/signin/* which require explicit tokens.

export function SignInClient() {
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);

  const callbackUrl = "/dashboard";

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;
    setSending(true);
    await signIn("resend", { email, callbackUrl });
    setSending(false);
  };

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-semibold mb-2 text-[var(--color-text)]">
          Welcome to LinkCleaner
        </h1>
        <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed">
          Sign in to start cleaning tracking links from your documents
        </p>
      </div>

      <div className="w-full flex flex-col gap-3">
        <motion.button
          type="button"
          onClick={() => signIn("google", { callbackUrl })}
          whileHover={{ y: -2, rotate: -0.3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          data-cursor="button"
          className="group w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm font-medium"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5" aria-hidden="true">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          <span className="relative">
            Continue with Google
            <span className="absolute inset-x-0 -bottom-1 h-px bg-[var(--color-border)]/40 scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100" />
          </span>
        </motion.button>

        <motion.button
          type="button"
          onClick={() => signIn("github", { callbackUrl })}
          whileHover={{ y: -2, rotate: 0.3, scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          data-cursor="button"
          className="group w-full flex items-center justify-center gap-3 px-4 py-3 rounded-[var(--radius-md)] border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)] shadow-[var(--shadow-sm)] hover:bg-[var(--color-bg-hover)] transition-colors text-sm font-medium"
        >
          <svg
            viewBox="0 0 24 24"
            className="w-5 h-5"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          <span className="relative">
            Continue with GitHub
            <span className="absolute inset-x-0 -bottom-1 h-px bg-[var(--color-border)]/40 scale-x-0 origin-left transition-transform duration-200 group-hover:scale-x-100" />
          </span>
        </motion.button>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-[var(--color-border)]" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[var(--color-bg)] px-2 text-[var(--color-text-secondary)]">
              or
            </span>
          </div>
        </div>

        <form onSubmit={handleEmailSignIn} className="flex flex-col gap-3">
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-[var(--radius-md)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:border-transparent bg-transparent"
          />
          <motion.button
            type="submit"
            disabled={sending}
            whileHover={{ y: -1, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            data-cursor="button"
            className="w-full px-4 py-3 bg-[var(--color-text)] text-[var(--color-bg)] rounded-[var(--radius-md)] hover:bg-[var(--color-accent)] hover:text-white transition-colors text-sm font-medium border-2 border-[var(--color-border)] disabled:opacity-60"
          >
            {sending ? "Sending..." : "Send Magic Link"}
          </motion.button>
        </form>
      </div>

      <p className="text-xs text-[var(--color-text-secondary)] text-center">
        By signing in, you agree to our Terms of Service and Privacy Policy.
      </p>
    </div>
  );
}
