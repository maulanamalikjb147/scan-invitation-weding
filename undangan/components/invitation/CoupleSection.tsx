import Image from "next/image";
import { wedding } from "@/lib/wedding-config";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

function PersonCard({
  person,
  role,
}: {
  person: typeof wedding.groom | typeof wedding.bride;
  role: "wanita" | "pria";
}) {
  return (
    <Reveal className="grid gap-6 md:grid-cols-[1fr_.78fr] md:items-end">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-[8px] border border-white/10 bg-[#1b1c18]">
        <Image src={person.image} alt={person.fullName} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131410]/65 via-transparent to-transparent" />
      </div>
      <div className="pb-3">
        <p className="eyebrow mb-3 text-[#c5a059]">Mengenal mempelai {role}</p>
        <h3 className="font-display text-3xl leading-tight md:text-5xl">{person.fullName}</h3>
        <p className="mt-4 leading-7 text-[#d1c5b4]">{person.parents}</p>
      </div>
    </Reveal>
  );
}

export function CoupleSection() {
  return (
    <section id="couple" className="section-rule relative overflow-hidden py-18 md:py-36">
      <SectionBackdrop src="/images/gambar6.jpg" position="object-[50%_44%]" strength="opacity-[.58]" />
      <div className="page-shell relative z-10">
      <Reveal className="mx-auto mb-12 max-w-3xl text-center">
        <p className="eyebrow text-[#c5a059]">The Wedding Of</p>
        <h2 className="font-display mt-4 text-4xl leading-[1.02] md:text-7xl">Anisa <span className="italic text-[#c5a059]">&</span> Maulana</h2>
        <p className="mt-7 leading-7 text-[#d1c5b4]">Maha Suci Allah yang telah menciptakan makhluk-Nya berpasang-pasangan. Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan pernikahan putra-putri kami.</p>
      </Reveal>
      <Reveal className="mx-auto mb-14 max-w-3xl rounded-[8px] border border-white/10 bg-[#1b1c18]/88 p-5 text-center md:p-8">
        <p className="eyebrow text-[#c5a059]">QS. Ar-Rum Ayat 21</p>
        <p className="mt-5 text-[1.05rem] leading-8 text-[#e4e3db]">Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.</p>
      </Reveal>
      <div className="grid gap-16 lg:grid-cols-2 lg:gap-10"><PersonCard person={wedding.bride} role="wanita" /><PersonCard person={wedding.groom} role="pria" /></div>
      </div>
    </section>
  );
}
