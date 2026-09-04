/**
 * Neighbor-aware dock magnification, like macOS: the cursor's distance to
 * each icon's center drives a smooth falloff curve, so icons near the
 * pointer grow and lift while farther ones taper back to their resting size.
 */
"use client";

import { useCallback, useRef, useState, type MouseEvent as ReactMouseEvent } from "react";

const MAX_SCALE = 1.6;
const INFLUENCE_RADIUS = 110; // px — distance at which magnification fades to 0
const MAX_LIFT = 10; // px — extra upward pop at peak magnification

export interface DockMagnifyTransform {
  scale: number;
  lift: number;
}

export function useDockMagnification() {
  const itemRefs = useRef<(HTMLElement | null)[]>([]);
  const [mouseX, setMouseX] = useState<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const setItemRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      itemRefs.current[index] = el;
    },
    []
  );

  const onMouseMove = useCallback((e: ReactMouseEvent) => {
    const x = e.clientX;
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setMouseX(x));
  }, []);

  const onMouseLeave = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    setMouseX(null);
  }, []);

  const getTransform = useCallback(
    (index: number): DockMagnifyTransform => {
      if (mouseX == null) return { scale: 1, lift: 0 };
      const el = itemRefs.current[index];
      if (!el) return { scale: 1, lift: 0 };
      const rect = el.getBoundingClientRect();
      const center = rect.left + rect.width / 2;
      const distance = Math.abs(mouseX - center);
      if (distance >= INFLUENCE_RADIUS) return { scale: 1, lift: 0 };
      const t = distance / INFLUENCE_RADIUS;
      const falloff = Math.cos((t * Math.PI) / 2);
      return {
        scale: 1 + (MAX_SCALE - 1) * falloff,
        lift: MAX_LIFT * falloff,
      };
    },
    [mouseX]
  );

  return { setItemRef, onMouseMove, onMouseLeave, getTransform };
}
