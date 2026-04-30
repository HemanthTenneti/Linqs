"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  SquaresFour,
  Broom,
  ClockClockwise,
  GearSix,
} from "@phosphor-icons/react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: SquaresFour },
  { href: "/clean", label: "Clean Files", icon: Broom },
  { href: "/dashboard", label: "History", icon: ClockClockwise },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 border-r border-[var(--color-border)] bg-[var(--color-bg-secondary)] h-full">
      <nav className="flex flex-col gap-0.5 p-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.label} href={item.href}>
              <motion.div
                whileHover={{ x: 4 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className={`
                  flex items-center gap-2.5 px-3 py-2 text-sm rounded-[var(--radius-md)] transition-colors
                  ${
                    isActive
                      ? "bg-[var(--color-bg-hover)] text-[var(--color-text)] font-medium"
                      : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-hover)] hover:text-[var(--color-text)]"
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

      {/* Bottom section */}
      <div className="mt-auto p-3 border-t border-[var(--color-border)]">
        <Link href="/dashboard">
          <motion.div
            whileHover={{ x: 4 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-2.5 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-[var(--radius-md)] transition-colors"
          >
            <GearSix size={18} />
            Settings
          </motion.div>
        </Link>
      </div>
    </aside>
  );
}
