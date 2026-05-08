import {
  COOLNESS_HOT_THRESHOLD,
  COOLNESS_RECENT_DAYS,
  COOLNESS_WARM_THRESHOLD,
} from "@/lib/coolness";

const pct = (n: number) => `${Math.round(n * 100)}%`;

export function HeatFormulaInfo() {
  return (
    <details className="group mb-8 rounded-md border border-rule bg-surface">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-medium text-ink/85 hover:bg-surfaceHi">
        <span className="mr-2 text-muted">＋</span>
        熱度退燒指標怎麼算？
      </summary>
      <div className="border-t border-rule px-4 py-4 text-sm leading-relaxed text-ink/80">
        <p>
          <strong>退燒指數</strong> = 近 {COOLNESS_RECENT_DAYS} 天熱度平均
          ÷ 該案件歷史峰值。
        </p>
        <ul className="mt-3 space-y-1">
          <li>
            <span className="mr-1">🔥</span>仍熱：≥ {pct(COOLNESS_HOT_THRESHOLD)}
          </li>
          <li>
            <span className="mr-1">💭</span>餘溫：{pct(COOLNESS_WARM_THRESHOLD)}–
            {pct(COOLNESS_HOT_THRESHOLD)}
          </li>
          <li>
            <span className="mr-1">🧊</span>已冷：&lt;{" "}
            {pct(COOLNESS_WARM_THRESHOLD)}（且案件已結）
          </li>
          <li>
            <span className="mr-1">⚠️</span>
            <strong>冷案警報</strong>：已冷但案件未結 — 本站要凸顯的就是這類
          </li>
        </ul>
        <p className="mt-3 text-xs text-muted">
          資料來源：Google Trends（地區=台灣）+ PTT 八卦版提及次數 +
          Google News 主流媒體加權報導頻率，每週聚合。三條線取最高比值決定退燒等級。每週由
          GitHub Actions 自動更新。
        </p>
      </div>
    </details>
  );
}
