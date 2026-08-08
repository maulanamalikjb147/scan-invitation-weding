import Image from "next/image";
import { ChevronDown } from "lucide-react";

export function Hero() {
  return (
    <section id="home" className="noise relative min-h-[100svh] overflow-hidden">
      <Image src="/images/gambar1.jpg" alt="Potret Anisa dan Maulana" fill priority sizes="100vw" className="object-cover object-[50%_52%] md:object-[50%_47%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,20,16,.68),rgba(19,20,16,.08)_65%),linear-gradient(0deg,rgba(19,20,16,.88)_0%,transparent_50%)]" />
      <div className="page-shell relative z-10 flex min-h-[100svh] flex-col justify-end pb-24 pt-24 md:justify-center md:pb-0">
        <h1 className="font-display max-w-4xl text-[clamp(3.1rem,9.5vw,8.5rem)] leading-[.9]">The Wedding of Anisa and Maulana</h1>
        <div className="mt-7 flex items-center gap-4" aria-label="Tagar pernikahan">
          <span className="h-px w-10 bg-[#c5a059]/70" />
          <p className="font-display text-2xl italic tracking-wide text-[#e9c176] md:text-3xl">#AnisaMaulana</p>
        </div>
      </div>
      <a href="#couple" aria-label="Lanjut ke profil mempelai" className="absolute bottom-7 right-5 z-10 flex items-center gap-2 font-label text-[9px] uppercase tracking-[.16em] text-white/55 md:right-16 md:text-[10px] md:tracking-[.2em]">Geser <ChevronDown className="animate-bounce text-[#c5a059]" size={18} /></a>
    </section>
  );
}
