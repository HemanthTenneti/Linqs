"use client";

import { motion } from "framer-motion";
import { File, Broom, HardDrive } from "@phosphor-icons/react";
import { Card } from "@/components/ui/Card";

interface StatsOverviewProps {
  totalFiles: number;
  totalLinksCleaned: number;
  storageUsed: string;
}

const stats = [
  {
    key: "files",
    label: "Total Files",
    icon: <File size={20} weight="duotone" className="text-[var(--color-accent)]" />,
    getColor: (v: StatsOverviewProps) => v.totalFiles.toString(),
  },
  {
    key: "links",
    label: "Links Cleaned",
    icon: <Broom size={20} weight="duotone" className="text-[var(--color-success)]" />,
    getColor: (v: StatsOverviewProps) => v.totalLinksCleaned.toString(),
  },
  {
    key: "storage",
    label: "Storage",
    icon: <HardDrive size={20} weight="duotone" className="text-[var(--color-warning)]" />,
    getColor: (v: StatsOverviewProps) => v.storageUsed,
  },
];

export function StatsOverview({ totalFiles, totalLinksCleaned, storageUsed }: StatsOverviewProps) {
  const data = { totalFiles, totalLinksCleaned, storageUsed };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.key}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
        >
          <Card>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[var(--radius-lg)] bg-[var(--color-bg-secondary)] flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <div className="text-xl font-bold text-[var(--color-text)]">
                  {stat.getColor(data)}
                </div>
                <div className="text-xs text-[var(--color-text-secondary)]">
                  {stat.label}
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
