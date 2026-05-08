import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { CoolnessBadge } from "@/components/CoolnessBadge";
import { HeatCurve } from "@/components/HeatCurve";
import { ShareButtons } from "@/components/ShareButtons";
import { Timeline } from "@/components/Timeline";
import { siteConfig } from "@/lib/site";
import { getAllSlugs, getCaseBySlug } from "@/lib/cases";
import { computeCoolness, loadHeatSeries } from "@/lib/coolness";
import { CATEGORY_ICON } from "@/lib/icons";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/labels";

type Params = { slug: string };

export function generateStaticParams(): Params[] {
  return getAllSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCaseBySlug(slug);
  if (!c) return {};
  return {
    title: c.shortTitle,
    description: c.summary,
  };
}

export default async function CasePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const c = getCaseBySlug(slug);
  if (!c) notFound();

  const series = loadHeatSeries(c.slug);
  const coolness = computeCoolness(c, series);

  return (
    <article className="container-reading py-10">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <span className="pill">
            <Image
              src={CATEGORY_ICON[c.category]}
              alt=""
              width={14}
              height={14}
              className="opacity-80"
            />
            {CATEGORY_LABEL[c.category]}
          </span>
          <span className="pill">{STATUS_LABEL[c.status]}</span>
          <CoolnessBadge coolness={coolness} />
        </div>
        <h1 className="mt-3 font-serif text-3xl font-semibold leading-tight md:text-4xl">
          {c.title}
        </h1>
        <p className="mt-2 text-sm text-muted">
          發生：{c.occurredAt}　|　最後更新：{c.lastUpdated}
        </p>
        <p className="mt-4 leading-relaxed text-ink/85">{c.summary}</p>
      </header>

      <section className="mt-8">
        <h2 className="font-serif text-lg font-semibold">關注熱度</h2>
        <p className="mt-1 text-xs text-muted">
          {coolness.emoji} {coolness.label}：{coolness.description}
        </p>
        <div className="mt-3">
          <HeatCurve data={series} />
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-lg font-semibold">事件時間軸</h2>
        <div className="mt-4">
          <Timeline entries={c.timeline} />
        </div>
      </section>

      {c.keyQuestions.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-lg font-semibold">後續關鍵問題</h2>
          <ul className="mt-3 list-disc space-y-1 pl-6 text-sm leading-relaxed">
            {c.keyQuestions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </section>
      )}

      {c.controversies && c.controversies.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-lg font-semibold">爭議焦點</h2>
          <p className="mt-1 text-xs text-muted">
            根據引用報導整理出的輿論討論點，本站不對任一立場下判斷。
          </p>
          <ol className="mt-4 space-y-3">
            {c.controversies.map((co, i) => (
              <li
                key={i}
                className="rounded-md border-l-2 border-accent bg-surface px-4 py-3"
              >
                <h3 className="text-sm font-semibold text-ink">
                  {i + 1}. {co.point}
                </h3>
                <p className="mt-1 text-sm leading-relaxed text-ink/80">
                  {co.detail}
                </p>
              </li>
            ))}
          </ol>
        </section>
      )}

      {c.notes && c.notes.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-lg font-semibold">附註：相關疑雲</h2>
          <p className="mt-1 text-xs text-muted">
            以下事件與本案有關但**非主時間軸**，僅紀錄輿論討論軌跡。
          </p>
          <div className="mt-4 space-y-4">
            {c.notes.map((n, i) => (
              <div
                key={i}
                className="rounded-md border border-rule bg-surface p-4"
              >
                <h3 className="text-sm font-semibold text-ink">{n.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink/80">
                  {n.body}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {c.body.trim() && (
        <section className="prose-content mt-10 leading-relaxed">
          <MDXRemote source={c.body} />
        </section>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-lg font-semibold">引用來源</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6 text-sm leading-relaxed">
          {c.sources.map((s, i) => (
            <li key={i}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent"
              >
                {s.title}
              </a>
              <span className="text-muted">
                　— {s.publisher}，{s.publishedAt}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <ShareButtons slug={c.slug} title={c.shortTitle} />

      <aside className="mt-8 rounded-md border border-rule bg-surface p-4 text-xs leading-relaxed text-muted">
        <strong className="text-ink">本頁聲明：</strong>
        本案件條目僅整理已公開報導，不對事實作獨立認定。當事人以代稱描述，未滿
        18 歲者不揭露足以辨識身分之資訊（兒少法第 69 條）。
        {" "}
        <a
          href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
            `[${siteConfig.name}] ${c.shortTitle} 錯誤回報`
          )}&body=${encodeURIComponent(
            `案件 slug：${c.slug}\n網址：${siteConfig.url}/cases/${c.slug}\n\n（請說明錯誤內容、提供來源）\n`
          )}`}
          className="text-accent underline-offset-2 hover:underline"
        >
          回報這個案件的錯誤
        </a>
      </aside>
    </article>
  );
}
