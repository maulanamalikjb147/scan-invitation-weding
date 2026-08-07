"use client";

import { CalendarDays, Gift, Images, MessageCircle, Music2, Pause } from "lucide-react";

const nav = [{ href: "#event", label: "Acara", icon: CalendarDays }, { href: "#gallery", label: "Galeri", icon: Images }, { href: "#rsvp", label: "RSVP", icon: MessageCircle }, { href: "#gift", label: "Kado", icon: Gift }];

export function FloatingControls({ playing, onMusic }: { playing: boolean; onMusic: () => void }) {
  return (
    <>
      <nav aria-label="Navigasi undangan" className="font-label fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 border border-white/10 bg-[#161712]/90 p-1.5 shadow-2xl backdrop-blur-xl md:bottom-7">
        {nav.map(({ href, label, icon: Icon }) => <a key={href} href={href} className="flex min-w-14 flex-col items-center gap-1 px-3 py-2 text-[8px] uppercase tracking-[.1em] text-white/55 transition hover:bg-white/[.05] hover:text-[#e9c176]"><Icon size={16} />{label}</a>)}
      </nav>
      <button onClick={onMusic} aria-label={playing ? "Jeda musik" : "Putar musik"} className="fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-[4px] border border-white/10 bg-[#161712]/90 text-[#e9c176] backdrop-blur-xl md:right-7 md:top-7">
        {playing ? <span className="flex h-4 items-end gap-[2px]">{[.1,.3,.5,.2].map((delay, index) => <i key={index} className="music-bar block h-4 w-[2px] bg-[#e9c176]" style={{ animationDelay: `${delay}s` }} />)}</span> : <Music2 size={17} />}
        <span className="sr-only">{playing ? <Pause /> : "Putar"}</span>
      </button>
    </>
  );
}
