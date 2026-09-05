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
 * The panel is centre-anchored on screen (`left-1/2` plus a -50% translate), so
 * its resting centre is simply half the viewport width — a constant, which is
 * what makes the resting-space mapping stable no matter how wide the dock grows.
 *
 * Growth is anchored at the cursor, not at the centre. A centred element
 * spreads new width evenly, which shoves the icons you are pointing at sideways
 * — most visibly when the pointer is near one end, where the dock grows a long
 * way into empty space on the far side. `offsetX` cancels that: the left edge
 * only gives up the width that actually grew to the left of the cursor, so the
 * icon under the pointer stays put and the rest of the growth extends away from
 * it. See the derivation next to the computation below.
 *
 * ── Why there are no CSS transitions here ──
 *
 * Magnification has two independent parts, and conflating them is what makes a
 * dock feel laggy:
 *
 *   shape     — WHERE the bump sits and how tall each icon is. Purely a
 *               function of pointer position, so it must be applied instantly:
 *               the hand already supplies the motion.
 *   intensity — WHETHER the effect is on at all, ramping 0..1 on arrival and
 *               back to 0 on departure. This is the only part that needs time.
 *
 * A CSS transition cannot express that split, because it animates the finished
 * product. Give the icons a transition and every pointer move retargets it
 * mid-flight; the transition restarts, never leaves the head of its easing
 * curve, and the icons visibly chase a cursor that has already moved on. It is
 * worst exactly when arriving fast, where the ramp is still running while the
 * pointer crosses several icons.
 *
 * So nothing here transitions. Each frame computes the shape from the live
 * pointer and multiplies it by an intensity envelope advanced in JS. Arrival
 * and departure are smooth, tracking stays pinned to the cursor, and the two
 * never interfere. The envelope's duration still comes from pointer speed —
 * a fast approach gets a short ramp, a slow drift a longer one.
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
/** Space between slots. Applied as the flex gap by DockContainer and used
 * here to accumulate resting centres — the two must never diverge, so this is
 * the single source and the CSS reads from it. */
export const DOCK_GAP = 12;

const MAX_SCALE = 1.6;
/** Gaussian spread, tuned so two icons either side visibly react. */
const SIGMA = 68;
/** Beyond this the effect is negligible; clamp to exactly 1 to settle. */
const CUTOFF = 210;

/**
 * Envelope duration bounds, and the pointer speeds (px/ms) they map to. A hand
 * drifting in at 150px/s gets the slow, soft ramp; anything at or above
 * 2000px/s gets the short one so magnification lands with the cursor.
 */
const RAMP_SLOW_MS = 200;
const RAMP_FAST_MS = 70;
const SPEED_SLOW = 0.15;
const SPEED_FAST = 2;
/** Weight of the newest sample in the running speed average. Raw per-event
 * deltas are far too noisy to map straight onto a duration. */
const SPEED_SMOOTHING = 0.35;
/** A gap longer than this means the pointer stopped; speed resets to zero so a
 * pause before entering is treated as a slow arrival, not a stale fast one. */
const SPEED_IDLE_MS = 150;

/**
 * Slack around the dock that still counts as "at the dock". Above, this only
 * needs to clear a peak-magnified icon's own overhang (~21px, measured via
 * getBoundingClientRect at MAX_SCALE) plus a small margin — not the tooltip
 * floating further above it (~55px). A tooltip earlier had its own pad here to
 * avoid dismissing it if the pointer strayed onto it, but that isn't how
 * tooltips are ever actually used: they exist to be read while hovering the
 * icon, not by moving the pointer up into their own rendered position, and
 * every other tooltip in this app already dismisses the moment the pointer
 * leaves its anchor. Protecting that non-interaction was the entire reason
 * PAD_TOP stayed oversized through two rounds of "shrink this" — while inside
 * the pad the shape keeps tracking x only, with zero regard for how close Y is
 * to the boundary, so any pad here reads as a dead zone: magnification stays
 * pinned at full scale for the *entire* pad depth, and only starts easing back
 * once the pointer finally crosses it. Measured before this cut (68px pad):
 * moving straight up off a fully magnified icon at a normal, moderate speed
 * kept it pinned at 1.6x for 111px / 458ms before easing even began, then
 * took another ~40px / 168ms to fully settle — 148px and 626ms total where it
 * visibly looked stuck. The fix is a smaller pad, not a slower fade.
 */
const PAD_TOP = 28;
const PAD_X = 24;
const PAD_BOTTOM = 32;

export interface DockMagnifyTransform {
  scale: number;
}

/**
 * One entry in the dock's resting layout. Separators occupy a slot so resting
 * centres line up with what is rendered, but they never magnify.
 */
