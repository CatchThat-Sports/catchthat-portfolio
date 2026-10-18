import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const body = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });
const display = Barlow_Condensed({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://www.catchthat.io"),
  title: { default: "CatchThat Football", template: "%s | CatchThat Football" },
  description: "A football management sim built on a real play-by-play engine. Run the franchise, or call every snap. Coming to Steam.",
  openGraph: {
    title: "CatchThat Football",
    description: "A football management sim built on a real play-by-play engine. Run the franchise, or call every snap. Coming to Steam.",
    url: "https://www.catchthat.io",
    siteName: "CatchThat Football",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "CatchThat Football" }],
  },
  twitter: { card: "summary_large_image", title: "CatchThat Football", description: "A football management sim built on a real play-by-play engine. Run the franchise, or call every snap. Coming to Steam.", creator: "@sausyville", images: ["/og.png"] },
  icons: { icon: "/favicon.ico?v=2", apple: "/apple-touch-icon.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${body.variable} ${display.variable} ${mono.variable}`}>
      <body>
        <div className="relative min-h-screen"><SiteHeader />{children}<SiteFooter /></div>
      </body>
    </html>
  );
}
