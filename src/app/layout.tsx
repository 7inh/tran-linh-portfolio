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
 * Dark is the default theme, so `dark` ships on the server-rendered html.
 * This blocking script only strips it when the visitor has explicitly
 * chosen light before, which avoids a flash of the wrong theme.
 */
const themeScript = `(function(){try{if(localStorage.getItem("portfolio-theme")==="light"){document.documentElement.classList.remove("dark")}}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // themeScript may strip `dark` before hydration, so the class list
      // legitimately differs from the server render.
      suppressHydrationWarning
      className={`${outfit.variable} ${sourceSans.variable} dark h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-full overflow-hidden font-sans">
        <SquircleDefs />
        {children}
      </body>
    </html>
  );
}
