import Image from "next/image";
import { ChevronDown } from "lucide-react";
import { wedding } from "@/lib/wedding-config";

export function Hero() {
  return (
    <section id="home" className="noise relative min-h-[100svh] overflow-hidden">
      <Image src="/images/gambar1.jpg" alt="Potret Anisa dan Maulana" fill priority sizes="100vw" className="object-cover object-[50%_52%] md:object-[50%_47%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,20,16,.68),rgba(19,20,16,.08)_65%),linear-gradient(0deg,rgba(19,20,16,.88)_0%,transparent_50%)]" />
      <div className="page-shell relative z-10 flex min-h-[100svh] flex-col justify-end pb-20 pt-28 md:justify-center md:pb-0">
        <p className="eyebrow mb-6 text-[#e9c176]">{wedding.dateLabel}</p>
        <h1 className="font-display max-w-3xl text-[clamp(4rem,11vw,9.25rem)] leading-[.78] tracking-[-.06em]">Anisa <span className="italic text-[#c5a059]">&</span><br />Maulana</h1>
        <div className="mt-8 flex max-w-md items-start gap-4 border-l border-[#c5a059] pl-5 text-base leading-7 text-[#d1c5b4]">
          <p>Satu hari, dua hati, dan perjalanan kecil seumur hidup. Mari rayakan awal cerita ini bersama kami.</p>
        </div>
      </div>
      <a href="#couple" aria-label="Lanjut ke profil mempelai" className="absolute bottom-7 right-6 z-10 flex items-center gap-3 font-label text-[10px] uppercase tracking-[.2em] text-white/55 md:right-16">Geser untuk melihat <ChevronDown className="animate-bounce text-[#c5a059]" size={18} /></a>
    </section>
  );
}
