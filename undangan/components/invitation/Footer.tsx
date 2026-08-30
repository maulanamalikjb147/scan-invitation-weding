import Image from "next/image";
import { defaultWeddingContent, type WeddingContent } from "@/lib/wedding-content";

export function Footer({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  return (
    <footer className="relative min-h-[78svh] overflow-hidden">
      <Image src={content.images.footer} alt={content.shortNames} fill sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,16,.80)_0%,rgba(19,20,16,.16)_35%,rgba(19,20,16,.76))]" />
      <div className="page-shell relative z-10 flex min-h-[78svh] flex-col items-center justify-end pb-28 text-center">
        <p className="eyebrow text-[#e9c176]">Terima kasih</p>
        <p className="mt-8 max-w-xl text-sm leading-7 text-[#d1c5b4] md:text-base">Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i, berkenan hadir dan memberikan do&apos;a restu kepada kami.</p>
        <p className="mt-7 text-sm text-[#d1c5b4]">Wassalamualaikum Warahmatullahi Wabarakatuh</p>
        <p className="font-label mt-10 text-[11px] uppercase tracking-[.22em] text-white/60">kami yang berbahagia</p>
        <h2 className="font-display mt-4 text-4xl leading-[.98] md:text-6xl">{content.bride.shortName} <span className="italic text-[#c5a059]">&</span> {content.groom.shortName}</h2>
        <p className="font-label mt-6 text-xs uppercase tracking-[.22em] text-white/60">{content.dateLabel}</p>
      </div>
    </footer>
  );
}
