function trimEnd(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

// If you bind a custom domain later, either:
//   (a) set NEXT_PUBLIC_SITE_URL on Vercel (preferred), or
//   (b) update PRODUCTION_FALLBACK_URL below.
const PRODUCTION_FALLBACK_URL = "https://faircases.vercel.app";

export const siteConfig = {
  name: "案件溫度計",
  shortName: "FairCases",
  description:
    "整理台灣社會案件的後續進度與公眾關注熱度，引用公開報導，僅做整理、不下定論。",
  /**
   * Resolution order:
   *   1. NEXT_PUBLIC_SITE_URL (explicit override)
   *   2. PRODUCTION_FALLBACK_URL when NODE_ENV=production
   *   3. VERCEL_URL (deployment-specific URL on previews)
   *   4. localhost (dev)
   */
  url: trimEnd(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.NODE_ENV === "production" ? PRODUCTION_FALLBACK_URL : "") ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000"
  ),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com",
} as const;
