/** First-paint assets shown under the boot overlay (wallpaper + dock/home glyphs). */
export const CRITICAL_BOOT_ASSETS = [
  "/wallpaper/big-sur.jpg",
  "/icons/about.svg",
  "/icons/projects.png",
  "/icons/experience.svg",
  "/icons/contact.svg",
  "/icons/browser.svg",
  "/icons/notes.svg",
  "/icons/games.svg",
  "/icons/utilities.svg",
  "/icons/trash.png",
  "/icons/dino.svg",
  "/icons/minesweeper.svg",
  "/icons/qrcode.svg",
] as const;

function preloadOne(src: string): Promise<void> {
  return new Promise((resolve) => {
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    const finish = () => {
      if (typeof img.decode === "function") {
        img.decode().then(done, done);
        return;
      }
      done();
    };

    const img = new Image();
    img.onload = finish;
    // Missing or failed assets must not hang the boot sequence.
    img.onerror = done;
    img.src = src;

    // Already cached: some browsers set complete synchronously before handlers attach.
    if (img.complete) {
      if (img.naturalWidth > 0) finish();
      else done();
    }
  });
}

/** Load and decode every URL; settles even when individual images fail. */
export function preloadAssets(urls: readonly string[]): Promise<void> {
  return Promise.all(urls.map(preloadOne)).then(() => undefined);
}