export interface DockSlot {
  width: number;
  magnifies: boolean;
}

/**
 * Everything a frame needs: where the bump is (`x`, against the resting centre
 * it was measured from) and how far it has ramped in (`intensity`, 0..1).
 */
type Magnify = { x: number; restingCenterX: number; intensity: number } | null;

/** Resting centre of the panel: `left-1/2` resolves against the viewport, and
 * the -50% translate is relative to the panel's own width, so the centre lands
 * at half the viewport regardless of how far magnification has widened it. */
const restingCenterX = () => document.documentElement.clientWidth / 2;

/** Maps pointer speed onto how long the arrive/leave ramp should run. */
function rampDurationFor(speed: number) {
  const t = Math.min(
    Math.max((speed - SPEED_SLOW) / (SPEED_FAST - SPEED_SLOW), 0),
    1
  );
  // sqrt rather than a symmetric ease: everyday pointer speeds sit in the
  // bottom third of the range, and a curve that is flat there leaves an
  // ordinary brisk move on almost the full slow duration.
  const eased = Math.sqrt(t);
  return Math.round(RAMP_SLOW_MS + (RAMP_FAST_MS - RAMP_SLOW_MS) * eased);
}

/**
 * @param slots resting layout of every slot in order, icons and separators
 * alike, so resting centres can be accumulated.
 */
