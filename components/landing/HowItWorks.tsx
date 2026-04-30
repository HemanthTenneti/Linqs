"use client";

import { motion } from "framer-motion";
import { UploadSimple, Broom, DownloadSimple } from "@phosphor-icons/react";

const steps = [
  {
    icon: <UploadSimple size={28} weight="duotone" className="text-[var(--color-accent)]" />,
    label: "Upload",
    description: "Drag & drop up to 5 documents (.docx, .pdf, .md, .txt, .doc)",
  },
  {
    icon: <Broom size={28} weight="duotone" className="text-[var(--color-success)]" />,
    label: "Clean",
    description: "We extract every URL and strip all tracking parameters automatically",
  },
  {
    icon: <DownloadSimple size={28} weight="duotone" className="text-[var(--color-warning)]" />,
    label: "Download",
    description: "Get your cleaned documents instantly — download individually or as a zip",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const stepVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function HowItWorks() {
  return (
    <section className="section-pad">
      <div className="container-narrow">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] handwritten">
            How It Works
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            Three steps to tracker-free documents
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="relative grid grid-cols-1 sm:grid-cols-3 gap-8"
        >
          {/* Connecting line (desktop only) */}
          <div className="hidden sm:block absolute top-10 left-[16.67%] right-[16.67%] h-px bg-[var(--color-border)]" />

          {steps.map((step, i) => (
            <motion.div
              key={step.label}
              variants={stepVariants}
              className="relative flex flex-col items-center text-center"
            >
              {/* Step number */}
              <div className="w-20 h-20 rounded-full bg-[var(--color-bg-secondary)] border-2 border-[var(--color-border)] flex items-center justify-center mb-4 relative z-10 shadow-[var(--shadow-sm)]">
                {step.icon}
              </div>
              <div className="text-xs font-medium text-[var(--color-text-placeholder)] mb-1.5">
                Step {i + 1}
              </div>
              <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">
                {step.label}
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed max-w-[240px]">
                {step.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
