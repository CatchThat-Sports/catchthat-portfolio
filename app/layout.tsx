import type { Metadata } from "next";
import { Barlow_Condensed, IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

const body = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-body", weight: ["400", "500", "600", "700"] });
const display = Barlow_Condensed({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700", "800"] });
const mono = IBM_Plex_Mono({ subsets: ["latin"], variable: "--font-mono", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://catchthat.io"),
  title: { default: "CatchThat Football", template: "%s | CatchThat Football" },
  description: "A football simulation from CatchThat.",
  openGraph: {
    title: "CatchThat Football",
    description: "A football simulation from CatchThat.",
    url: "https://catchthat.io",
    siteName: "CatchThat Football",
    type: "website",
    images: [{ url: "/logo.png" }],
  },
  twitter: { card: "summary_large_image", title: "CatchThat Football", images: ["/logo.png"] },
  icons: { icon: "/favicon.ico" },
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
