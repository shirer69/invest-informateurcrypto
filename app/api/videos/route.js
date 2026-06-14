import { NextResponse } from "next/server";
import { YOUTUBE_CHANNEL_ID } from "@/lib/site";

export const runtime = "nodejs";
export const revalidate = 300; // cache 5 min (nouvelles vidéos visibles vite)

function decode(s = "") {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'");
}

export async function GET() {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      { next: { revalidate: 300 } }
    );
    if (!res.ok) return NextResponse.json({ ok: false, videos: [] });
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);
    const videos = entries
      .map((e) => {
        const id = (e.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1];
        const title = (e.match(/<media:title>([\s\S]*?)<\/media:title>/) ||
          e.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
        const published = (e.match(/<published>(.*?)<\/published>/) || [])[1];
        return id ? { id, title: decode(title || ""), published } : null;
      })
      .filter(Boolean)
      .slice(0, 9);
    return NextResponse.json({ ok: true, videos });
  } catch {
    return NextResponse.json({ ok: false, videos: [] });
  }
}
