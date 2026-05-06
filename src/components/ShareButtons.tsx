"use client";

type Props = {
  slug: string;
  title: string;
  /** Site origin override (server can't know request host); defaults to current location at runtime. */
  origin?: string;
};

export function ShareButtons({ slug, title, origin }: Props) {
  const buildUrl = () => {
    if (origin) return `${origin}/cases/${slug}`;
    if (typeof window !== "undefined") return `${window.location.origin}/cases/${slug}`;
    return `/cases/${slug}`;
  };

  const text = `${title}｜案件溫度計`;

  const open = (href: string) => {
    if (typeof window !== "undefined") {
      window.open(href, "_blank", "noopener,noreferrer,width=600,height=600");
    }
  };

  const onLine = () => {
    const url = encodeURIComponent(buildUrl());
    open(`https://social-plugins.line.me/lineit/share?url=${url}`);
  };
  const onX = () => {
    const url = encodeURIComponent(buildUrl());
    const t = encodeURIComponent(text);
    open(`https://twitter.com/intent/tweet?text=${t}&url=${url}`);
  };
  const onFb = () => {
    const url = encodeURIComponent(buildUrl());
    open(`https://www.facebook.com/sharer/sharer.php?u=${url}`);
  };
  const onCopy = async () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(buildUrl());
    }
  };

  return (
    <div className="mt-10 flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted">分享這個案件：</span>
      <button type="button" onClick={onLine} className="pill hover:border-ink">
        LINE
      </button>
      <button type="button" onClick={onX} className="pill hover:border-ink">
        X
      </button>
      <button type="button" onClick={onFb} className="pill hover:border-ink">
        Facebook
      </button>
      <button type="button" onClick={onCopy} className="pill hover:border-ink">
        複製連結
      </button>
    </div>
  );
}
