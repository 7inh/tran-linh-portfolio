/**
 * Hook for dock item magnification behavior
 * Manages hover state and animation values
 */
import { useState } from "react";

export interface MagnificationState {
  isHovered: boolean;
}

export function useDockMagnification() {
  const [isHovered, setIsHovered] = useState(false);

  return {
    isHovered,
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  };
}
