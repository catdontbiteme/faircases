import type { CaseCategory, CaseStatus } from "./cases";

export const CATEGORY_LABEL: Record<CaseCategory, string> = {
  "violent-crime": "暴力犯罪",
  "police-line-of-duty": "警消殉職",
  bullying: "霸凌",
  "data-leak": "個資外洩",
  other: "其他",
};

export const STATUS_LABEL: Record<CaseStatus, string> = {
  "in-investigation": "偵查中",
  indicted: "已起訴",
  "in-trial": "審理中",
  sentenced: "已判決",
  closed: "結案",
};

export const STATUS_OPEN: Record<CaseStatus, boolean> = {
  "in-investigation": true,
  indicted: true,
  "in-trial": true,
  sentenced: false,
  closed: false,
};
