import Image from "next/image";
import { defaultWeddingContent, type WeddingContent, type WeddingPerson } from "@/lib/wedding-content";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

function PersonCard({
  person,
}: {
  person: WeddingPerson;
}) {
  return (
    <Reveal className="grid gap-6 md:grid-cols-[1fr_.78fr] md:items-end">
      <div className="group relative aspect-[4/5] overflow-hidden rounded-[8px] border border-white/10 bg-[#1b1c18]">
        <Image src={person.image} alt={person.fullName} fill sizes="(max-width: 768px) 100vw, 45vw" className="object-cover transition duration-700 group-hover:scale-[1.025]" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#131410]/65 via-transparent to-transparent" />
      </div>
      <div className="pb-3">
        <h3 className="font-display text-2xl leading-tight md:text-4xl">{person.fullName}</h3>
        <p className="mt-4 text-sm leading-7 text-[#d1c5b4] md:text-base">{person.parents}</p>
      </div>
    </Reveal>
  );
}

export function CoupleSection({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  return (
    <section id="couple" className="section-rule relative overflow-hidden py-18 md:py-36">
      <SectionBackdrop src={content.images.coupleBackdrop} position="object-[50%_44%]" strength="opacity-[.58]" />
      <div className="page-shell relative z-10">
        <Reveal className="mx-auto mb-14 max-w-3xl rounded-[8px] border border-white/10 bg-[#1b1c18]/88 p-5 text-center md:p-7">
          <p dir="rtl" lang="ar" className="font-display text-[1.35rem] leading-[2.05] text-[#e4e3db] md:text-3xl">وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِقَوْمٍ يَتَفَكَّرُونَ</p>
          <p className="mt-6 text-sm leading-7 text-[#d1c5b4] md:text-base">Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda kebesaran Allah bagi kaum yang berpikir.</p>
          <p className="mt-6 text-sm leading-7 text-[#d1c5b4] md:text-base">(QS. Ar-Rum: 21)</p>
          {/*<p className="mx-auto mt-6 max-w-2xl text-[0.92rem] leading-7 text-[#e4e3db] md:text-base">Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda kebesaran Allah bagi kaum yang berpikir.</p>*/}
          {/*<p className="mx-auto mt-6 max-w-2xl text-[0.92rem] leading-7 text-[#e4e3db] md:text-base">(QS. Ar-Rum: 21)</p>*/}
        </Reveal>
        <Reveal className="mx-auto mb-12 max-w-3xl text-center">
          <p className="font-display text-xl text-[#e9c176] md:text-2xl">Assalamualaikum Warahmatullahi Wabarakatuh</p>
        </Reveal>
        <div className="grid gap-16 lg:grid-cols-2 lg:gap-10"><PersonCard person={content.bride} /><PersonCard person={content.groom} /></div>
      </div>
    </section>
  );
}
