"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { defaultWeddingContent, getWeddingSection, type WeddingContent } from "@/lib/wedding-content";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

function getTimeLeft(date: string) {
  // wedding.date includes +07:00, so the target is fixed to WIB even on Netlify.
  const distance = Math.max(0, new Date(date).getTime() - Date.now());
  return {
    Hari: Math.floor(distance / 86400000),
    Jam: Math.floor((distance / 3600000) % 24),
    Menit: Math.floor((distance / 60000) % 60),
    Detik: Math.floor((distance / 1000) % 60),
  };
}

type Countdown = ReturnType<typeof getTimeLeft>;
const countdownLabels: Array<keyof Countdown> = ["Hari", "Jam", "Menit", "Detik"];

export function EventSection({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  const section = getWeddingSection(content, "event");
  const eventDate = new Date(content.date);
  const eventDay = new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: "Asia/Jakarta" }).format(eventDate);
  const eventWeekday = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "Asia/Jakarta" }).format(eventDate);
  const eventMonthYear = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(eventDate);
  const event = content.events[0] || defaultWeddingContent.events[0];
  // The server and the browser must render the same initial value. Calculating
  // Date.now() during render can cross a second boundary and cause hydration
  // mismatches, so the live countdown starts only after hydration.
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  useEffect(() => {
    let active = true;
    const updateCountdown = () => {
      if (active) setCountdown(getTimeLeft(content.date));
    };
    const firstTick = window.setTimeout(updateCountdown, 0);
    const timer = window.setInterval(updateCountdown, 1000);
    return () => {
      active = false;
      window.clearTimeout(firstTick);
      window.clearInterval(timer);
    };
  }, [content.date]);

  return (
    <section id="event" className="section-rule relative min-h-[100svh] overflow-hidden">
      <SectionBackdrop src={section.background || content.images.eventBackdrop} position="object-[50%_52%]" strength="opacity-100" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,8,.86)_0%,rgba(8,9,8,.30)_40%,rgba(8,9,8,.94)_100%)]" />
      <div className="page-shell relative z-10 flex min-h-[100svh] flex-col justify-end py-24 text-center">
        <Reveal className="mx-auto max-w-2xl"><p className="font-display break-words text-[#e9c176]" style={{ fontSize: section.titleFontSize }}>{section.title}</p>{section.body && <p className="mt-4 leading-7 text-white/75" style={{ fontSize: section.bodyFontSize }}>{section.body}</p>}</Reveal>
        <Reveal className="mx-auto mt-10 grid w-full max-w-4xl grid-cols-4 border-y border-white/20 py-7" delay={.1}>
          {countdownLabels.map((label) => {
            const value = countdown?.[label];
            return <div key={label} className="text-center"><p className="font-display text-4xl tabular-nums text-white md:text-7xl">{value === undefined ? "--" : String(value).padStart(2, "0")}</p><p className="eyebrow mt-2 text-[9px] text-white/58 md:text-xs">{label}</p></div>;
          })}
        </Reveal>
        <Reveal className="mx-auto mt-12 w-full max-w-4xl text-center" delay={.16}>
          <p className="font-display text-2xl capitalize text-[#e9c176] md:text-4xl">{eventWeekday}</p>
          <div className="mt-6 grid items-center gap-5 md:grid-cols-[1fr_auto_1fr] md:gap-8">
            <div className="border-y border-white/25 py-4 md:text-right">
              <p className="font-label text-[11px] font-semibold uppercase tracking-[.2em] text-white/60">{event.type}</p>
              <p className="font-display mt-1 text-xl text-white md:text-2xl">{event.time}</p>
            </div>
            <div className="mx-auto flex size-30 items-center justify-center rounded-full border border-white/35 bg-white/12 font-display text-7xl leading-none text-white shadow-2xl backdrop-blur-sm md:size-36 md:text-8xl">{eventDay}</div>
            <div className="border-y border-white/25 py-4 md:text-left">
              <p className="font-label text-[11px] font-semibold uppercase tracking-[.2em] text-white/60">Lokasi</p>
              <p className="font-display mt-1 text-xl text-white md:text-2xl">{event.venue}</p>
            </div>
          </div>
          <p className="font-display mt-6 text-2xl capitalize text-[#e9c176] md:text-4xl">{eventMonthYear}</p>
          <div className="mx-auto mt-7 flex max-w-xl justify-center gap-3 text-sm leading-6 text-white/78"><MapPin size={18} className="mt-1 shrink-0 text-[#e9c176]" /><p>{event.venue}<br />{event.address}</p></div>
        </Reveal>
        <Reveal className="mt-8 flex justify-center"><a href={content.mapsUrl} target="_blank" rel="noreferrer" className="font-label inline-flex min-h-12 items-center gap-3 rounded-full border border-white/30 bg-white/10 px-7 text-xs font-semibold uppercase tracking-[.16em] text-white backdrop-blur transition hover:bg-white hover:text-[#131410]"><Navigation size={16} /> Lihat lokasi</a></Reveal>
      </div>
    </section>
  );
}
