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
import { defaultWeddingContent, type WeddingContent } from "@/lib/wedding-content";

const petals = [8, 19, 32, 47, 63, 76, 89];

export function WeddingInvitation({ guest, content = defaultWeddingContent }: { guest: WeddingGuest; content?: WeddingContent }) {
  const [qrOpen, setQrOpen] = useState(false);
  const [coverOpen, setCoverOpen] = useState(true);
  const { playing, start, toggle } = useAmbientMusic();
  const openInvitation = () => {
    void start();
    setCoverOpen(false);
    setQrOpen(true);
  };
  const continueToInvitation = () => {
    setQrOpen(false);
    setTimeout(() => document.querySelector("#home")?.scrollIntoView({ behavior: "smooth" }), 300);
  };
  const orderedSections = [...content.sections]
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order);
  const renderSection = (id: (typeof orderedSections)[number]["id"]) => {
    switch (id) {
      case "hero": return <Hero content={content} />;
      case "couple": return <CoupleSection content={content} />;
      case "story": return <StorySection content={content} />;
      case "event": return <EventSection content={content} />;
      case "gallery": return <GallerySection content={content} />;
      case "gift": return <GiftSection content={content} />;
      case "rsvp": return <RsvpSection guestName={guest.name} content={content} />;
      case "footer": return <Footer content={content} />;
    }
  };
  return (
    <div className="invitation-desktop-shell">
      <aside className="invitation-photo-panel relative" aria-hidden="true">
        <Image
          src={content.images.desktopSide || content.images.cover}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 61vw, 0px"
          className="object-cover object-[50%_48%]"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,10,8,.16),rgba(10,10,8,.02)_42%,rgba(10,10,8,.18))]" />
      </aside>
      <main className="invitation-phone-panel">
        <QrPrelude guest={guest} open={qrOpen} onContinue={continueToInvitation} />
        <Cover open={coverOpen} onOpen={openInvitation} guestName={guest.name} content={content} />
        <div aria-hidden="true">{petals.map((left, index) => <span key={left} className="petal" style={{ left: `${left}%`, animationDuration: `${10 + index * 1.35}s`, animationDelay: `${-index * 1.7}s` }} />)}</div>
        {orderedSections.map((section) => <div key={section.id}>{renderSection(section.id)}</div>)}
        <FloatingControls playing={playing} onMusic={toggle} />
      </main>
    </div>
  );
}
