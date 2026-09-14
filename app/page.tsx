"use client";

import { useState } from "react";

type SubtitleTrack = {
  lang: string;
  lang_key: string;
  url: string;
};

type ListResponse = {
  finalUrl: string;
  aid: string | null;
  epId: string | null;
  subtitles: SubtitleTrack[];
};

export default function Home() {
  const [link, setLink] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ListResponse | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!link.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`/api/subtitle/list?url=${encodeURIComponent(link.trim())}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mengambil subtitle.");
      setResult(data);
    } catch (err: any) {
      setError(err.message ?? "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  }

  function downloadUrl(langKey: string) {
    return `/api/subtitle/download?url=${encodeURIComponent(link.trim())}&lang_key=${encodeURIComponent(
      langKey
    )}`;
  }

  return (
    <main>
      <h1>Bili SRT</h1>
      <p className="subtitle">
        Tempel link bilibili.tv / bstation (termasuk short link seperti bili.im atau b23.tv), lalu
        unduh subtitle-nya sebagai .srt.
      </p>

      <div className="card">
        <form onSubmit={handleSubmit} className="row">
          <input
            type="text"
            placeholder="https://bili.im/xxxxxxx"
            value={link}
            onChange={(e) => setLink(e.target.value)}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Mencari..." : "Cari Subtitle"}
          </button>
        </form>

        {error && <div className="error">{error}</div>}

        {result && (
          <>
            <div className="tracks">
              {result.subtitles.map((s) => (
                <div className="track" key={s.lang_key}>
                  <span>{s.lang}</span>
                  <a href={downloadUrl(s.lang_key)}>Download .srt</a>
                </div>
              ))}
            </div>
            <div className="meta">{result.finalUrl}</div>
          </>
        )}
      </div>
    </main>
  );
}
