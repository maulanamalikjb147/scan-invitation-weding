import Image from "next/image";
import type { CmsContent } from "@/lib/cms";

export function Footer({ cms }: { cms?: CmsContent }) {
  const dateLabel = cms?.dateLabel || "Sabtu, 26 September 2026";
  const title = cms?.footerTitle || "Anisa & Maulana";
  const message = cms?.footerMessage || "Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i, berkenan hadir dan memberikan do'a restu kepada kami.";
  const [first, second] = title.split("&").map(s=>s.trim());
  return (
    <footer className="relative min-h-[78svh] overflow-hidden">
      <Image src="/images/gambar11.jpg" alt="Anisa dan Maulana" fill sizes="100vw" className="object-cover object-center" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(19,20,16,.80)_0%,rgba(19,20,16,.16)_35%,rgba(19,20,16,.76))]" />
      <div className="page-shell relative z-10 flex min-h-[78svh] flex-col items-center justify-end pb-28 text-center">
        <p className="eyebrow text-[#e9c176]">Terima kasih</p>
        <p className="mt-8 max-w-xl text-sm leading-7 text-[#d1c5b4] md:text-base">{message}</p>
        <p className="mt-7 text-sm text-[#d1c5b4]">Wassalamualaikum Warahmatullahi Wabarakatuh</p>
        <p className="font-label mt-10 text-[11px] uppercase tracking-[.22em] text-white/60">kami yang berbahagia</p>
        <h2 className="font-display mt-4 text-4xl leading-[.98] md:text-6xl">{first || "Anisa"} <span className="italic text-[#c5a059]">&</span> {second || "Maulana"}</h2>
        <p className="font-label mt-6 text-xs uppercase tracking-[.22em] text-white/60">{dateLabel}</p>
      </div>
    </footer>
  );
}
