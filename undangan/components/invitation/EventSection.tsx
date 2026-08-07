"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Clock3, MapPin, Navigation } from "lucide-react";
import { wedding } from "@/lib/wedding-config";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

function getTimeLeft() {
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
        <Reveal className="mx-auto max-w-2xl text-center"><p className="eyebrow text-[#c5a059]">Simpan tanggalnya</p><h2 className="font-display mt-4 text-4xl md:text-7xl">Menuju hari <span className="italic text-[#c5a059]">bahagia.</span></h2><p className="mt-5 leading-7 text-[#d1c5b4]">Kami menantikan kehadiran Bapak/Ibu/Saudara/i untuk menjadi saksi dan memberikan doa restu pada rangkaian acara kami.</p></Reveal>
        <Reveal className="mx-auto mt-12 grid max-w-4xl grid-cols-4 border-y border-white/10 py-7" delay={.1}>
          {countdownLabels.map((label) => {
            const value = countdown?.[label];
            return <div key={label} className="text-center"><p className="font-display text-3xl tabular-nums text-[#e9c176] md:text-6xl">{value === undefined ? "--" : String(value).padStart(2, "0")}</p><p className="eyebrow mt-2 text-[9px] text-white/45 md:text-xs">{label}</p></div>;
          })}
        </Reveal>
        <div className="mt-14 grid gap-4 lg:grid-cols-2">
          {wedding.events.map((event, index) => (
            <Reveal key={event.type} delay={index * .08} className="rounded-[8px] border border-white/10 bg-[#1b1c18] p-6 md:p-8">
              <div className="flex items-center justify-between"><span className="eyebrow text-[#c5a059]">0{index + 1} / Rangkaian acara</span><CalendarDays size={20} className="text-white/35" /></div>
              <h3 className="font-display mt-8 text-4xl">{event.type}</h3>
              <div className="mt-7 space-y-4 text-[#d1c5b4]"><p className="flex gap-3"><CalendarDays size={18} className="mt-1 shrink-0 text-[#c5a059]" />{wedding.dateLabel}</p><p className="flex gap-3"><Clock3 size={18} className="mt-1 shrink-0 text-[#c5a059]" />{event.time}</p><p className="flex gap-3"><MapPin size={18} className="mt-1 shrink-0 text-[#c5a059]" />{event.venue}<br />{event.address}</p></div>
            </Reveal>
          ))}
        </div>
        <Reveal className="mt-8 flex justify-center"><a href={wedding.mapsUrl} target="_blank" rel="noreferrer" className="font-label inline-flex min-h-12 items-center gap-3 rounded-[4px] border border-[#c5a059] px-7 text-xs font-semibold uppercase tracking-[.16em] text-[#e9c176] transition hover:bg-[#c5a059] hover:text-[#131410]"><Navigation size={16} /> Lihat lokasi</a></Reveal>
      </div>
    </section>
  );
}
