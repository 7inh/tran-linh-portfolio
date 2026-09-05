import type { Metadata } from "next";
import { Outfit, Source_Sans_3 } from "next/font/google";
import { SquircleDefs } from "@/components/icons/SquircleDefs";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Tran Linh — Fullstack Software Engineer",
  description:
    "Portfolio desktop of Tran Linh — fullstack software engineer building AI-assisted products and polished web platforms.",
};

/**
 * `dark` ships on the server-rendered html as a starting guess. This blocking
 * script corrects it before first paint: an explicit stored choice wins,
 * otherwise it follows the OS's light/dark setting. Either way it must run
 * before React hydrates, or the class list would flash then jump.
 */
const themeScript = `(function(){try{
  var stored = localStorage.getItem("portfolio-theme");
  var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.classList.toggle("dark", dark);
}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // themeScript may add or remove `dark` before hydration, so the class
      // list legitimately differs from the server render.
      suppressHydrationWarning
      className={`${outfit.variable} ${sourceSans.variable} dark h-full antialiased`}
    >
      {/* Browser extensions (LocatorJS, and others of that sort) stamp their
          own attributes onto <head> before React hydrates, which reads as a
          mismatch against the clean server markup. suppressHydrationWarning
          only covers the element it is on, so <html> having it does nothing
          for <head>. */}
      <head suppressHydrationWarning>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full overflow-hidden font-sans">
        <SquircleDefs />
        {children}
      </body>
    </html>
  );
}
