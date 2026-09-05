/**
 * macOS-style battery: outline, terminal nub, and a fill proportional to the
 * real level. Lucide's battery icons step through fixed buckets, which reads as
 * a stylised icon rather than a status indicator.
 *
 * With no reading available the glyph is dimmed and left unfilled rather than
 * drawn full — an invented level would be a claim about the machine's state.
 */
import { cn } from "@/lib/utils";
import type { BatteryReading } from "./useBattery";

const BODY_W = 22;
const FILL_INSET = 2;
const FILL_MAX = BODY_W - FILL_INSET * 2;

export function BatteryGlyph({
  reading,
  className,
}: {
  reading: BatteryReading | null;
  className?: string;
}) {
  const level = reading ? Math.min(Math.max(reading.level, 0), 1) : 0;
  const label = reading
    ? `Battery ${Math.round(level * 100)}%${reading.charging ? ", charging" : ""}`
    : "Battery level unavailable";

  return (
    <svg
      viewBox="0 0 26 12"
      className={cn("h-[11px] w-[24px]", !reading && "opacity-45", className)}
      role="img"
      aria-label={label}
    >
      <rect
        x="0.5"
        y="0.5"
        width={BODY_W}
        height="11"
        rx="3"
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.5"
      />
      <path
        d="M24 4.2c1 .35 1.4 1 1.4 1.8s-.4 1.45-1.4 1.8z"
        fill="currentColor"
        fillOpacity="0.5"
      />
      {reading && level > 0 && (
        <rect
          x={FILL_INSET}
          y={FILL_INSET}
          width={Math.max(FILL_MAX * level, 1.5)}
          height="8"
          rx="1.6"
          fill="currentColor"
        />
      )}
      {reading?.charging && (
        // Punched out of the fill so it stays legible at any level.
        <path
          d="M13.1 2.4 9.4 6.7h2.3l-.8 2.9 3.7-4.3h-2.3z"
          fill="currentColor"
          stroke="var(--color-background)"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}
