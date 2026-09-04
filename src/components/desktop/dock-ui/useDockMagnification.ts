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
 *
 * Motion is deliberately split in two: while the pointer is over the dock the
 * icons track it directly with no CSS transition (a transition would restart
 * every frame and lag), and a transition is switched on only for the two
 * genuine jumps — entering and leaving — reported via `settling`.
 */
"use client";

import {
  useCallback,
  useEffect,
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
/** Matches the settle transition duration in DockConfig. */
const SETTLE_MS = 200;

export interface DockMagnifyTransform {
  scale: number;
}

/** Pointer x plus the dock centre it was measured against. */
type Pointer = { x: number; centerX: number };

/**
 * @param slotWidths resting width of every slot in order, icons and
 * separators alike, so resting centres can be accumulated.
 */
export function useDockMagnification(slotWidths: number[]) {
  const [pointer, setPointer] = useState<Pointer | null>(null);
  const [settling, setSettling] = useState(false);
  const rafRef = useRef<number | null>(null);
  const settleRef = useRef<number | null>(null);

  const beginSettle = useCallback(() => {
    if (settleRef.current != null) window.clearTimeout(settleRef.current);
    setSettling(true);
    settleRef.current = window.setTimeout(() => setSettling(false), SETTLE_MS);
  }, []);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      if (settleRef.current != null) window.clearTimeout(settleRef.current);
    },
    []
  );

  // Ease in from rest, then hand over to direct tracking.
  const onMouseEnter = useCallback(() => beginSettle(), [beginSettle]);

  const onMouseMove = useCallback((e: ReactMouseEvent<HTMLElement>) => {
    const x = e.clientX;
    // Measured here, once per event, rather than per icon during render:
    // reading layout during render would force a style flush per icon.
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;

    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setPointer({ x, centerX }));
  }, []);

  const onMouseLeave = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    setPointer(null);
    beginSettle();
  }, [beginSettle]);

  // Resting centre of each slot, measured from the left edge of the content.
  const restingCenters: number[] = [];
  let cursor = 0;
  slotWidths.forEach((w, i) => {
    restingCenters.push(cursor + w / 2);
    cursor += w + (i < slotWidths.length - 1 ? DOCK_GAP : 0);
  });
  const restingWidth = cursor;

  // Called during render, so there is nothing to gain from memoising it.
  const getTransform = (index: number): DockMagnifyTransform => {
    if (!pointer) return { scale: 1 };

    // Map the pointer into resting-layout space.
    const u = pointer.x - pointer.centerX + restingWidth / 2;
    const distance = Math.abs(u - restingCenters[index]);
    if (distance >= CUTOFF) return { scale: 1 };

    const falloff = Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA));
    return { scale: 1 + (MAX_SCALE - 1) * falloff };
  };

  return { onMouseEnter, onMouseMove, onMouseLeave, getTransform, settling };
}
