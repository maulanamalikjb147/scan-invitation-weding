import Image from "next/image";
import { ChevronDown } from "lucide-react";
import type { CmsContent } from "@/lib/cms";

export function Hero({ cms }: { cms?: CmsContent }) {
  const heroImage = cms?.heroImage || "/images/gambar1.jpg";
  const title = cms?.heroTitle || "The Wedding of Anisa and Maulana";
  const hashtag = cms?.heroHashtag || "#roMAnSAsatuhati";
  return (
    <section id="home" className="noise relative min-h-[100svh] overflow-hidden">
      <Image src={heroImage} alt="Potret Anisa dan Maulana" fill priority sizes="100vw" unoptimized={heroImage.startsWith("data:") || heroImage.startsWith("http")} className="object-cover object-[50%_52%] md:object-[50%_47%]" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(19,20,16,.68),rgba(19,20,16,.08)_65%),linear-gradient(0deg,rgba(19,20,16,.88)_0%,transparent_50%)]" />
      <div className="page-shell relative z-10 flex min-h-[100svh] flex-col justify-end pb-24 pt-24 md:justify-center md:pb-0">
        <h1 className="font-display max-w-4xl text-[clamp(3.1rem,9.5vw,8.5rem)] leading-[.9]">{title}</h1>
        <div className="mt-7 flex items-center gap-4" aria-label="Tagar pernikahan">
          <span className="h-px w-10 bg-[#c5a059]/70" />
          <p className="font-display text-2xl italic tracking-wide text-[#e9c176] md:text-3xl">{hashtag}</p>
        </div>
      </div>
    </section>
  );
}
