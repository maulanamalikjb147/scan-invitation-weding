"use client";

import { useEffect, useState } from "react";
import { MapPin, Navigation } from "lucide-react";
import { wedding } from "@/lib/wedding-config";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

const eventDate = new Date(wedding.date);
const eventDay = new Intl.DateTimeFormat("id-ID", { day: "2-digit", timeZone: "Asia/Jakarta" }).format(eventDate);
const eventWeekday = new Intl.DateTimeFormat("id-ID", { weekday: "long", timeZone: "Asia/Jakarta" }).format(eventDate);
const eventMonthYear = new Intl.DateTimeFormat("id-ID", { month: "long", year: "numeric", timeZone: "Asia/Jakarta" }).format(eventDate);

function getTimeLeft() {
  // wedding.date includes +07:00, so the target is fixed to WIB even on Netlify.
  const distance = Math.max(0, new Date(wedding.date).getTime() - Date.now());
  return {
    Hari: Math.floor(distance / 86400000),
    Jam: Math.floor((distance / 3600000) % 24),
    Menit: Math.floor((distance / 60000) % 60),
    Detik: Math.floor((distance / 1000) % 60),
  };
}

type Countdown = ReturnType<typeof getTimeLeft>;
const countdownLabels: Array<keyof Countdown> = ["Hari", "Jam", "Menit", "Detik"];

export function EventSection() {
  // The server and the browser must render the same initial value. Calculating
  // Date.now() during render can cross a second boundary and cause hydration
  // mismatches, so the live countdown starts only after hydration.
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  useEffect(() => {
    setCountdown(getTimeLeft());
    const timer = setInterval(() => setCountdown(getTimeLeft()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section id="event" className="section-rule relative overflow-hidden py-18 md:py-36">
      <SectionBackdrop src="/images/gambar4.jpg" position="object-[50%_52%]" strength="opacity-[.62]" />
      <div className="page-shell relative z-10">
        <Reveal className="mx-auto max-w-2xl text-center"><p className="eyebrow text-[#c5a059]">Save the date</p></Reveal>
        <Reveal className="mx-auto mt-12 grid max-w-4xl grid-cols-4 border-y border-white/10 py-7" delay={.1}>
          {countdownLabels.map((label) => {
            const value = countdown?.[label];
            return <div key={label} className="text-center"><p className="font-display text-3xl tabular-nums text-[#e9c176] md:text-6xl">{value === undefined ? "--" : String(value).padStart(2, "0")}</p><p className="eyebrow mt-2 text-[9px] text-white/45 md:text-xs">{label}</p></div>;
          })}
        </Reveal>
        <Reveal className="mx-auto mt-14 max-w-4xl rounded-[8px] border border-white/10 bg-[#f4f1ea]/95 p-5 text-center text-[#251d18] shadow-2xl md:p-8" delay={.16}>
          <p className="font-display text-xl capitalize text-[#6f5a31] md:text-2xl">{eventWeekday}</p>
          <div className="mt-4 grid items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-6">
            <div className="border-y border-[#251d18]/55 py-3 md:text-right">
              <p className="font-label text-[11px] font-semibold uppercase tracking-[.2em] text-[#251d18]/80">{wedding.events[0]?.type ?? "Akad Nikah & Resepsi"}</p>
              <p className="font-display mt-1 text-lg text-[#6f5a31]">{wedding.events[0]?.time}</p>
            </div>
            <div className="mx-auto flex size-28 items-center justify-center rounded-full bg-[#9b7543] font-display text-6xl leading-none text-white shadow-lg md:size-32 md:text-7xl">{eventDay}</div>
            <div className="border-y border-[#251d18]/55 py-3 md:text-left">
              <p className="font-label text-[11px] font-semibold uppercase tracking-[.2em] text-[#251d18]/80">Lokasi</p>
              <p className="font-display mt-1 text-lg text-[#6f5a31]">{wedding.events[0]?.venue}</p>
            </div>
          </div>
          <p className="font-display mt-5 text-xl capitalize text-[#6f5a31] md:text-2xl">{eventMonthYear}</p>
          <div className="mx-auto mt-7 flex max-w-xl justify-center gap-3 text-sm leading-6 text-[#4b4036]"><MapPin size={18} className="mt-1 shrink-0 text-[#9b7543]" /><p>{wedding.events[0]?.venue}<br />{wedding.events[0]?.address}</p></div>
        </Reveal>
        <Reveal className="mt-8 flex justify-center"><a href={wedding.mapsUrl} target="_blank" rel="noreferrer" className="font-label inline-flex min-h-12 items-center gap-3 rounded-[4px] border border-[#c5a059] px-7 text-xs font-semibold uppercase tracking-[.16em] text-[#e9c176] transition hover:bg-[#c5a059] hover:text-[#131410]"><Navigation size={16} /> Lihat lokasi</a></Reveal>
      </div>
    </section>
  );
}
