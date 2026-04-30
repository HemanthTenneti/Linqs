"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LinkBreak,
  SquaresFour,
  Broom,
  SignOut,
  CaretDown,
} from "@phosphor-icons/react";
import { Avatar } from "@/components/ui/Avatar";

export function Header() {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-[var(--color-bg)]/80 backdrop-blur-md border-b border-[var(--color-border)]">
      <div className="container-wide flex items-center justify-between h-14">
        {/* Logo + nav */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 group">
            <LinkBreak
              size={22}
              weight="bold"
              className="text-[var(--color-accent)] group-hover:rotate-12 transition-transform duration-200"
            />
            <span className="font-semibold text-[var(--color-text)] text-[15px]">
              LinkCleaner
            </span>
          </Link>

          {/* Authenticated nav links */}
          {session && (
            <nav className="hidden sm:flex items-center gap-1">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-[var(--radius-md)] transition-colors"
              >
                <SquaresFour size={16} />
                Dashboard
              </Link>
              <Link
                href="/clean"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] rounded-[var(--radius-md)] transition-colors"
              >
                <Broom size={16} />
                Clean
              </Link>
            </nav>
          )}
        </div>

        {/* Right side: user */}
        <div className="flex items-center gap-2">
          {/* User menu (when authenticated) */}
          {session ? (
            <div ref={dropdownRef} className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 pr-2 rounded-[var(--radius-md)] hover:bg-[var(--color-bg-hover)] transition-colors"
                aria-haspopup="true"
                aria-expanded={dropdownOpen}
              >
                <Avatar
                  src={session.user?.image}
                  name={session.user?.name}
                  size="sm"
                />
                <span className="hidden sm:inline text-sm text-[var(--color-text)]">
                  {session.user?.name?.split(" ")[0]}
                </span>
                <CaretDown size={14} className="text-[var(--color-text-secondary)]" />
              </button>

              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.97 }}
                    transition={{ duration: 0.12 }}
                    className="absolute right-0 top-full mt-1 w-48 bg-[var(--color-bg)] rounded-[var(--radius-lg)] border border-[var(--color-border)] shadow-lg py-1 z-50"
                  >
                    <div className="px-3 py-2 border-b border-[var(--color-border)]">
                      <p className="text-sm font-medium text-[var(--color-text)] truncate">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-[var(--color-text-secondary)] truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-hover)] transition-colors"
                    >
                      <SignOut size={16} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/auth/signin"
              className="px-4 py-1.5 text-sm font-medium bg-[var(--color-accent)] text-white rounded-[var(--radius-md)] hover:bg-[var(--color-accent-hover)] transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
