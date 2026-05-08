import { cookies } from "next/headers";
import { redirect } from "next/navigation";

async function loginAction(formData: FormData) {
  "use server";
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "/admin/candidates");
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    redirect("/admin/login?err=noenv");
  }
  if (password !== expected) {
    redirect(`/admin/login?err=bad&next=${encodeURIComponent(next)}`);
  }
  const c = await cookies();
  c.set("admin_auth", expected, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8h
  });
  redirect(next);
}

export default async function AdminLogin({
  searchParams,
}: {
  searchParams: Promise<{ err?: string; next?: string }>;
}) {
  const { err, next } = await searchParams;
  return (
    <div className="container-prose py-16">
      <h1 className="font-serif text-2xl font-semibold">Admin 登入</h1>
      <p className="mt-2 text-sm text-muted">
        本後台僅在 local dev 啟用。生產環境 (Vercel) 會回 404。
      </p>
      {err === "bad" && (
        <p className="mt-4 rounded-md border border-rule bg-surface px-3 py-2 text-sm text-accent">
          密碼錯誤
        </p>
      )}
      {err === "noenv" && (
        <p className="mt-4 rounded-md border border-rule bg-surface px-3 py-2 text-sm text-accent">
          ADMIN_PASSWORD 環境變數未設定。請在 .env.local 加上後重啟 dev server。
        </p>
      )}
      <form action={loginAction} className="mt-6 max-w-sm space-y-3">
        <input type="hidden" name="next" value={next || "/admin/candidates"} />
        <input
          type="password"
          name="password"
          required
          placeholder="密碼"
          className="w-full rounded-md border border-rule bg-surface px-3 py-2 text-ink"
        />
        <button
          type="submit"
          className="rounded-md border border-rule bg-surfaceHi px-4 py-2 text-sm hover:border-ink"
        >
          登入
        </button>
      </form>
    </div>
  );
}
