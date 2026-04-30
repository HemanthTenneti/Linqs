"use client";

import { useEffect, useRef, useState } from "react";
import { Sparkle } from "@phosphor-icons/react";
import gsap from "gsap";

type CursorMode = "default" | "link" | "button" | "drag";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, [data-cursor]';

function getCursorMode(target: EventTarget | null): CursorMode {
  if (!(target instanceof Element)) return "default";

  const el = target.closest("[data-cursor]") as HTMLElement | null;
  const explicit = el?.dataset.cursor as CursorMode | undefined;
  if (explicit) return explicit;

  if (target.closest('a, [role="link"]')) return "link";
  if (target.closest('button, [role="button"], input, textarea, select')) {
    return "button";
  }

  return "default";
}

export function SketchCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const iconRef = useRef<SVGSVGElement>(null);
  const [visible, setVisible] = useState(false);
  const modeRef = useRef<CursorMode>("default");

  useEffect(() => {
    const cursor = cursorRef.current;
    const label = labelRef.current;
    const icon = iconRef.current;
    if (!cursor || !label || !icon) return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) {
      return;
    }

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });
    const scaleTo = gsap.quickTo(cursor, "scale", { duration: 0.16, ease: "power2.out" });
    const rotateTo = gsap.quickTo(cursor, "rotate", { duration: 0.2, ease: "power2.out" });

    const setMode = (mode: CursorMode) => {
      modeRef.current = mode;
      const nextLabel =
        mode === "link" ? "open" : mode === "button" ? "click" : mode === "drag" ? "drag" : "";

      gsap.to(label, { opacity: nextLabel ? 1 : 0, duration: 0.12 });
      label.textContent = nextLabel;

      gsap.to(icon, { opacity: nextLabel ? 1 : 0.9, duration: 0.12 });
      icon.innerHTML =
        mode === "link"
          ? "<path d='M6 11.5A5.5 5.5 0 0 1 11.5 6H14v2h-2.5A3.5 3.5 0 1 0 15 11.5V14h-2v-2.5A5.5 5.5 0 0 1 7.5 17H5v-2h2.5A3.5 3.5 0 0 0 11 11.5V9h2v2.5A5.5 5.5 0 0 1 6 11.5Z' fill='currentColor'/>"
          : mode === "button"
          ? "<path d='M8 7l5 5-5 5' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/><path d='M13 12H5' fill='none' stroke='currentColor' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/>"
          : mode === "drag"
          ? "<path d='M8 5v14M16 5v14' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round'/><path d='M11 8l-3 4 3 4M13 8l3 4-3 4' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' stroke-linejoin='round'/>"
          : "<path d='M9 4l7 7-4 1-1 4-2-2-2 2-1-1 2-2-2-2 3-3-1-4z' fill='currentColor' opacity='0.85'/>";

      gsap.to(cursor, {
        width: mode === "default" ? 54 : mode === "drag" ? 72 : 64,
        height: 54,
        borderRadius: mode === "drag" ? 18 : 999,
        backgroundColor:
          mode === "default" ? "rgba(255, 248, 225, 0.84)" : "rgba(255, 255, 255, 0.92)",
        borderColor: mode === "default" ? "rgba(73, 61, 45, 0.35)" : "rgba(73, 61, 45, 0.45)",
        duration: 0.18,
      });

      scaleTo(mode === "drag" ? 1.12 : mode === "default" ? 1 : 1.08);
      rotateTo(mode === "default" ? -4 : 0);
    };

    const onPointerMove = (event: PointerEvent) => {
      setVisible(true);
      xTo(event.clientX);
      yTo(event.clientY);
      setMode(getCursorMode(event.target));
    };

    const onPointerLeave = () => setVisible(false);
    const onPointerEnter = () => setVisible(true);

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerleave", onPointerLeave);
    document.addEventListener("pointerenter", onPointerEnter);

    document.documentElement.style.cursor = "none";
    document.body.style.cursor = "none";

    setMode("default");

    const interactiveNodes = document.querySelectorAll<HTMLElement>(INTERACTIVE_SELECTOR);
    interactiveNodes.forEach((node) => {
      node.style.cursor = "none";
    });

    return () => {
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      document.removeEventListener("pointerenter", onPointerEnter);
      document.documentElement.style.cursor = "";
      document.body.style.cursor = "";
      interactiveNodes.forEach((node) => {
        node.style.cursor = "";
      });
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      aria-hidden="true"
      className={[
        "pointer-events-none fixed left-0 top-0 z-[80]",
        "flex items-center justify-center gap-2 border shadow-[0_20px_45px_rgba(37,28,18,0.18)]",
        "mix-blend-normal backdrop-blur-md transition-[opacity] duration-150",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        width: 54,
        height: 54,
        borderColor: "rgba(73, 61, 45, 0.35)",
        background: "rgba(255, 248, 225, 0.84)",
        transform: "translate(-50%, -50%)",
      }}
    >
      <Sparkle ref={iconRef} size={16} weight="fill" className="text-[var(--ink)]" />
      <span
        ref={labelRef}
        className="text-[10px] uppercase tracking-[0.24em] text-[var(--ink-soft)]"
      />
    </div>
  );
}
