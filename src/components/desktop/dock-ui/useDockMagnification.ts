/**
 * Neighbor-aware dock magnification, like macOS.
 *
 * Scales are derived from the cursor's position in *resting* layout space —
 * a pure function of the pointer x and fixed geometry constants — rather than
 * from measured element rects. That matters because each slot also widens as
 * it magnifies (so icons push each other apart instead of overlapping); if the
 * scale were computed from live rects, the widening would move elements under
 * the cursor and feed back into the next frame, causing jitter.
 *
 * The dock is centre-anchored on screen, so its centre stays put no matter how
 * wide it grows, which is what makes the resting-space mapping stable.
 */
"use client";

import {
  useCallback,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";

export const DOCK_ICON_SIZE = 56;
export const DOCK_GAP = 6;

const MAX_SCALE = 1.6;
/** Gaussian spread, tuned so two icons either side visibly react. */
const SIGMA = 68;
/** Beyond this the effect is negligible; clamp to exactly 1 to settle. */
const CUTOFF = 210;

export interface DockMagnifyTransform {
  scale: number;
}

/**
 * @param slotWidths resting width of every slot in order, icons and
 * separators alike, so resting centres can be accumulated.
 */
export function useDockMagnification(slotWidths: number[]) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const onMouseMove = useCallback((e: ReactMouseEvent) => {
    const x = e.clientX;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setMouseX(x));
  }, []);

  const onMouseLeave = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    setMouseX(null);
  }, []);

  // Resting centre of each slot, measured from the left edge of the content.
  const restingCenters: number[] = [];
  let cursor = 0;
  let restingWidth = 0;
  slotWidths.forEach((w, i) => {
    restingCenters.push(cursor + w / 2);
    cursor += w + (i < slotWidths.length - 1 ? DOCK_GAP : 0);
  });
  restingWidth = cursor;

  // Called during render, so there is nothing to gain from memoising it.
  const getTransform = (index: number): DockMagnifyTransform => {
    const el = containerRef.current;
    if (mouseX == null || !el) return { scale: 1 };

    // Centre is stable while the dock grows, unlike its left/right edges.
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    // Map the pointer into resting-layout space.
    const u = mouseX - centerX + restingWidth / 2;

    const distance = Math.abs(u - restingCenters[index]);
    if (distance >= CUTOFF) return { scale: 1 };

    const falloff = Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA));
    return { scale: 1 + (MAX_SCALE - 1) * falloff };
  };

  return { containerRef, onMouseMove, onMouseLeave, getTransform };
}
