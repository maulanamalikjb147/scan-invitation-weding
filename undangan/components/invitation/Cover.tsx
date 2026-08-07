"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MailOpen } from "lucide-react";
import { useEffect, useState } from "react";
import { wedding } from "@/lib/wedding-config";

export function Cover({ open, onOpen, guestName }: { open: boolean; onOpen: () => void; guestName: string }) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const timeout = setTimeout(() => setLoading(false), 1100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 bg-[#131410]" exit={{ opacity: 0 }} transition={{ duration: .85 }}>
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div key="loader" className="relative flex h-full items-center justify-center overflow-hidden" exit={{ opacity: 0 }}>
                <Image src="/images/gambar6.jpg" alt="" fill priority sizes="100vw" className="scale-105 object-cover object-center opacity-[.55] blur-[1px]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(19,20,16,.38),rgba(19,20,16,.86))]" />
                <div className="relative text-center">
                  <p className="font-display text-4xl italic text-[#e4e3db]">A<span className="text-[#c5a059]">&</span>M</p>
                  <div className="mx-auto mt-6 h-px w-24 overflow-hidden bg-white/10">
                    <motion.div className="h-full bg-[#c5a059]" initial={{ x: "-100%" }} animate={{ x: "100%" }} transition={{ duration: 1, repeat: Infinity }} />
                  </div>
                  <p className="eyebrow mt-4 text-white/55">Menyiapkan cerita kami</p>
                </div>
              </motion.div>
            ) : (
              <motion.div key="cover" className="noise relative h-full overflow-hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Image src="/images/gambar1.jpg" alt="Anisa dan Maulana" fill priority sizes="100vw" className="object-cover object-[50%_54%] md:object-[50%_48%]" />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,16,.38),rgba(19,20,16,.08)_35%,rgba(19,20,16,.84))]" />
                <div className="relative z-10 flex h-full flex-col items-center justify-between px-5 py-8 text-center md:py-12">
                  <div className="eyebrow flex items-center gap-3 text-[#e9c176]"><span className="h-px w-8 bg-[#c5a059]" />Pernikahan<span className="h-px w-8 bg-[#c5a059]" /></div>
                  <div className="mb-2">
                    <motion.h1 className="font-display text-[clamp(3.6rem,13vw,8rem)] leading-[.78] tracking-[-.055em]" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .9 }}>
                      Anisa<br /><span className="text-[#c5a059]">&</span> Maulana
                    </motion.h1>
                    <p className="font-label mt-7 text-xs uppercase tracking-[.28em] text-[#d1c5b4]">{wedding.dateLabel}</p>
                  </div>
                  <div>
                    <p className="text-sm italic text-white/70">Kepada Bapak/Ibu/Saudara/i</p>
                    <p className="font-display mb-4 mt-1 text-xl font-medium text-[#e9c176]">{guestName}</p>
                    <button onClick={onOpen} className="font-label inline-flex min-h-12 items-center gap-3 rounded-[4px] bg-[#c5a059] px-7 text-xs font-semibold uppercase tracking-[.16em] text-[#131410] transition hover:bg-[#e9c176] focus:outline-none focus:ring-2 focus:ring-[#e9c176] focus:ring-offset-2 focus:ring-offset-[#131410]">
                      <MailOpen size={17} /> Buka Undangan
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
