function trimEnd(s: string) {
  return s.endsWith("/") ? s.slice(0, -1) : s;
}

export const siteConfig = {
  name: "案件溫度計",
  shortName: "FairCases",
  description:
    "整理台灣社會案件的後續進度與公眾關注熱度，引用公開報導，僅做整理、不下定論。",
  /**
   * Set NEXT_PUBLIC_SITE_URL in production. Vercel automatically exposes
   * VERCEL_URL on previews — we fall back to it if SITE_URL is unset.
   */
  url: trimEnd(
    process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
      "http://localhost:3000"
  ),
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL || "contact@example.com",
} as const;