export function useDockMagnification(slots: DockSlot[]) {
  const [magnify, setMagnify] = useState<Magnify>(null);

  const dockRef = useRef<HTMLElement | null>(null);
  const activeRef = useRef(false);
  const stateRef = useRef<Magnify>(null);
  const eventRef = useRef<{ x: number; y: number } | null>(null);
  const eventDirtyRef = useRef(false);
  const rampRef = useRef<{
    from: number;
    to: number;
    start: number;
    dur: number;
  } | null>(null);
  const rafRef = useRef<number | null>(null);
  const speedRef = useRef(0);
  const lastSampleRef = useRef<{ x: number; y: number; t: number } | null>(null);

  /** Retarget the envelope. Deliberately does not schedule: callers outside
   * the frame loop do that, and `step` keeps looping while a ramp is live. */
  const beginRamp = useCallback((to: number) => {
    if (to === 0) activeRef.current = false;
    rampRef.current = {
      from: stateRef.current?.intensity ?? 0,
      to,
      start: performance.now(),
      dur: rampDurationFor(speedRef.current),
    };
  }, []);

  /**
   * Advance one frame. Returns whether another frame is needed, so the driver
   * below can keep looping without this having to call back into it — that
   * would make `step` and the scheduler mutually recursive, which is what
   * previously forced the loop into a ref written during render.
   */
  const step = useCallback(() => {
    const prev = stateRef.current;
    let x = prev?.x ?? 0;
    let centre = prev?.restingCenterX ?? 0;
    let intensity = prev?.intensity ?? 0;

    // Always clear the flag, even when inactive, so it can never wedge the
    // loop on permanently.
    const dirty = eventDirtyRef.current;
    eventDirtyRef.current = false;

    // 1. Shape: follow the pointer exactly, with one layout read per frame.
    if (dirty && activeRef.current) {
      const el = dockRef.current;
      const ev = eventRef.current;
      if (el && ev) {
        const rect = el.getBoundingClientRect();
        const inside =
          ev.x >= rect.left - PAD_X &&
          ev.x <= rect.right + PAD_X &&
          ev.y >= rect.top - PAD_TOP &&
          ev.y <= rect.bottom + PAD_BOTTOM;
        if (inside) {
          x = ev.x;
          centre = restingCenterX();
        } else {
          beginRamp(0);
        }
      }
    }

    // 2. Intensity: advance the envelope independently of the shape.
    const ramp = rampRef.current;
    if (ramp) {
      const elapsed = performance.now() - ramp.start;
      const t = ramp.dur <= 0 ? 1 : Math.min(elapsed / ramp.dur, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      intensity = ramp.from + (ramp.to - ramp.from) * eased;
      if (t >= 1) {
        intensity = ramp.to;
        rampRef.current = null;
      }
    }

    if (!activeRef.current && intensity <= 0) {
      if (prev !== null) {
        stateRef.current = null;
        setMagnify(null);
      }
    } else if (
      !prev ||
      prev.x !== x ||
      prev.restingCenterX !== centre ||
      prev.intensity !== intensity
    ) {
      const next = { x, restingCenterX: centre, intensity };
      stateRef.current = next;
      setMagnify(next);
    }

    return rampRef.current != null;
  }, [beginRamp]);

  const schedule = useCallback(() => {
    if (rafRef.current != null) return;
    const run = () => {
      rafRef.current = null;
      if (step()) rafRef.current = requestAnimationFrame(run);
    };
    rafRef.current = requestAnimationFrame(run);
  }, [step]);

  const onMouseEnter = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      dockRef.current = e.currentTarget;

      // Seed from the entering event itself. The loop only reads a pointer on
      // the next move, so an enter-and-hold would otherwise never magnify.
      eventRef.current = { x: e.clientX, y: e.clientY };
      activeRef.current = true;
      const next = {
        x: e.clientX,
        restingCenterX: restingCenterX(),
        intensity: stateRef.current?.intensity ?? 0,
      };
      stateRef.current = next;
      setMagnify(next);

      // speedRef is already warm here: the tracker below runs on every move,
      // not just moves over the dock, so the approach speed is known at the
      // moment of arrival — which is the whole point of measuring it globally.
      beginRamp(1);
      schedule();
    },
    [beginRamp, schedule]
  );

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const t = e.timeStamp || performance.now();
      const prev = lastSampleRef.current;
      lastSampleRef.current = { x: e.clientX, y: e.clientY, t };

      if (prev) {
        const dt = t - prev.t;
        if (dt > SPEED_IDLE_MS) {
          speedRef.current = 0;
        } else if (dt > 0) {
          const inst = Math.hypot(e.clientX - prev.x, e.clientY - prev.y) / dt;
          speedRef.current += (inst - speedRef.current) * SPEED_SMOOTHING;
        }
      }

      eventRef.current = { x: e.clientX, y: e.clientY };
      if (activeRef.current) {
        eventDirtyRef.current = true;
        schedule();
      }
    };

    // Pointer left the document entirely.
    const onDocOut = (e: MouseEvent) => {
      if (!e.relatedTarget && activeRef.current) {
        beginRamp(0);
        schedule();
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseout", onDocOut);
    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onDocOut);
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [schedule, beginRamp]);

  // Resting centre of each slot, measured from the left edge of the content
  // box. Padding is symmetric, so the content box shares the panel's centre.
  const restingCenters: number[] = [];
  let cursor = 0;
  slots.forEach((slot, i) => {
    restingCenters.push(cursor + slot.width / 2);
    cursor += slot.width + (i < slots.length - 1 ? DOCK_GAP : 0);
  });
  const restingWidth = cursor;

  /** Pointer mapped into resting-layout space, from the content's left edge. */
  const pointerU = magnify
    ? magnify.x - magnify.restingCenterX + restingWidth / 2
    : null;

  const scaleAt = (index: number) => {
    if (pointerU == null || !magnify) return 1;
    const distance = Math.abs(pointerU - restingCenters[index]);
    if (distance >= CUTOFF) return 1;
    const falloff = Math.exp(-(distance * distance) / (2 * SIGMA * SIGMA));
    // Shape times envelope: the bump keeps its position and profile while it
    // ramps in, so tracking never waits on the animation.
    return 1 + (MAX_SCALE - 1) * falloff * magnify.intensity;
  };

  // Called during render, so there is nothing to gain from memoising it.
  const getTransform = (index: number): DockMagnifyTransform => ({
    scale: scaleAt(index),
  });

  // How far to nudge the centred panel so growth radiates away from the cursor.
  //
  // Let `grown` be the total width magnification adds, and `grownLeft` the part
  // of it that appears left of the cursor. Centre-anchoring puts the left edge
  // at restingLeft - grown/2 regardless of where the pointer is, so whenever
  // grownLeft != grown/2 the content under the cursor slides. Pinning it means
  // the left edge must sit at restingLeft - grownLeft instead, i.e. a shift of
  // grown/2 - grownLeft. Point at the left of the dock and grownLeft is near
  // zero, so the panel keeps its left edge and stretches right.
  let offsetX = 0;
  if (pointerU != null) {
    let grown = 0;
    let grownLeft = 0;
    slots.forEach((slot, i) => {
      if (!slot.magnifies) return;
      const extra = slot.width * (scaleAt(i) - 1);
      grown += extra;
      // Only the part of the slot the cursor has already passed counts, so the
      // anchor stays continuous as the pointer crosses an icon rather than
      // jumping the whole panel when it changes sides.
      const start = restingCenters[i] - slot.width / 2;
      const passed = Math.min(Math.max(pointerU - start, 0), slot.width);
      grownLeft += (passed / slot.width) * extra;
    });
    offsetX = grown / 2 - grownLeft;
  }

  return { onMouseEnter, getTransform, offsetX };
}
