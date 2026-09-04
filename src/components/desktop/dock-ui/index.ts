/**
 * Dock module exports
 */
export { DockContainer } from "./DockContainer";
export { DockItem } from "./DockItem";
export { DockFolder } from "./DockFolder";
export { useDockMagnification } from "./useDockMagnification";
export * from "./DockConfig";

// Re-export AppGlyph for use in dock subcomponents
export { AppGlyph, squircleClip } from "../Dock";
