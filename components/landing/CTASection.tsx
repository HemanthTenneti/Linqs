"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Sparkle } from "@phosphor-icons/react";

export function CTASection() {
  return (
    <section className="section-pad bg-[var(--color-bg-secondary)] border-y-2 border-[var(--color-border)]">
      <div className="container-narrow text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[var(--color-border)] bg-[var(--color-bg)] text-[var(--color-text)] text-xs font-medium mb-5">
            <Sparkle size={14} weight="fill" />
            Free to use &middot; No account needed
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] handwritten">
            Ready to clean your links?
          </h2>
          <p className="mt-3 text-base text-[var(--color-text-secondary)] max-w-md mx-auto">
            Start stripping tracking parameters from your documents in seconds.
          </p>

          <div className="mt-8">
            <Link href="/auth/signin">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                data-cursor="button"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[var(--color-text)] text-[var(--color-bg)] font-semibold rounded-[var(--radius-lg)] hover:bg-[var(--color-accent)] hover:text-white transition-colors shadow-[var(--shadow-md)]"
              >
                Start Cleaning
                <ArrowRight size={18} weight="bold" />
              </motion.button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
