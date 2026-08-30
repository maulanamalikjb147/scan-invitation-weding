"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { defaultWeddingContent, getWeddingSection, type WeddingContent } from "@/lib/wedding-content";
import { Reveal } from "./Reveal";

export function GallerySection({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  const section = getWeddingSection(content, "gallery");
  const gallery = content.gallery;
  const [active, setActive] = useState<number | null>(null);
  const [selected, setSelected] = useState(0);
  const selectedPhoto = gallery[selected] || gallery[0];
  const change = useCallback((direction: number) => {
    if (!gallery.length) return;
    setSelected((current) => (current + direction + gallery.length) % gallery.length);
  }, [gallery.length]);
  const changeDialog = useCallback((direction: number) => {
    setActive((current) => current === null ? 0 : (current + direction + gallery.length) % gallery.length);
  }, [gallery.length]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setActive(null);
      if (event.key === "ArrowRight") {
        if (active === null) change(1);
        else changeDialog(1);
      }
      if (event.key === "ArrowLeft") {
        if (active === null) change(-1);
        else changeDialog(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, change, changeDialog]);

  return (
    <section id="gallery" className="section-rule relative min-h-[100svh] overflow-hidden bg-[#111310] py-14 md:py-20">
      <Image src={section.background || selectedPhoto?.src || content.images.galleryBackdrop} alt="" fill sizes="100vw" className="scale-110 object-cover object-center opacity-20 blur-lg" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,7,6,.92)_0%,rgba(17,19,16,.70)_22%,rgba(17,19,16,.78)_100%)]" />
      <div className="relative z-10">
        <Reveal className="text-center">
          <h2 className="font-display break-words leading-none text-white" style={{ fontSize: section.titleFontSize }}>{section.title}</h2>
          {section.body && <p className="mx-auto mt-4 max-w-xl leading-7 text-white/70" style={{ fontSize: section.bodyFontSize }}>{section.body}</p>}
        </Reveal>

        <Reveal delay={.08} className="relative mt-11">
          <div className="flex items-center gap-3 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:gap-4 md:px-12">
            {gallery.map((photo, index) => (
              <button
                key={photo.src}
                type="button"
                onClick={() => setSelected(index)}
                aria-label={`Pilih foto ${index + 1}`}
                aria-pressed={selected === index}
                className="relative h-20 w-28 shrink-0 overflow-hidden rounded-[8px] border-4 border-transparent bg-white/10 transition data-[active=true]:border-white md:h-24 md:w-36"
                data-active={selected === index}
              >
                <Image src={photo.src} alt="" fill sizes="144px" className="object-cover" />
                <span className="absolute inset-0 bg-black/10" />
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Foto sebelumnya"
            onClick={() => change(-1)}
            className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/28 text-white backdrop-blur transition hover:bg-white/40 md:flex"
          >
            <ChevronLeft size={32} />
          </button>
          <button
            type="button"
            aria-label="Foto berikutnya"
            onClick={() => change(1)}
            className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/28 text-white backdrop-blur transition hover:bg-white/40 md:size-14"
          >
            <ChevronRight size={34} />
          </button>
        </Reveal>

        <Reveal delay={.14} className="mx-4 mt-5 max-w-[1120px] md:mx-auto md:mt-7">
          <button
            type="button"
            onClick={() => setActive(selected)}
            className="relative block h-[72svh] min-h-[520px] w-full overflow-hidden rounded-[8px] bg-[#20231f] text-left shadow-2xl shadow-black/35 md:h-[78svh]"
            aria-label={`Buka ${selectedPhoto?.alt || "foto galeri"}`}
          >
            {selectedPhoto && <Image src={selectedPhoto.src} alt={selectedPhoto.alt} fill priority={selected < 2} sizes="(max-width: 768px) 100vw, 1120px" className="object-cover object-center" />}
            <span className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/45 to-transparent" />
            <span className="font-label absolute bottom-5 left-5 text-[11px] font-semibold uppercase tracking-[.22em] text-white/70">0{selected + 1} / {gallery.length}</span>
          </button>
        </Reveal>
      </div>
      <AnimatePresence>
        {active !== null && (
          <motion.div role="dialog" aria-modal="true" aria-label="Galeri foto" className="fixed inset-0 z-[70] flex items-center justify-center bg-[#080906]/95 p-4 backdrop-blur-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setActive(null)}>
            <button aria-label="Tutup galeri" onClick={() => setActive(null)} className="absolute right-5 top-5 z-10 border border-white/15 bg-[#131410] p-3 text-white hover:text-[#e9c176]"><X /></button>
            <button aria-label="Foto sebelumnya" onClick={(event) => { event.stopPropagation(); changeDialog(-1); }} className="absolute left-3 z-10 border border-white/15 bg-[#131410]/80 p-3 text-white md:left-8"><ChevronLeft /></button>
            <motion.div key={active} className="relative h-[82vh] w-[min(90vw,680px)]" initial={{ opacity: 0, scale: .97 }} animate={{ opacity: 1, scale: 1 }} onClick={(event) => event.stopPropagation()}><Image src={gallery[active].src} alt={gallery[active].alt} fill sizes="90vw" className="object-contain" /></motion.div>
            <button aria-label="Foto berikutnya" onClick={(event) => { event.stopPropagation(); changeDialog(1); }} className="absolute right-3 z-10 border border-white/15 bg-[#131410]/80 p-3 text-white md:right-8"><ChevronRight /></button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
