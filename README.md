# Bili SRT

Downloader subtitle (.srt) untuk video bilibili.tv / Bstation — support short link (bili.im, b23.tv, dll) karena server ikut redirect-nya dulu sebelum manggil API.

## Cara jalan

```bash
npm install
npm run dev
```

## Cara kerja

1. `app/api/subtitle/list` — resolve short link → dapat `aid` (video UGC) atau `ep_id` (episode series) → panggil `api.bilibili.tv/intl/gateway/web/v2/subtitle` → balikin daftar bahasa yang tersedia.
2. `app/api/subtitle/download` — ambil track yang dipilih, convert JSON timeline Bstation ke format `.srt`, kirim sebagai file attachment.

Semua logic inti ada di `lib/bstation.ts`.

## Catatan

- Kalau video tidak punya subtitle sama sekali, API akan balikin error 404 dari Bstation.
- Video yang region-locked / butuh login bisa gagal diambil karena request di sini tanpa cookie/session.
- Deploy ke Vercel seperti biasa, tidak butuh env var apapun.
