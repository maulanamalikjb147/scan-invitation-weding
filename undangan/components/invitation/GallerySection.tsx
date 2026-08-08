"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { gallery } from "@/lib/wedding-config";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

export function GallerySection() {
  const [active, setActive] = useState<number | null>(null);
  const change = (direction: number) => setActive((current) => current === null ? 0 : (current + direction + gallery.length) % gallery.length);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") change(1);
      if (event.key === "ArrowLeft") change(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <section id="gallery" className="section-rule relative overflow-hidden py-18 md:py-36">
      <SectionBackdrop src="/images/gambar7.jpg" position="object-[50%_42%]" strength="opacity-[.50]" />
      <div className="page-shell relative z-10">
      <Reveal><h2 className="font-display text-3xl md:text-5xl">Our moments</h2></Reveal>
      <div className="mt-12 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {gallery.map((photo, index) => (
          <Reveal key={photo.src} delay={(index % 4) * .04} className={index === 0 || index === 7 || index === 12 ? "col-span-2 row-span-2" : ""}>
            <button onClick={() => setActive(index)} aria-label={`Buka foto ${index + 1}`} className={`group relative block w-full overflow-hidden rounded-[4px] bg-[#1b1c18] ${index === 0 || index === 7 || index === 12 ? "aspect-[4/5]" : "aspect-[3/4]"}`}>
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 768px) 50vw, 25vw" className="object-cover transition duration-700 group-hover:scale-105" />
              <span className="font-label absolute bottom-3 left-3 border border-white/15 bg-[#131410]/70 px-2 py-1 text-[9px] uppercase tracking-[.16em] opacity-0 backdrop-blur transition group-hover:opacity-100">Lihat 0{index + 1}</span>
            </button>
          </Reveal>
        ))}
      </div>
      <AnimatePresence>
        {active !== null && (
          <motion.div role="dialog" aria-modal="true" aria-label="Galeri foto" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#080906]/95 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <button aria-label="Tutup galeri" onClick={() => setActive(null)} className="absolute right-5 top-5 z-10 border border-white/15 bg-[#131410] p-3 text-white hover:text-[#e9c176]"><X /></button>
            <button aria-label="Foto sebelumnya" onClick={(event) => { event.stopPropagation(); change(-1); }} className="absolute left-3 z-10 border border-white/15 bg-[#131410]/80 p-3 text-white md:left-8"><ChevronLeft /></button>
            <motion.div key={active} className="relative h-[82vh] w-[min(90vw,680px)]" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} onClick={(event) => event.stopPropagation()}><Image src={gallery[active].src} alt={gallery[active].alt} fill sizes="90vw" className="object-contain" /></motion.div>
            <button aria-label="Foto berikutnya" onClick={(event) => { event.stopPropagation(); change(1); }} className="absolute right-3 z-10 border border-white/15 bg-[#131410]/80 p-3 text-white md:right-8"><ChevronRight /></button>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </section>
  );
}
