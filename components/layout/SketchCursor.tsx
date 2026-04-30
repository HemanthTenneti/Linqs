"use client";

import { useEffect, useRef, useState } from "react";
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
  const [visible, setVisible] = useState(false);
  const modeRef = useRef<CursorMode>("default");

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const isFinePointer = window.matchMedia("(pointer: fine)").matches;
    if (!isFinePointer) {
      return;
    }

    const xTo = gsap.quickTo(cursor, "x", { duration: 0.18, ease: "power3.out" });
    const yTo = gsap.quickTo(cursor, "y", { duration: 0.18, ease: "power3.out" });
    const scaleTo = gsap.quickTo(cursor, "scale", { duration: 0.16, ease: "power2.out" });
    const rotateTo = gsap.quickTo(cursor, "rotate", { duration: 0.2, ease: "power2.out" });
    const ring = cursor.querySelector<HTMLElement>("[data-ring]");
    const glow = cursor.querySelector<HTMLElement>("[data-glow]");
    const core = cursor.querySelector<HTMLElement>("[data-core]");

    const setMode = (mode: CursorMode) => {
      modeRef.current = mode;
      cursor.dataset.mode = mode;
      gsap.to(ring, {
        scale: mode === "drag" ? 1.18 : mode === "button" ? 1.08 : 1,
        opacity: mode === "default" ? 0.9 : 1,
        duration: 0.18,
      });
      gsap.to(glow, {
        scale: mode === "drag" ? 1.24 : 1.14,
        opacity: mode === "default" ? 0.42 : 0.62,
        duration: 0.18,
      });
      gsap.to(core, {
        scale: mode === "button" ? 1.08 : 1,
        opacity: mode === "default" ? 0.9 : 1,
        duration: 0.12,
      });

      gsap.to(cursor, {
        width: mode === "drag" ? 76 : 58,
        height: mode === "drag" ? 76 : 58,
        duration: 0.18,
      });

      scaleTo(mode === "drag" ? 1.08 : mode === "button" ? 1.04 : 1);
      rotateTo(mode === "default" ? 4 : 0);

      if (mode === "button") {
        gsap.fromTo(
          cursor,
          { x: `+=0.5`, y: `-=0.5` },
          { x: `-=0.5`, y: `+=0.5`, duration: 0.08, yoyo: true, repeat: 3, ease: "none" }
        );
      }
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
        "grid place-items-center overflow-visible",
        "mix-blend-normal transition-[opacity] duration-150",
        "data-[mode=button]:animate-cursor-wobble data-[mode=drag]:animate-cursor-wobble",
        visible ? "opacity-100" : "opacity-0",
      ].join(" ")}
      style={{
        transform: "translate(-50%, -50%)",
      }}
      >
      <span
        data-glow
        className="absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(246,239,230,0.92)_0%,rgba(246,239,230,0.44)_38%,transparent_68%)] blur-[2px] animate-cursor-fuzz"
      />
      <span
        data-ring
        className="absolute inset-[4px] rounded-full border-2 border-[rgba(47,36,24,0.62)] bg-[rgba(255,248,225,0.68)] shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_12px_26px_rgba(44,29,14,0.16)] animate-cursor-spin"
      />
      <span
        className="absolute inset-[9px] rounded-full border border-dashed border-[rgba(47,36,24,0.28)] animate-cursor-spin-slow"
      />
      <span
        data-core
        className="absolute inset-[17px] rounded-full bg-[radial-gradient(circle,rgba(31,23,16,0.9)_0%,rgba(31,23,16,0.55)_45%,transparent_72%)] blur-[0.5px]"
      />
      <span className="absolute inset-[1px] rounded-full border border-[rgba(47,36,24,0.18)] rotate-12 animate-cursor-broken" />
      <span className="absolute inset-[6px] rounded-full border border-dotted border-[rgba(47,36,24,0.18)] -rotate-12 animate-cursor-broken-reverse" />
    </div>
  );
}
