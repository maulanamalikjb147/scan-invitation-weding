"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MailOpen } from "lucide-react";
import { wedding } from "@/lib/wedding-config";

export function Cover({ open, onOpen, guestName }: { open: boolean; onOpen: () => void; guestName: string }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-[#131410]" exit={{ opacity: 0 }} transition={{ duration: .85 }}>
          <motion.div className="noise relative h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Image src="/images/gambar1.jpg" alt="Anisa dan Maulana" fill priority sizes="100vw" className="object-cover object-[50%_54%] md:object-[50%_48%]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,16,.38),rgba(19,20,16,.08)_35%,rgba(19,20,16,.84))]" />
                <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 py-7 text-center md:py-12">
                  <div className="eyebrow flex items-center gap-3 text-[#e9c176]"><span className="h-px w-8 bg-[#c5a059]" />Pernikahan<span className="h-px w-8 bg-[#c5a059]" /></div>
                  <div className="mb-2">
                    <motion.h1 className="font-display text-[clamp(3.05rem,12vw,8rem)] leading-[.82]" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }}>
                      Anisa<br /><span className="text-[#c5a059]">&</span> Maulana
                    </motion.h1>
                    <p className="font-label mt-6 text-[10px] uppercase tracking-[.2em] text-[#d1c5b4] md:text-xs md:tracking-[.28em]">{wedding.dateLabel}</p>
                  </div>
                  <div>
                    <p className="text-sm italic text-white/70">Kepada Bapak/Ibu/Saudara/i</p>
                    <p className="font-display mb-4 mt-1 text-lg font-medium text-[#e9c176] md:text-xl">{guestName}</p>
                    <button onClick={onOpen} className="font-label inline-flex min-h-12 items-center gap-3 rounded-[4px] bg-[#c5a059] px-6 text-[11px] font-semibold uppercase tracking-[.13em] text-[#131410] transition hover:bg-[#e9c176] focus:outline-none focus:ring-2 focus:ring-[#e9c176] focus:ring-offset-2 focus:ring-offset-[#131410] md:px-7 md:text-xs md:tracking-[.16em]">
                      <MailOpen size={17} /> Buka Undangan
                    </button>
                  </div>
                </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
