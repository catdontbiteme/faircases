import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// admin 專屬中介層：
// 1. 生產環境（Vercel）— 全部 /admin/* 直接 404，避免唯讀檔案系統造成 approve 寫檔失敗。
// 2. 本地開發 — /admin/* 都需要 cookie `admin_auth=<ADMIN_PASSWORD>` 才能進入，
//    /admin/login 不檢查（要登入才有 cookie）。

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  // 生產環境一律 404，admin 只在 local 用
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  // 登入頁不檢查 cookie
  if (pathname === "/admin/login") return NextResponse.next();

  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) {
    return new NextResponse(
      "ADMIN_PASSWORD env var not set. Add it to .env.local.",
      { status: 500 }
    );
  }

  const cookie = req.cookies.get("admin_auth")?.value;
  if (cookie !== expected) {
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
