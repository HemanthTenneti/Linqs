"use client";

import { motion } from "framer-motion";
import { ShieldCheck, FileText, Lightning } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";

const features = [
  {
    icon: <ShieldCheck size={28} weight="duotone" className="text-[var(--color-success)]" />,
    title: "Privacy First",
    description:
      "Strips 60+ tracking parameters including UTM tags, Facebook click IDs, Google Ads IDs, and HubSpot trackers from every URL.",
  },
  {
    icon: <FileText size={28} weight="duotone" className="text-[var(--color-accent)]" />,
    title: "Multi-Format Support",
    description:
      "Works with .docx, .pdf, .md, .txt, and .doc files. Upload up to 5 files at once and download them all as a zip.",
  },
  {
    icon: <Lightning size={28} weight="duotone" className="text-[var(--color-warning)]" />,
    title: "Instant Processing",
    description:
      "Documents are processed server-side in seconds. See exactly which links were cleaned with a detailed diff view.",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export function FeaturesGrid() {
  return (
    <section className="section-pad bg-[color-mix(in_srgb,var(--color-bg-secondary)_72%,white_28%)] border-y-2 border-[var(--color-border)]/60">
      <div className="container-wide">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-text)] handwritten">
            Why LinkCleaner?
          </h2>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            A cleaner web starts with cleaner links
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-5"
        >
          {features.map((feature) => (
            <motion.div key={feature.title} variants={cardVariants}>
              <Card hover className="h-full rotate-[0.4deg] odd:rotate-[-0.4deg]">
                <div className="w-12 h-12 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-base font-semibold text-[var(--color-text)] mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
