import { NextRequest, NextResponse } from "next/server";
import { resolveVideo, fetchSubtitleList, subtitleTrackToSrt } from "@/lib/bstation";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  const langKey = req.nextUrl.searchParams.get("lang_key");

  if (!url || !langKey) {
    return NextResponse.json(
      { error: "Parameter 'url' dan 'lang_key' wajib diisi." },
      { status: 400 }
    );
  }

  try {
    const resolved = await resolveVideo(url);
    const { subtitles } = await fetchSubtitleList(resolved);
    const track = subtitles.find((s) => s.lang_key === langKey);

    if (!track) {
      return NextResponse.json({ error: "Track subtitle tidak ditemukan." }, { status: 404 });
    }

    const srt = await subtitleTrackToSrt(track.url);
    const filename = `${resolved.aid ?? resolved.epId ?? "subtitle"}-${langKey}.srt`;

    return new NextResponse(srt, {
      status: 200,
      headers: {
        "Content-Type": "application/x-subrip; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message ?? "Terjadi kesalahan tak terduga." },
      { status: 500 }
    );
  }
}
