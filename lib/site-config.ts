/** Set NEXT_PUBLIC_SITE_PHASE=release to use the full game overview as the home page. */
export const sitePhase = process.env.NEXT_PUBLIC_SITE_PHASE === "release" ? "release" : "teaser";

/** The preview routes remain inaccessible until this server-side flag is enabled. */
export const releasePreviewEnabled = process.env.RELEASE_PREVIEW_ENABLED === "true";

export const steamUrl = process.env.NEXT_PUBLIC_STEAM_URL?.trim() || null;

export const releaseNavigation = [
  { href: "/game", label: "The game" },
  { href: "/game/journal", label: "Journal" },
  { href: "/game/roadmap", label: "Roadmap" },
  { href: "/game/design", label: "Design" },
  { href: "/game/mechanics", label: "Mechanics" },
  { href: "/game/about", label: "About" },
] as const;
