import Image from "next/image";
import { defaultWeddingContent, getWeddingSection, type WeddingContent, type WeddingPerson } from "@/lib/wedding-content";
import { Reveal } from "./Reveal";

function PersonCard({
  person,
  align = "left",
}: {
  person: WeddingPerson;
  align?: "left" | "right";
}) {
  return (
    <article className="noise relative min-h-[100svh] overflow-hidden">
      <Image src={person.image} alt="" fill sizes="100vw" className="object-cover object-[50%_30%] opacity-85" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,8,.76)_0%,rgba(8,9,8,.18)_42%,rgba(8,9,8,.90)_100%)]" />
      <div className="page-shell relative z-10 flex min-h-[100svh] items-end pb-24 pt-24">
        <Reveal className={`max-w-md ${align === "right" ? "ml-auto text-right" : ""}`}>
          <p className="eyebrow text-[#e9c176]">{align === "right" ? "The Groom" : "The Bride"}</p>
          <h3 className="font-display mt-4 text-4xl leading-[.98] text-white md:text-6xl">{person.fullName}</h3>
          <p className="mt-5 text-base leading-8 text-white/82 md:text-lg">{person.parents}</p>
        </Reveal>
      </div>
    </article>
  );
}

export function CoupleSection({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  const section = getWeddingSection(content, "couple");
  return (
    <section id="couple" className="section-rule">
      <article className="noise relative min-h-[100svh] overflow-hidden">
        <Image src={section.background || content.images.coupleBackdrop} alt="" fill sizes="100vw" className="object-cover object-[50%_44%]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,8,.86)_0%,rgba(8,9,8,.30)_42%,rgba(8,9,8,.90)_100%)]" />
        <div className="page-shell relative z-10 flex min-h-[100svh] flex-col items-center justify-center py-24 text-center">
          <Reveal className="max-w-3xl">
            <p className="font-display break-words text-[#e9c176]" style={{ fontSize: section.titleFontSize }}>{section.title}</p>
            <p dir="rtl" lang="ar" className="font-display mt-9 text-[1.35rem] leading-[2.05] text-white md:text-3xl">وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُمْ مِنْ أَنْفُسِكُمْ أَزْوَاجًا لِتَسْكُنُوا إِلَيْهَا وَجَعَلَ بَيْنَكُمْ مَوَدَّةً وَرَحْمَةً ۚ إِنَّ فِي ذَٰلِكَ لَآيَاتٍ لِقَوْمٍ يَتَفَكَّرُونَ</p>
            <p className="mx-auto mt-7 max-w-2xl leading-[1.9] text-white/82" style={{ fontSize: section.bodyFontSize }}>{section.body}</p>
            <p className="mt-6 text-sm leading-7 text-white/62">(QS. Ar-Rum: 21)</p>
          </Reveal>
        </div>
      </article>
      <PersonCard person={content.bride} />
      <PersonCard person={content.groom} align="right" />
    </section>
  );
}
