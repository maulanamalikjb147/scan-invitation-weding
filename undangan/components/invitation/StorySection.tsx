import Image from "next/image";
import { defaultWeddingContent, getWeddingSection, type WeddingContent } from "@/lib/wedding-content";
import { Reveal } from "./Reveal";

export function StorySection({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  const section = getWeddingSection(content, "story");
  return (
    <section id="story" className="section-rule">
      {content.stories.map((story, index) => (
        <article key={story.title} className="noise relative min-h-[100svh] overflow-hidden">
          <Image
            src={index === 0 ? section.background || story.image : story.image}
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-[50%_48%]"
          />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,8,7,.84)_0%,rgba(7,8,7,.22)_34%,rgba(7,8,7,.28)_62%,rgba(7,8,7,.88)_100%)]" />
          <div className="pointer-events-none absolute inset-y-0 left-1/2 border-l-2 border-dashed border-white/25" aria-hidden="true" />
          <div className="page-shell relative z-10 flex min-h-[100svh] flex-col items-center justify-end pb-24 pt-24 text-center md:pb-28">
            <Reveal className="max-w-3xl">
              {index === 0 && <p className="eyebrow mb-7 text-[#e9c176]">{section.title}</p>}
              <p className="font-label text-[11px] font-semibold uppercase tracking-[.22em] text-white/55">0{index + 1}</p>
              <h2 className="font-display mt-4 break-words leading-tight text-white" style={{ fontSize: section.titleFontSize }}>{story.title}</h2>
              <p className="mx-auto mt-5 max-w-2xl leading-[1.8] text-white/88" style={{ fontSize: section.bodyFontSize }}>{story.body}</p>
            </Reveal>
            <span className="absolute bottom-9 left-1/2 size-6 -translate-x-1/2 rounded-full border-2 border-white/60 bg-[#131410]/45" aria-hidden="true" />
          </div>
        </article>
      ))}
    </section>
  );
}
