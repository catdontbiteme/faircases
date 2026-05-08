import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "關於本站",
  description: "案件溫度計的編輯方針、法律邊界與更正管道。",
};

export default function AboutPage() {
  return (
    <article className="container-prose py-10 leading-relaxed">
      <h1 className="font-serif text-3xl font-semibold leading-tight md:text-4xl">
        關於本站
      </h1>

      <section className="mt-6">
        <h2 className="font-serif text-xl font-semibold">為什麼做這個</h2>
        <p className="mt-3">
          台灣常爆出令人痛心的社會案件，新聞熱度退燒後，後續進度卻乏人追蹤。本站整理已公開報導，提供「事件時間軸」與「公眾關注熱度」兩個維度，讓這些人不被遺忘，讓那些事繼續被看見。
        </p>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">編輯方針（紅線）</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-6">
          <li>
            <strong>未滿 18 歲當事人：</strong>
            依兒少法第 69
            條，不揭露姓名、照片、聲音、住所、學校、班級、親屬等可辨識資訊。
          </li>
          <li>
            <strong>偵查不公開：</strong>
            偵查中案件僅敘述警方／檢方公開說明，不援引未經證實之爆料。
          </li>
          <li>
            <strong>判決前不定罪：</strong>
            一律以代稱（A 男、王姓男子等媒體已使用之代稱）描述當事人；不使用「兇手」「殺人犯」等定罪用語。
          </li>
          <li>
            <strong>被害人保護：</strong>
            不主動揭露被害人姓名與照片，即使新聞已露出。
          </li>
          <li>
            <strong>來源可追：</strong>
            事實陳述附引用來源 URL，僅引用主流媒體與政府公開資訊。
          </li>
          <li>
            <strong>不做事實認定：</strong>
            本站僅整理報導，不對個別事實作獨立認定，不下評論性結論。
          </li>
        </ol>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">熱度退燒指標</h2>
        <p className="mt-3">
          每個案件頁顯示 Google Trends 搜尋熱度與 PTT 八卦版提及次數的疊圖。
          以「近 30 天平均 ÷ 歷史峰值」為退燒指數：
        </p>
        <ul className="mt-3 list-disc space-y-1 pl-6 text-sm">
          <li>🔥 仍熱：≥ 30%</li>
          <li>💭 餘溫：10%–30%</li>
          <li>🧊 已冷：&lt; 10%（且案件已結）</li>
          <li>⚠️ 冷案警報：已冷但案件未結</li>
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-serif text-xl font-semibold">更正與下架</h2>
        <p className="mt-3">
          如發現任何條目資訊有誤、引用來源失效，或當事人請求下架，請來信反映，本站將儘速處理。
        </p>
      </section>
    </article>
  );
}
