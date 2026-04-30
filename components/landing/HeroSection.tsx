"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, LinkBreak } from "@phosphor-icons/react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden section-pad">
      <div className="container-narrow text-center">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-4xl sm:text-6xl font-bold text-[var(--color-text)] leading-[0.95] tracking-tight max-w-4xl mx-auto"
        >
          Clean Your Links,
          <span className="block notion-serif text-5xl sm:text-7xl mt-2 text-[var(--color-accent)]">
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
        </motion.p>
      </div>
    </section>
  );
}
