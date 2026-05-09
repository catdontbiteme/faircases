import Image from "next/image";
import { Suspense } from "react";
import { CaseList } from "@/components/CaseList";
import { ForgottenRanking } from "@/components/ForgottenRanking";
import { HeatFormulaInfo } from "@/components/HeatFormulaInfo";
import { getAllCases } from "@/lib/cases";
import {
  COOLNESS_SORT_ORDER,
  computeCoolness,
  computeForgottenScore,
  loadHeatSeries,
} from "@/lib/coolness";

const FORGOTTEN_TOP_N = 5;

export default function HomePage() {
  const cases = getAllCases();
  const enriched = cases.map((c) => {
    const series = loadHeatSeries(c.slug);
    return {
      c,
      coolness: computeCoolness(c, series),
      score: computeForgottenScore(c, series),
    };
  });

  // Top forgotten: positive score only, sorted desc, limited to N
  const forgotten = [...enriched]
    .filter((e) => e.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, FORGOTTEN_TOP_N);

  // Main grid: existing coolness sort
  enriched.sort((a, b) => {
    const order =
      COOLNESS_SORT_ORDER[a.coolness.level] -
      COOLNESS_SORT_ORDER[b.coolness.level];
    if (order !== 0) return order;
    return new Date(b.c.occurredAt).getTime() - new Date(a.c.occurredAt).getTime();
  });

  return (
    <>
      {/* Full-bleed hero — preserves original 16:9 so the candle/light isn't cropped.
          Max-w cap stops the image from getting absurdly tall on ultra-wide screens
          (1280px wide → ~720px tall, the natural image size). */}
      <section className="relative mx-auto w-full max-w-[1280px]">
        <Image
          src="/hero.png"
          alt=""
          width={1600}
          height={900}
          className="aspect-[16/9] w-full object-contain brightness-[1.15] contrast-[1.05]"
          priority
        />
        {/* gentle vignette so the hero anchors visually instead of feeling like a stock photo */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(20,23,26,0.55)_100%)]" />
      </section>

      <div className="container-prose py-10">
        <section className="mb-10">
          <h1 className="font-serif text-3xl font-semibold leading-tight md:text-4xl lg:text-5xl">
            誰還記得他們？
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-ink/80">
            台灣社會案件的後續進度與公眾關注熱度。整理公開報導，僅做事實時間軸與熱度趨勢，不下定論。
          </p>
        </section>

        <ForgottenRanking entries={forgotten} />

        <HeatFormulaInfo />

        <Suspense fallback={null}>
          <CaseList enriched={enriched} />
        </Suspense>
      </div>
    </>
  );
}
