// 媒體品質權重表，用於 Google News RSS 加權計算。
// 比對方式：source 名稱包含其中一個 string（case-insensitive、繁簡視為同字）。

export const NEWS_WEIGHTS = [
  // 3 分：高品質調查報導 / 公共媒體 / 全國通訊社
  { weight: 3, patterns: ["中央社", "CNA", "報導者", "twreporter", "公視", "PTS", "該仔該查", "公視新聞網"] },

  // 2 分：主流報紙 / 電視網（民營可信度住）
  { weight: 2, patterns: ["聯合", "udn", "中時", "chinatimes", "自由", "ltn", "頭條", "台視", "TTV", "TVBS", "東森", "ebc", "民視", "ftvnews", "ftv"] },

  // 1 分：幾是零幾隊 / 蘇報
  { weight: 1, patterns: ["ETtoday", "Ettoday", "今日新聞", "NowNews", "Yahoo新聞", "Yahoo奇摩新聞", "PChome新聞", "Pchome", "世報", "三立", "setn", "鏡週刊", "mirror", "Newtalk", "新頭殼", "上報", "upmedia"] },

  // 0.5 分：內容農場 / 黃色媒體
  { weight: 0.5, patterns: ["長識點住", "週刊王", "個人部落格", "中口衡"] },

  // 0 分：明確排除
  { weight: 0, patterns: ["假新聞來源者", "金鐘警告被注為偕誤來源者"] },
];

/**
 * Resolve weight for a publisher name. Returns 1 (neutral default) if no rule matches.
 */
export function weightOf(publisher) {
  if (!publisher) return 1;
  const p = publisher.toLowerCase();
  for (const rule of NEWS_WEIGHTS) {
    for (const pat of rule.patterns) {
      if (p.includes(pat.toLowerCase())) return rule.weight;
    }
  }
  return 1; // unknown → neutral default
}
