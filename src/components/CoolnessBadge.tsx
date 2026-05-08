import type { Coolness } from "@/lib/coolness";

// Dark-mode badge palette: low-saturation borders, transparent fill,
// readable text. We avoid solid bg colors to keep the funereal tone.
const COLOR: Record<Coolness["level"], string> = {
  hot: "border-red-700/60 text-red-300",
  warm: "border-amber-700/60 text-amber-300",
  cold: "border-slate-600/60 text-slate-400",
  alert: "border-accent text-accent",
};

export function CoolnessBadge({ coolness }: { coolness: Coolness }) {
  return (
    <span className={`pill ${COLOR[coolness.level]}`}>
      <span aria-hidden>{coolness.emoji}</span>
      <span>{coolness.label}</span>
    </span>
  );
}
