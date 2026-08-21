"use client";

export function Wallpaper() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[linear-gradient(165deg,#7eb8d8_0%,#a8d4e8_28%,#c5e4ef_52%,#8ec5c0_78%,#6ba8b8_100%)]" />
      <div className="absolute -left-[20%] top-[-10%] h-[70%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.55)_0%,transparent_68%)] blur-2xl" />
      <div className="absolute right-[-15%] top-[15%] h-[55%] w-[55%] rounded-full bg-[radial-gradient(circle,rgba(120,190,200,0.45)_0%,transparent_70%)] blur-3xl" />
      <div className="absolute bottom-[-20%] left-[20%] h-[60%] w-[70%] rounded-full bg-[radial-gradient(circle,rgba(90,140,170,0.35)_0%,transparent_65%)] blur-3xl" />
      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
