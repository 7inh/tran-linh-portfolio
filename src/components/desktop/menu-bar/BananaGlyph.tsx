/**
 * The banana that stands in for the  menu.
 *
 * Inlined rather than loaded from `/boot/banana.svg` so it can paint with
 * `currentColor` and follow the bar in both themes. The file version is hard
 * coded to white, which is right against the dark boot screen but nearly
 * invisible on a light wallpaper.
 *
 * Path data is shared with `public/boot/banana.svg` — Next has no SVGR set up
 * here, so an `<img>` cannot inherit colour. Keep the two in sync if the
 * artwork changes.
 */
import { cn } from "@/lib/utils";

export function BananaGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={cn("size-[15px]", className)}
      fill="currentColor"
      aria-hidden
    >
      <path d="m18.6 1.501l3.3 1.5v5.5c3.04 3.828-.448 11.442-7.691 13.122C6.965 23.304 1 19.5 1 15.501C1 14 1.738 13.195 3 14s3.098 1.683 4.86 2.072C13.223 17.253 17.919 14.5 18.6 8.5z" />
      <path d="M8.237 15.072C13.11 16.253 17.379 13.5 18 7.5c-.678 1.385-2.064 3.703-7 4c-2.883.173-5.449-.803-6.183-1.152c-.734-.35-1.137.152-.921 1.026s1.26 2.727 4.34 3.697" />
    </svg>
  );
}
