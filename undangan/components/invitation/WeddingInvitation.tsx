"use client";

import Image from "next/image";
import { useState } from "react";
import { useAmbientMusic } from "@/hooks/useAmbientMusic";
import { Cover } from "./Cover";
import { CoupleSection } from "./CoupleSection";
import { EventSection } from "./EventSection";
import { FloatingControls } from "./FloatingControls";
import { Footer } from "./Footer";
import { GallerySection } from "./GallerySection";
import { GiftSection } from "./GiftSection";
import { Hero } from "./Hero";
import { QrPrelude } from "./QrPrelude";
import { RsvpSection } from "./RsvpSection";
import { StorySection } from "./StorySection";
import type { WeddingGuest } from "@/lib/guest";
import { useCmsContent } from "@/hooks/useCmsContent";

const petals = [8, 19, 32, 47, 63, 76, 89];

export function WeddingInvitation({ guest }: { guest: WeddingGuest }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(true);
  const { content: cms, gallery: cmsGallery } = useCmsContent();
  const { playing, start, toggle } = useAmbientMusic();
  const openInvitation = () => {
    void start(cms.musicUrl);
    setCoverOpen(false);
    setQrOpen(true);
  };
  const continueToInvitation = () => {
    setQrOpen(false);
    setTimeout(() => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" }), 300);
  };
  return (
    <div className="invitation-desktop-shell">
      <aside className="invitation-photo-panel" aria-hidden="true">
        <Image
          src={cms.heroImage || "/images/gambar1.jpg"}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 61vw, 0px"
          unoptimized={cms.heroImage?.startsWith("data:") || cms.heroImage?.startsWith("http")}
          className="object-cover object-[50%_48%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,8,.16),rgba(10,10,8,.02)_42%,rgba(10,10,8,.18))]" />
      </aside>
      <main className="invitation-phone-panel">
        <QrPrelude guest={guest} open={qrOpen} onContinue={continueToInvitation} />
        <Cover open={coverOpen} onOpen={openInvitation} guestName={guest.name} cms={cms} />
        <div aria-hidden="true">{petals.map((left, index) => <span key={left} className="petal" style={{ left: `${left}%`, animationDuration: `${10 + index * 1.35}s`, animationDelay: `${-index * 1.7}s` }} />)}</div>
        <Hero cms={cms} />
        <CoupleSection cms={cms} />
        <EventSection cms={cms} />
        <GallerySection cms={cms} gallery={cmsGallery} />
        <StorySection cms={cms} />
        <GiftSection cms={cms} />
        <RsvpSection guestName={guest.name} />
        <Footer cms={cms} />
        <FloatingControls playing={playing} onMusic={() => toggle(cms.musicUrl)} />
      </main>
    </div>
  );
}
