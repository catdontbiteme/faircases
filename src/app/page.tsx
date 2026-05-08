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
    <div className="container-prose py-10">
      <section className="mb-8">
        <div className="relative mb-6 overflow-hidden rounded-lg border border-rule bg-black">
          <Image
            src="/hero.png"
            alt=""
            width={1600}
            height={900}
            className="h-56 w-full object-cover md:h-80"
            priority
          />
        </div>
        <h1 className="font-serif text-3xl font-semibold leading-tight md:text-4xl">
          那件事，後來怎麼了？
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
  );
}
