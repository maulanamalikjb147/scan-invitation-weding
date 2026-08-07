import Image from "next/image";
import { wedding } from "@/lib/wedding-config";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

function PersonCard({ person, number }: { person: typeof wedding.groom | typeof wedding.bride; number: string }) {
  return (
    <Reveal className="grid gap-6 md:grid-cols-[1fr_.78fr] md:items-end">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-[8px] border border-white/10 bg-[#1b1c18]">
        <Image src={person.image} alt={person.fullName} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131410]/65 via-transparent to-transparent" />
      </div>
      <div className="pb-3">
        <p className="eyebrow mb-3 text-[#c5a059]">Mengenal mempelai {number === "01" ? "pria" : "wanita"}</p>
        <h3 className="font-display text-4xl leading-tight md:text-5xl">{person.fullName}</h3>
        <p className="mt-4 leading-7 text-[#d1c5b4]">{person.parents}</p>
      </div>
    </Reveal>
  );
}

export function CoupleSection() {
  return (
    <section id="couple" className="section-rule relative overflow-hidden py-24 md:py-36">
      <SectionBackdrop src="/images/gambar6.jpg" position="object-[50%_44%]" strength="opacity-[.58]" />
      <div className="page-shell relative z-10">
      <Reveal className="mb-14 grid gap-6 md:grid-cols-12 md:items-end">
        <div className="md:col-span-7"><p className="eyebrow text-[#c5a059]">Kisah dua insan</p><h2 className="font-display mt-4 text-5xl leading-[.95] md:text-7xl">Dua cerita,<br /><span className="italic text-[#c5a059]">satu perjalanan.</span></h2></div>
        <p className="max-w-md leading-7 text-[#d1c5b4] md:col-span-5">Dengan memohon rahmat dan ridho Allah SWT, kami mengundang Anda untuk menjadi bagian dari hari yang paling berarti dalam perjalanan kami.</p>
      </Reveal>
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-10"><PersonCard person={wedding.groom} number="01" /><PersonCard person={wedding.bride} number="02" /></div>
      </div>
    </section>
  );
}
