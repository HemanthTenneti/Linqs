"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LinkBreak } from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden section-pad">
      <div className="absolute inset-0 -z-10 opacity-40">
        <div className="absolute left-6 top-10 h-36 w-36 rounded-full border border-[var(--color-border)]/25 rotate-12" />
        <div className="absolute right-10 top-20 h-24 w-24 rounded-[32px] border border-[var(--color-border)]/20 -rotate-6" />
      </div>
      <div className="container-narrow text-center">
        {/* Floating abstract illustration */}
        <motion.div
          animate={{ y: [0, -12, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-[32px] border-2 border-[var(--color-border)] bg-[var(--color-bg-secondary)] mb-8 shadow-[var(--shadow-sm)]"
        >
          <LinkBreak size={40} weight="duotone" className="text-[var(--color-accent)]" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold text-[var(--color-text)] leading-[0.95] tracking-tight max-w-4xl mx-auto"
        >
          Clean Your Links,
          <span className="block handwritten text-5xl sm:text-7xl mt-2 text-[var(--color-accent)]">
            Keep the page quiet.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-5 text-lg text-[var(--color-text-secondary)] max-w-2xl mx-auto leading-relaxed"
        >
          Upload your documents and instantly strip all tracking parameters — UTM tags,
          click IDs, and 60+ other trackers — from every URL. Fast, private, and free.
        </motion.p>

        {/* CTA button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-10"
        >
          <Link href="/auth/signin">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              data-cursor="button"
              className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--color-text)] text-[var(--color-bg)] font-semibold rounded-[var(--radius-lg)] hover:bg-[var(--color-accent)] hover:text-white transition-colors shadow-[var(--shadow-md)]"
            >
              Get Started
              <ArrowRight size={18} weight="bold" />
            </motion.button>
          </Link>
        </motion.div>

        {/* Trust line */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-5 text-xs text-[var(--color-text-placeholder)] tracking-[0.2em] uppercase"
        >
          No sign-up required for first use &middot; Files deleted after 7 days
        </motion.p>
      </div>
    </section>
  );
}
