import Image from "next/image";
import { wedding } from "@/lib/wedding-config";

export function Footer() {
  return (
    <footer className="relative min-h-[78svh] overflow-hidden">
      <Image src="/images/gambar11.jpg" alt="Anisa dan Maulana" fill sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,16,.80)_0%,rgba(19,20,16,.16)_35%,rgba(19,20,16,.76))]" />
      <div className="page-shell relative z-10 flex min-h-[78svh] flex-col items-center justify-end pb-28 text-center">
        <p className="eyebrow text-[#e9c176]">Sampai jumpa di hari bahagia</p>
        <h2 className="font-display mt-5 text-6xl leading-[.9] md:text-8xl">Anisa <span className="italic text-[#c5a059]">&</span> Maulana</h2>
        <p className="font-label mt-6 text-xs uppercase tracking-[.22em] text-white/60">{wedding.dateLabel}</p>
        <p className="mt-10 max-w-lg italic text-[#d1c5b4]">“Dan di antara tanda-tanda kebesaran-Nya, Dia menciptakan pasangan-pasangan untukmu agar kamu cenderung dan merasa tenteram kepadanya.”</p>
        <div className="mt-8 flex items-center gap-4" aria-label="Tagar pernikahan">
          <span className="h-px w-8 bg-[#c5a059]/60" />
          <p className="font-display text-xl italic tracking-wide text-[#e9c176] md:text-2xl">#roMAnSAsatuhati</p>
          <span className="h-px w-8 bg-[#c5a059]/60" />
        </div>
      </div>
    </footer>
  );
}
