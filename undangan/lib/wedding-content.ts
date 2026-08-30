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
  images: WeddingImages;
};

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

export function mergeWeddingContent(value: unknown): WeddingContent {
  if (!isRecord(value)) return defaultWeddingContent;
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
    images: {
      ...defaultWeddingContent.images,
      ...(isRecord(value.images) ? Object.fromEntries(
        Object.entries(value.images).filter(([, image]) => typeof image === "string" && image.trim())
      ) : {}),
    },
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
