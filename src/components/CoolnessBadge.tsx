import type { Coolness } from "@/lib/coolness";

const COLOR: Record<Coolness["level"], string> = {
  hot: "border-red-300 bg-red-50 text-red-800",
  warm: "border-amber-300 bg-amber-50 text-amber-800",
  cold: "border-slate-300 bg-slate-50 text-slate-700",
  alert: "border-orange-400 bg-orange-50 text-orange-900",
};

export function CoolnessBadge({ coolness }: { coolness: Coolness }) {
  return (
    <span className={`pill ${COLOR[coolness.level]}`}>
      <span aria-hidden>{coolness.emoji}</span>
      <span>{coolness.label}</span>
    </span>
  );
}
