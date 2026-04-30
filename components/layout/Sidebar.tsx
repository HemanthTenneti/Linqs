"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  SquaresFour,
  Broom,
  ClockClockwise,
  GearSix,
} from "@phosphor-icons/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/dashboard?section=clean", label: "Clean Files", icon: Broom },
  { href: "/dashboard?section=history", label: "History", icon: ClockClockwise },
];

export function Sidebar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <aside className="hidden lg:block w-[17rem] shrink-0">
      <div className="sticky top-14 m-4 rounded-[28px] border-2 border-[var(--color-border)] bg-[color-mix(in_srgb,var(--color-bg-secondary)_80%,white_20%)] shadow-[var(--shadow-sm)] overflow-hidden">
        <div className="px-4 py-4 border-b border-[var(--color-border)]/35">
          <p className="text-[10px] uppercase tracking-[0.28em] text-[var(--color-text-placeholder)]">
            Workspace
          </p>
          <div className="mt-1 text-sm font-semibold text-[var(--color-text)]">
            LinkCleaner
          </div>
        </div>

        <nav className="flex flex-col gap-1 p-3">
          {navItems.map((item) => {
            const section = searchParams.get("section");
            let isActive = false;
            if (pathname === "/dashboard") {
              if (item.href.includes("section=clean")) {
                isActive = section === "clean";
              } else if (item.href.includes("section=history")) {
                isActive = section === "history";
              } else {
                isActive = section == null || section === "dashboard";
              }
            }
            return (
              <Link key={item.label} href={item.href}>
                <motion.div
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className={`
                    flex items-center gap-2.5 px-3 py-2 text-sm rounded-[18px] transition-colors border
                    ${
                      isActive
                        ? "bg-[var(--color-bg)] text-[var(--color-text)] font-medium border-[var(--color-border)] shadow-[0_4px_12px_rgba(44,29,14,0.06)]"
                        : "border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
                    }
                  `}
                >
                  <item.icon size={18} weight={isActive ? "fill" : "regular"} />
                  {item.label}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="mt-2 p-3 border-t border-[var(--color-border)]/30">
          <Link href="/dashboard">
            <motion.div
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-[18px] transition-colors"
            >
              <GearSix size={18} />
              Settings
            </motion.div>
          </Link>
        </div>
      </div>
    </aside>
  );
}
