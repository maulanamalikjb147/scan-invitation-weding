import { gallery, wedding } from "./wedding-config";

export type WeddingPerson = {
  shortName: string;
  fullName: string;
  parents: string;
  image: string;
};

export type WeddingEvent = {
  type: string;
  time: string;
  venue: string;
  address: string;
};

export type WeddingGift = {
  bank: string;
  number: string;
  owner: string;
};

export type WeddingPhoto = {
  src: string;
  alt: string;
};

export type WeddingStory = {
  title: string;
  body: string;
  image: string;
};

export const weddingSectionIds = ["hero", "couple", "story", "event", "gallery", "gift", "rsvp", "footer"] as const;
export type WeddingSectionId = (typeof weddingSectionIds)[number];

export type WeddingSectionSettings = {
  id: WeddingSectionId;
  name: string;
  order: number;
  visible: boolean;
  title: string;
  body: string;
  titleFontSize: number;
  bodyFontSize: number;
  background: string;
};

export type WeddingImages = {
  cover: string;
  desktopSide: string;
  hero: string;
  coupleBackdrop: string;
  eventBackdrop: string;
  galleryBackdrop: string;
  giftBackdrop: string;
  footer: string;
};

export type WeddingContent = {
  shortNames: string;
  date: string;
  dateLabel: string;
  hashtag: string;
  mapsUrl: string;
  groom: WeddingPerson;
  bride: WeddingPerson;
  events: WeddingEvent[];
  gifts: WeddingGift[];
  gallery: WeddingPhoto[];
  stories: WeddingStory[];
  sections: WeddingSectionSettings[];
  images: WeddingImages;
};

