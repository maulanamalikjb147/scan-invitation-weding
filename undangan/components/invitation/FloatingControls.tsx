"use client";

import { CalendarDays, Gift, Images, MessageCircle, Music2, Pause } from "lucide-react";

const nav = [{ href: "#event", label: "Acara", icon: CalendarDays }, { href: "#gallery", label: "Galeri", icon: Images }, { href: "#gift", label: "Kado", icon: Gift }, { href: "#rsvp", label: "RSVP", icon: MessageCircle }];

export function FloatingControls({ playing, onMusic }: { playing: boolean; onMusic: () => void }) {
  return (
    <>
      <nav aria-label="Navigasi undangan" className="invitation-floating-nav font-label fixed bottom-3 z-40 flex max-w-[calc(100vw-20px)] overflow-hidden rounded-[6px] border border-white/10 bg-[#161712]/90 p-1 shadow-2xl backdrop-blur-xl md:bottom-7 md:p-1.5">
        {nav.map(({ href, label, icon: Icon }) => <a key={href} href={href} className="flex min-w-[50px] flex-col items-center gap-1 px-2 py-2 text-[7px] uppercase tracking-[.08em] text-white/55 transition hover:bg-white/[.05] hover:text-[#e9c176] md:min-w-14 md:px-3 md:text-[8px] md:tracking-[.1em]"><Icon size={15} />{label}</a>)}
      </nav>
      <button onClick={onMusic} aria-label={playing ? "Jeda musik" : "Putar musik"} className="invitation-music-button fixed right-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-[4px] border border-white/10 bg-[#161712]/90 text-[#e9c176] backdrop-blur-xl md:right-7 md:top-7">
        {playing ? <span className="flex h-4 items-end gap-[2px]">{[.1,.3,.5,.2].map((delay, index) => <i key={index} className="music-bar block h-4 w-[2px] bg-[#e9c176]" style={{ animationDelay: `${delay}s` }} />)}</span> : <Music2 size={17} />}
        <span className="sr-only">{playing ? <Pause /> : "Putar"}</span>
      </button>
    </>
  );
}
