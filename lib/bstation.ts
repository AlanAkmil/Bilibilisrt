// Core helpers for talking to the Bstation / bilibili.tv intl gateway.

export type SubtitleTrack = {
  lang: string;
  lang_key: string;
  url: string;
};

export type ResolvedVideo = {
  aid?: string;
  epId?: string;
  finalUrl: string;
};

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

/**
 * Follows short links (bili.im, b23.tv, etc.) and returns the final
 * bilibili.tv URL plus the extracted aid (UGC video) or ep_id (series episode).
 */
export async function resolveVideo(inputUrl: string): Promise<ResolvedVideo> {
  const res = await fetch(inputUrl, {
    redirect: "follow",
    headers: { "User-Agent": UA },
  });
  // Drain body so the connection resolves cleanly; we only need res.url.
  await res.text().catch(() => {});
  const finalUrl = res.url || inputUrl;

  const playMatch = finalUrl.match(/\/play\/(\d+)\/(\d+)/);
  if (playMatch) {
    return { epId: playMatch[2], finalUrl };
  }

  const videoMatch = finalUrl.match(/\/video\/(\d+)/);
  if (videoMatch) {
    return { aid: videoMatch[1], finalUrl };
  }

  throw new Error(
    "Tidak bisa menemukan aid/episode_id dari link ini. Pastikan link mengarah ke halaman video bilibili.tv / bstation."
  );
}

export async function fetchSubtitleList(
  target: ResolvedVideo
): Promise<{ subtitles: SubtitleTrack[] }> {
  const params = new URLSearchParams({ platform: "web", s_locale: "en_US" });
  if (target.epId) params.set("episode_id", target.epId);
  else if (target.aid) params.set("aid", target.aid);
  else throw new Error("Missing aid/episode_id");

  const url = `https://api.bilibili.tv/intl/gateway/web/v2/subtitle?${params.toString()}`;
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`Gagal mengambil daftar subtitle (HTTP ${res.status})`);
  }
  const json = await res.json();
  if (json.code && json.code !== 0) {
    throw new Error(json.message || "Bstation API menolak permintaan (mungkin video region-locked).");
  }
  const subtitles: SubtitleTrack[] = (json?.data?.subtitles ?? []).map((s: any) => ({
    lang: s.lang ?? s.lang_key ?? "unknown",
    lang_key: s.lang_key ?? s.key ?? "unknown",
    url: s.url,
  }));
  return { subtitles };
}

function pad(n: number, len: number): string {
  return n.toString().padStart(len, "0");
}

function toSrtTimecode(totalSeconds: number): string {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = Math.floor(totalSeconds % 60);
  const ms = Math.round((totalSeconds - Math.floor(totalSeconds)) * 1000);
  return `${pad(h, 2)}:${pad(m, 2)}:${pad(s, 2)},${pad(ms, 3)}`;
}

/**
 * Downloads a subtitle track's JSON body and converts it to .srt text.
 */
export async function subtitleTrackToSrt(trackUrl: string): Promise<string> {
  const res = await fetch(trackUrl, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    throw new Error(`Gagal mengunduh file subtitle (HTTP ${res.status})`);
  }
  const json = await res.json();
  const body: Array<{ from: number; to: number; content: string }> = json?.body ?? [];
  if (!body.length) throw new Error("File subtitle kosong.");

  return body
    .map((line, i) => {
      const start = toSrtTimecode(line.from);
      const end = toSrtTimecode(line.to);
      return `${i + 1}\n${start} --> ${end}\n${line.content}\n`;
    })
    .join("\n");
}
