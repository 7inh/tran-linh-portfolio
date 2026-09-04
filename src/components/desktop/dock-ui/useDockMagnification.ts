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
 * Motion is deliberately split in two: while the pointer is near the dock the
 * icons track it directly with no CSS transition (a transition would restart
 * every frame and lag), and a transition is switched on only for the two
 * genuine jumps — arriving and leaving — reported via `settling`.
 *
 * Tracking listens on the window rather than the dock element. A magnified
 * icon is drawn well above the dock's own box (overflow is visible, but the
 * hit box does not grow), so relying on the element's mouseleave would drop
 * out of magnification whenever the cursor rode up over a tall icon — which
 * is exactly what circling over the icons does.
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

/** Slack around the dock that still counts as "at the dock". Generous above,
 * where magnified icons and their tooltips are drawn. */
const PAD_TOP = 96;
const PAD_X = 24;
const PAD_BOTTOM = 32;

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
  const [active, setActive] = useState(false);

  const dockRef = useRef<HTMLElement | null>(null);
  const latestEventRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number | null>(null);
  const settleRef = useRef<number | null>(null);

  const beginSettle = useCallback(() => {
    if (settleRef.current != null) window.clearTimeout(settleRef.current);
    setSettling(true);
    settleRef.current = window.setTimeout(() => setSettling(false), SETTLE_MS);
  }, []);

  const onMouseEnter = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      const el = e.currentTarget;
      dockRef.current = el;

      // Seed from the entering event itself. The window listener is only
      // attached after this state change commits, so it would miss the move
      // that brought the pointer in — enter-and-hold would never magnify.
      const rect = el.getBoundingClientRect();
      latestEventRef.current = { x: e.clientX, y: e.clientY };
      setPointer({ x: e.clientX, centerX: rect.left + rect.width / 2 });

      setActive(true);
      beginSettle();
    },
    [beginSettle]
  );

  useEffect(() => {
    if (!active) return;

    const release = () => {
      setPointer(null);
      setActive(false);
      beginSettle();
    };

    const flush = () => {
      rafRef.current = null;
      const el = dockRef.current;
      const ev = latestEventRef.current;
      if (!el || !ev) return;

      // One layout read per frame, rather than one per pointer event.
      const rect = el.getBoundingClientRect();
      const inside =
        ev.x >= rect.left - PAD_X &&
        ev.x <= rect.right + PAD_X &&
        ev.y >= rect.top - PAD_TOP &&
        ev.y <= rect.bottom + PAD_BOTTOM;

      if (!inside) {
        release();
        return;
      }
      setPointer({ x: ev.x, centerX: rect.left + rect.width / 2 });
    };

    const onMove = (e: MouseEvent) => {
      latestEventRef.current = { x: e.clientX, y: e.clientY };
      if (rafRef.current == null) rafRef.current = requestAnimationFrame(flush);
    };

    // Pointer left the document entirely.
    const onDocOut = (e: MouseEvent) => {
      if (!e.relatedTarget) release();
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseout", onDocOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onDocOut);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [active, beginSettle]);

  useEffect(
    () => () => {
      if (settleRef.current != null) window.clearTimeout(settleRef.current);
    },
    []
  );

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

  return { onMouseEnter, getTransform, settling };
}
