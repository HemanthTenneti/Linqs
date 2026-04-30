"use client";

import { useEffect, useRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { Link, Broom, CheckCircle } from "@phosphor-icons/react";

interface StatsBarProps {
  linksFound: number;
  linksCleaned: number;
  linksUntouched: number;
}

// Animated counter that counts up from 0 to target
function AnimatedCounter({ value, label, icon, color }: { value: number; label: string; icon: React.ReactNode; color: string }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const displayRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const controls = animate(count, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [value, count]);

  // Sync the motion value to the DOM manually for performance
  useEffect(() => {
    const unsubscribe = rounded.on("change", (v) => {
      if (displayRef.current) displayRef.current.textContent = v.toString();
    });
    return unsubscribe;
  }, [rounded]);

  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <span ref={displayRef} className="text-lg font-bold text-[var(--color-text)]">0</span>
        <span className="text-sm text-[var(--color-text-secondary)] ml-1.5">{label}</span>
      </div>
    </div>
  );
}

export function StatsBar({ linksFound, linksCleaned, linksUntouched }: StatsBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-wrap items-center justify-center gap-6 py-4 px-5 bg-[var(--color-bg)] border border-[var(--color-border)] rounded-[var(--radius-lg)]"
    >
      <AnimatedCounter
        value={linksFound}
        label="links found"
        icon={<Link size={16} weight="bold" className="text-[var(--color-accent)]" />}
        color="bg-[var(--color-accent)]/10"
      />

      <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block" />

      <AnimatedCounter
        value={linksCleaned}
        label="cleaned"
        icon={<Broom size={16} weight="bold" className="text-[var(--color-success)]" />}
        color="bg-[var(--color-success-bg)]"
      />

      <div className="w-px h-6 bg-[var(--color-border)] hidden sm:block" />

      <AnimatedCounter
        value={linksUntouched}
        label="already clean"
        icon={<CheckCircle size={16} weight="bold" className="text-[var(--color-text-secondary)]" />}
        color="bg-[var(--color-bg-secondary)]"
      />
    </motion.div>
  );
}
