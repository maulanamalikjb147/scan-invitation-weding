"use client";

import { Check, Copy, Gift, WalletCards } from "lucide-react";
import { useState } from "react";
import { defaultWeddingContent, getWeddingSection, type WeddingContent } from "@/lib/wedding-content";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

export function GiftSection({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  const section = getWeddingSection(content, "gift");
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1800);
  };
  return (
    <section id="gift" className="section-rule relative min-h-[100svh] overflow-hidden">
      <SectionBackdrop src={section.background || content.images.giftBackdrop} position="object-[50%_48%]" strength="opacity-100" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(8,9,8,.90)_0%,rgba(8,9,8,.38)_42%,rgba(8,9,8,.94)_100%)]" />
      <div className="page-shell relative z-10 flex min-h-[100svh] flex-col justify-center py-24 text-center">
        <Reveal className="mx-auto max-w-2xl">
          <Gift className="mx-auto text-[#e9c176]" />
          <p className="eyebrow mt-5 text-[#e9c176]">Wedding Gift</p>
          <h2 className="font-display mt-5 break-words leading-tight text-white" style={{ fontSize: section.titleFontSize }}>{section.title}</h2>
          <p className="mx-auto mt-6 max-w-xl leading-[1.8] text-white/78" style={{ fontSize: section.bodyFontSize }}>{section.body}</p>
        </Reveal>
        <div className="mx-auto mt-12 grid w-full max-w-3xl gap-8 md:grid-cols-2">
          {content.gifts.map((gift, index) => (
            <Reveal key={gift.number} className="border-y border-white/20 py-7" delay={index * .08}>
              <div className="flex items-center justify-center gap-3 text-[#e9c176]">
                <WalletCards size={20} />
                <span className="eyebrow">{gift.bank}</span>
              </div>
              <p className="font-label mt-7 text-xl tracking-[.08em] text-white md:text-2xl">{gift.number.replace(/(.{4})/g, "$1 ")}</p>
              <p className="mt-2 text-sm text-white/65">a.n. {gift.owner}</p>
              <button onClick={() => void copy(gift.number)} className="font-label mt-6 inline-flex min-h-11 items-center gap-2 rounded-full border border-white/25 bg-white/10 px-5 text-[10px] font-semibold uppercase tracking-[.16em] text-white backdrop-blur transition hover:bg-white hover:text-[#131410]">{copied === gift.number ? <Check size={15} /> : <Copy size={15} />}{copied === gift.number ? "Tersalin" : "Salin nomor"}</button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
