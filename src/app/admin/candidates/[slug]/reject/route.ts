import { NextResponse } from "next/server";
import { deleteCandidate, recordRejection } from "@/lib/candidates";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (process.env.NODE_ENV === "production") {
    return new NextResponse("disabled in production", { status: 404 });
  }
  const { slug } = await params;
  recordRejection(slug);
  deleteCandidate(slug);
  return NextResponse.json({ ok: true });
}
