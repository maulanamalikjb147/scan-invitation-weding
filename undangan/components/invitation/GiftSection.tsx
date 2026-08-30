"use client";

import { Check, Copy, Gift, WalletCards } from "lucide-react";
import { useState } from "react";
import { defaultWeddingContent, type WeddingContent } from "@/lib/wedding-content";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

export function GiftSection({ content = defaultWeddingContent }: { content?: WeddingContent }) {
  const [copied, setCopied] = useState<string | null>(null);
  const copy = async (value: string) => {
    await navigator.clipboard.writeText(value);
    setCopied(value);
    setTimeout(() => setCopied(null), 1800);
  };
  return (
    <section id="gift" className="section-rule relative overflow-hidden py-18 md:py-36">
      <SectionBackdrop src={content.images.giftBackdrop} position="object-[50%_48%]" strength="opacity-[.58]" />
      <div className="page-shell relative z-10">
      <Reveal className="mx-auto max-w-2xl text-center"><Gift className="mx-auto text-[#c5a059]" /><p className="eyebrow mt-5 text-[#c5a059]">Wedding Gift</p><p className="mx-auto mt-6 max-w-xl leading-7 text-[#d1c5b4]">Doa restu anda merupakan karunia yang sangat berarti bagi kami.</p><p className="mx-auto mt-4 max-w-xl leading-7 text-[#d1c5b4]">Dan jika memberi adalah ungkapan tanda kasih, Anda dapat memberi melalui dibawah ini.</p></Reveal>
      <div className="mx-auto mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
        {content.gifts.map((gift) => <Reveal key={gift.number} className="rounded-[8px] border border-white/10 bg-[#1b1c18] p-6" delay={.08}><div className="flex items-center justify-between"><WalletCards className="text-[#c5a059]" /><span className="eyebrow text-white/40">{gift.bank}</span></div><p className="font-label mt-8 text-xl tracking-[.08em]">{gift.number.replace(/(.{4})/g, "$1 ")}</p><p className="mt-2 text-sm text-[#d1c5b4]">a.n. {gift.owner}</p><button onClick={() => void copy(gift.number)} className="font-label mt-6 inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[.16em] text-[#e9c176] hover:text-white">{copied === gift.number ? <Check size={15} /> : <Copy size={15} />}{copied === gift.number ? "Tersalin" : "Salin nomor"}</button></Reveal>)}
      </div>
      </div>
    </section>
  );
}
