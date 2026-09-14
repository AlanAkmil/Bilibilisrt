import { NextRequest, NextResponse } from "next/server";
import { resolveVideo, fetchSubtitleList } from "@/lib/bstation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Parameter 'url' wajib diisi." }, { status: 400 });
  }

  try {
    const resolved = await resolveVideo(url);
    const { subtitles } = await fetchSubtitleList(resolved);

    if (!subtitles.length) {
      return NextResponse.json(
        { error: "Video ini tidak punya subtitle di Bstation." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      finalUrl: resolved.finalUrl,
      aid: resolved.aid ?? null,
      epId: resolved.epId ?? null,
      subtitles,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Terjadi kesalahan tak terduga." },
      { status: 500 }
    );
  }
}