export const defaultWeddingSections: WeddingSectionSettings[] = [
  { id: "hero", name: "Pembuka", order: 0, visible: true, title: "", body: "", titleFontSize: 64, bodyFontSize: 24, background: "/images/gambar1.jpg" },
  { id: "couple", name: "Mempelai", order: 1, visible: true, title: "Assalamualaikum Warahmatullahi Wabarakatuh", body: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang.", titleFontSize: 28, bodyFontSize: 16, background: "/images/gambar6.jpg" },
  { id: "story", name: "Kisah Kami", order: 2, visible: true, title: "Love Story", body: "", titleFontSize: 48, bodyFontSize: 18, background: "/images/gambar8.jpg" },
  { id: "event", name: "Acara", order: 3, visible: true, title: "Save the date", body: "", titleFontSize: 56, bodyFontSize: 16, background: "/images/gambar4.jpg" },
  { id: "gallery", name: "Galeri", order: 4, visible: true, title: "Gallery", body: "", titleFontSize: 64, bodyFontSize: 16, background: "/images/gambar7.jpg" },
  { id: "gift", name: "Hadiah", order: 5, visible: true, title: "Doa restu adalah hadiah terbaik.", body: "Jika memberi adalah ungkapan tanda kasih, Anda dapat memberi melalui pilihan di bawah ini.", titleFontSize: 52, bodyFontSize: 16, background: "/images/gambar5.jpg" },
  { id: "rsvp", name: "RSVP & Ucapan", order: 6, visible: true, title: "Wedding wish", body: "Berikan doa dan ucapan terbaik untuk kami.", titleFontSize: 52, bodyFontSize: 16, background: "/images/gambar9.jpg" },
  { id: "footer", name: "Penutup", order: 7, visible: true, title: "", body: "", titleFontSize: 48, bodyFontSize: 16, background: "/images/gambar11.jpg" },
];

export const defaultWeddingContent: WeddingContent = {
  ...wedding,
  hashtag: "#roMAnSAsatuhati",
  images: {
    cover: "/images/gambar1.jpg",
    desktopSide: "/images/gambar1.jpg",
    hero: "/images/gambar1.jpg",
    coupleBackdrop: "/images/gambar6.jpg",
    eventBackdrop: "/images/gambar4.jpg",
    galleryBackdrop: "/images/gambar7.jpg",
    giftBackdrop: "/images/gambar5.jpg",
    footer: "/images/gambar11.jpg",
  },
  events: wedding.events.map((event) => ({ ...event })),
  gifts: wedding.gifts.map((gift) => ({ ...gift })),
  gallery: gallery.map((photo) => ({ ...photo })),
  stories: [
    { title: "Awal Pertemuan", body: "Setiap perjalanan punya cara indahnya sendiri untuk dimulai. Dari pertemuan sederhana, Allah menumbuhkan rasa saling mengenal, saling memahami, dan saling menguatkan.", image: "/images/gambar8.jpg" },
    { title: "Langkah Pertama", body: "Dengan niat baik dan restu keluarga, kami melangkah lebih dekat. Bukan hanya tentang dua hati, tetapi juga tentang dua keluarga yang dipertemukan dalam doa.", image: "/images/gambar10.jpg" },
    { title: "Menuju Selamanya", body: "Hari ini menjadi awal dari perjalanan baru. Semoga Allah menjadikan rumah tangga kami penuh sakinah, mawaddah, warahmah, serta keberkahan di setiap langkah.", image: "/images/gambar11.jpg" },
  ],
  sections: defaultWeddingSections.map((section) => ({ ...section })),
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function stringValue(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function mergePerson(value: unknown, fallback: WeddingPerson): WeddingPerson {
  if (!isRecord(value)) return fallback;
  return {
    shortName: stringValue(value.shortName, fallback.shortName),
    fullName: stringValue(value.fullName, fallback.fullName),
    parents: stringValue(value.parents, fallback.parents),
    image: stringValue(value.image, fallback.image),
  };
}

function mergeEvents(value: unknown, fallback: WeddingEvent[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value.map((event, index) => {
    const source = isRecord(event) ? event : {};
    const base = fallback[index] || fallback[0];
    return {
      type: stringValue(source.type, base.type),
      time: stringValue(source.time, base.time),
      venue: stringValue(source.venue, base.venue),
      address: stringValue(source.address, base.address),
    };
  });
}

function mergeGifts(value: unknown, fallback: WeddingGift[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  return value.map((gift, index) => {
    const source = isRecord(gift) ? gift : {};
    const base = fallback[index] || { bank: "Rekening", number: "", owner: "" };
    return {
      bank: stringValue(source.bank, base.bank),
      number: stringValue(source.number, base.number),
      owner: stringValue(source.owner, base.owner),
    };
  }).filter((gift) => gift.number && gift.owner);
}

function mergeGallery(value: unknown, fallback: WeddingPhoto[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const photos = value.map((photo, index) => {
    const source = isRecord(photo) ? photo : {};
    return {
      src: stringValue(source.src, ""),
      alt: stringValue(source.alt, `Momen prewedding Anisa dan Maulana ${index + 1}`),
    };
  }).filter((photo) => photo.src);
  return photos.length ? photos : fallback;
}

function numberValue(value: unknown, fallback: number, min: number, max: number) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function mergeStories(value: unknown, fallback: WeddingStory[]) {
  if (!Array.isArray(value) || value.length === 0) return fallback;
  const stories = value.map((story, index) => {
    const source = isRecord(story) ? story : {};
    const base = fallback[index] || { title: `Cerita ${index + 1}`, body: "", image: fallback[0].image };
    return {
      title: stringValue(source.title, base.title),
      body: stringValue(source.body, base.body),
      image: stringValue(source.image, base.image),
    };
  });
  return stories.length ? stories : fallback;
}

function mergeSections(value: unknown, images: WeddingImages): WeddingSectionSettings[] {
  const supplied = Array.isArray(value) ? value.filter(isRecord) : [];
  const legacyBackgrounds: Partial<Record<WeddingSectionId, string>> = {
    hero: images.hero,
    couple: images.coupleBackdrop,
    event: images.eventBackdrop,
    gallery: images.galleryBackdrop,
    gift: images.giftBackdrop,
    footer: images.footer,
  };
  return defaultWeddingSections.map((fallback) => {
    const source = supplied.find((section) => section.id === fallback.id);
    const fallbackBackground = legacyBackgrounds[fallback.id] || fallback.background;
    if (!source) return { ...fallback, background: fallbackBackground };
    return {
      id: fallback.id,
      name: stringValue(source.name, fallback.name),
      order: numberValue(source.order, fallback.order, 0, defaultWeddingSections.length - 1),
      visible: typeof source.visible === "boolean" ? source.visible : fallback.visible,
      title: typeof source.title === "string" ? source.title : fallback.title,
      body: typeof source.body === "string" ? source.body : fallback.body,
      titleFontSize: numberValue(source.titleFontSize, fallback.titleFontSize, 20, 96),
      bodyFontSize: numberValue(source.bodyFontSize, fallback.bodyFontSize, 12, 32),
      background: stringValue(source.background, fallbackBackground),
    };
  }).sort((a, b) => a.order - b.order).map((section, order) => ({ ...section, order }));
}

export function getWeddingSection(content: WeddingContent, id: WeddingSectionId) {
  return content.sections.find((section) => section.id === id)
    || defaultWeddingSections.find((section) => section.id === id)!;
}

export function mergeWeddingContent(value: unknown): WeddingContent {
  if (!isRecord(value)) return defaultWeddingContent;
  const images = {
    ...defaultWeddingContent.images,
    ...(isRecord(value.images) ? Object.fromEntries(
      Object.entries(value.images).filter(([, image]) => typeof image === "string" && image.trim())
    ) : {}),
  } as WeddingImages;
  return {
    shortNames: stringValue(value.shortNames, defaultWeddingContent.shortNames),
    date: stringValue(value.date, defaultWeddingContent.date),
    dateLabel: stringValue(value.dateLabel, defaultWeddingContent.dateLabel),
    hashtag: stringValue(value.hashtag, defaultWeddingContent.hashtag),
    mapsUrl: stringValue(value.mapsUrl, defaultWeddingContent.mapsUrl),
    groom: mergePerson(value.groom, defaultWeddingContent.groom),
    bride: mergePerson(value.bride, defaultWeddingContent.bride),
    events: mergeEvents(value.events, defaultWeddingContent.events),
    gifts: mergeGifts(value.gifts, defaultWeddingContent.gifts),
    gallery: mergeGallery(value.gallery, defaultWeddingContent.gallery),
    stories: mergeStories(value.stories, defaultWeddingContent.stories),
    sections: mergeSections(value.sections, images),
    images,
  };
}

export async function fetchWeddingContent(): Promise<WeddingContent> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return defaultWeddingContent;

  try {
    const response = await fetch(
      `${supabaseUrl}/rest/v1/wedding_cms_settings?id=eq.default&select=content&limit=1`,
      {
        headers: {
          apikey: supabaseKey,
          Authorization: `Bearer ${supabaseKey}`,
        },
        cache: "no-store",
      }
    );
    if (!response.ok) return defaultWeddingContent;
    const rows = await response.json() as Array<{ content?: unknown }>;
    return mergeWeddingContent(rows[0]?.content);
  } catch {
    return defaultWeddingContent;
  }
}
