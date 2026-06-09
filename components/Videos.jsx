import { Reveal } from "./Reveal";
import { YOUTUBE_CHANNEL_ID, YOUTUBE_URL } from "@/lib/site";
import { IconArrow } from "./Icons";

function decode(s = "") {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'");
}

async function getVideos() {
  try {
    const res = await fetch(
      `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const xml = await res.text();
    const entries = xml.split("<entry>").slice(1);
    return entries
      .map((e) => {
        const id = (e.match(/<yt:videoId>(.*?)<\/yt:videoId>/) || [])[1];
        const title = (e.match(/<media:title>([\s\S]*?)<\/media:title>/) ||
          e.match(/<title>([\s\S]*?)<\/title>/) || [])[1];
        const published = (e.match(/<published>(.*?)<\/published>/) || [])[1];
        return id ? { id, title: decode(title || ""), published } : null;
      })
      .filter(Boolean)
      .slice(0, 6);
  } catch {
    return [];
  }
}

function frDate(iso) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

export default async function Videos() {
  const videos = await getVideos();
  if (!videos.length) return null;

  const [lead, ...rest] = videos;

  return (
    <section id="videos" className="relative py-24 md:py-32 border-t hairline">
      <div className="mx-auto max-w-[1180px] px-6">
        <Reveal className="flex items-end justify-between gap-6 flex-wrap">
          <div className="max-w-2xl">
            <span className="eyebrow">Analyses publiques</span>
            <h2 className="mt-5 font-display font-light text-[32px] md:text-[44px] leading-[1.08] tracking-tightest text-bone">
              Dernières vidéos
            </h2>
            <p className="mt-5 text-[16px] leading-relaxed text-mist">
              Analyses graphiques et géopolitiques hebdomadaires, en accès libre sur la
              chaîne du Club des Informateurs.
            </p>
          </div>
          <a
            href={YOUTUBE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost group inline-flex items-center gap-2 rounded-full px-6 py-3 text-[14px]"
          >
            Voir la chaîne
            <IconArrow className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </a>
        </Reveal>

        <div className="mt-14 grid lg:grid-cols-[1.4fr_1fr] gap-5">
          {/* Vidéo en avant */}
          <Reveal>
            <a
              href={`https://www.youtube.com/watch?v=${lead.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group block rounded-2xl border hairline overflow-hidden bg-ink-800/50 hover:border-gold/30 transition-colors duration-500"
            >
              <div className="relative aspect-video overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`https://i.ytimg.com/vi/${lead.id}/hqdefault.jpg`}
                  alt={lead.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/80 via-transparent to-transparent" />
                <span className="absolute inset-0 grid place-items-center">
                  <span className="grid place-items-center h-16 w-16 rounded-full bg-black/40 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 translate-x-0.5 fill-bone">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </span>
              </div>
              <div className="p-6">
                <span className="font-mono text-[10.5px] uppercase tracking-widest2 text-gold/70">
                  {frDate(lead.published)}
                </span>
                <h3 className="mt-2 font-display text-[20px] leading-snug text-bone">
                  {lead.title}
                </h3>
              </div>
            </a>
          </Reveal>

          {/* Liste */}
          <div className="flex flex-col gap-4">
            {rest.slice(0, 4).map((v) => (
              <Reveal key={v.id} delay={0.05}>
                <a
                  href={`https://www.youtube.com/watch?v=${v.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex gap-4 rounded-2xl border hairline bg-ink-800/40 p-3 hover:border-gold/30 transition-colors duration-500"
                >
                  <div className="relative w-32 shrink-0 aspect-video rounded-lg overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://i.ytimg.com/vi/${v.id}/mqdefault.jpg`}
                      alt={v.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      loading="lazy"
                    />
                  </div>
                  <div className="min-w-0 py-0.5">
                    <span className="font-mono text-[9.5px] uppercase tracking-widest2 text-gold/60">
                      {frDate(v.published)}
                    </span>
                    <h4 className="mt-1 text-[13.5px] leading-snug text-bone line-clamp-3">
                      {v.title}
                    </h4>
                  </div>
                </a>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
