#!/usr/bin/env node
import path from "node:path";
import sharp from "sharp";

const SRC = path.join(process.cwd(), "01", "4.png");
const OUT = path.join(process.cwd(), "public", "icons");

const meta = await sharp(SRC).metadata();
const W = meta.width;
const H = meta.height;
const halfW = Math.floor(W / 2);
const halfH = Math.floor(H / 2);

// 2x2 grid mapping (top-left, top-right, bottom-left, bottom-right)
const tiles = [
  { name: "violent-crime.png", x: 0, y: 0, w: halfW, h: halfH },
  { name: "police-line-of-duty.png", x: halfW, y: 0, w: W - halfW, h: halfH },
  { name: "bullying.png", x: 0, y: halfH, w: halfW, h: H - halfH },
  { name: "data-leak.png", x: halfW, y: halfH, w: W - halfW, h: H - halfH },
];

console.log(`source: ${W}x${H}`);
for (const t of tiles) {
  const out = path.join(OUT, t.name);
  const tile = await sharp(SRC)
    .extract({ left: t.x, top: t.y, width: t.w, height: t.h })
    .toBuffer({ resolveWithObject: true });

  let trimmedBuf, trimmedInfo;
  try {
    const r = await sharp(tile.data)
      .trim({ background: { r: 250, g: 250, b: 247 }, threshold: 25 })
      .toBuffer({ resolveWithObject: true });
    trimmedBuf = r.data;
    trimmedInfo = r.info;
  } catch {
    trimmedBuf = tile.data;
    trimmedInfo = tile.info;
  }

  const tw = trimmedInfo.width;
  const th = trimmedInfo.height;
  const side = Math.max(tw, th);
  const pad = Math.round(side * 0.1);
  const padTop = pad + Math.floor((side - th) / 2);
  const padBottom = pad + Math.ceil((side - th) / 2);
  const padLeft = pad + Math.floor((side - tw) / 2);
  const padRight = pad + Math.ceil((side - tw) / 2);

  await sharp(trimmedBuf)
    .extend({
      top: padTop,
      bottom: padBottom,
      left: padLeft,
      right: padRight,
      background: { r: 250, g: 250, b: 247, alpha: 1 },
    })
    .toFile(out);
  console.log(`✓ ${t.name} trimmed ${tw}x${th} → padded ${tw + padLeft + padRight}x${th + padTop + padBottom}`);
}
