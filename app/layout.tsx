import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bili SRT — Bstation Subtitle Downloader",
  description: "Download subtitle .srt dari bilibili.tv / bstation, termasuk short link bili.im",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
