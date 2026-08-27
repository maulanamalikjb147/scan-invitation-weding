// CMS content types + localStorage + Supabase sync
import { wedding as defaultWedding, gallery as defaultGallery } from "./wedding-config";

export type CmsCouple = {
  shortName: string;
  fullName: string;
  parents: string;
  image: string;
};

export type CmsEvent = {
  type: string;
  time: string;
  venue: string;
  address: string;
};

export type CmsGift = {
  bank: string;
  number: string;
  owner: string;
};

export type CmsStory = {
  title: string;
  body: string;
};

export type CmsContent = {
  shortNames: string;
  date: string;
  dateLabel: string;
  heroTitle: string;
  heroHashtag: string;
  heroImage: string;
  coverImage: string;
  groom: CmsCouple;
  bride: CmsCouple;
  events: CmsEvent[];
  mapsUrl: string;
  gifts: CmsGift[];
  stories: CmsStory[];
  footerTitle: string;
  footerMessage: string;
  musicUrl: string;
  quoteAr: string;
  quoteTranslation: string;
  quoteSource: string;
};

export type CmsGalleryItem = {
  id: string;
  src: string;
  alt: string;
  active: boolean;
};

const LS_CONTENT = "cms_wedding_content_v2";
const LS_GALLERY = "cms_wedding_gallery_v2";

function defaults(): { content: CmsContent; gallery: CmsGalleryItem[] } {
  return {
    content: {
      shortNames: defaultWedding.shortNames,
      date: defaultWedding.date,
      dateLabel: defaultWedding.dateLabel,
      heroTitle: "The Wedding of Anisa and Maulana",
      heroHashtag: "#roMAnSAsatuhati",
      heroImage: "/images/gambar1.jpg",
      coverImage: "/images/gambar1.jpg",
      groom: { ...defaultWedding.groom },
      bride: { ...defaultWedding.bride },
      events: [...defaultWedding.events],
      mapsUrl: defaultWedding.mapsUrl,
      gifts: [...defaultWedding.gifts],
      stories: [
        { title: "Awal Pertemuan", body: "Setiap perjalanan punya cara indahnya sendiri untuk dimulai. Dari pertemuan sederhana, Allah menumbuhkan rasa saling mengenal, saling memahami, dan saling menguatkan." },
        { title: "Langkah Pertama", body: "Dengan niat baik dan restu keluarga, kami melangkah lebih dekat. Bukan hanya tentang dua hati, tetapi juga tentang dua keluarga yang dipertemukan dalam doa." },
        { title: "Menuju Selamanya", body: "Hari ini menjadi awal dari perjalanan baru. Semoga Allah menjadikan rumah tangga kami penuh sakinah, mawaddah, warahmah, serta keberkahan di setiap langkah." },
      ],
      footerTitle: "Anisa & Maulana",
      footerMessage: "Merupakan suatu kebahagiaan dan kehormatan bagi kami, apabila Bapak/Ibu/Saudara/i, berkenan hadir dan memberikan do'a restu kepada kami.",
      musicUrl: "/music.mp3",
      quoteAr: "\u0648\u064E\u0645\u0650\u0646\u0652 \u0622\u064A\u064E\u0627\u062A\u0650\u0647\u0650 \u0623\u064E\u0646\u0652 \u062E\u064E\u0644\u064E\u0642\u064E \u0644\u064E\u0643\u064F\u0645\u0652 \u0645\u0650\u0646\u0652 \u0623\u064E\u0646\u0652\u0641\u064F\u0633\u0650\u0643\u064F\u0645\u0652 \u0623\u064E\u0632\u0652\u0648\u064E\u0627\u062C\u064B\u0627 \u0644\u0650\u062A\u064E\u0633\u0652\u0643\u064F\u0646\u064F\u0648\u0627 \u0625\u0650\u0644\u064E\u064A\u0652\u0647\u064E\u0627 \u0648\u064E\u062C\u064E\u0639\u064E\u0644\u064E \u0628\u064E\u064A\u0652\u0646\u064E\u0643\u064F\u0645\u0652 \u0645\u064E\u0648\u064E\u062F\u0651\u064E\u0629\u064B \u0648\u064E\u0631\u064E\u062D\u0652\u0645\u064E\u0629\u064B \u06DA \u0625\u0650\u0646\u0651\u064E \u0641\u0650\u064A \u0630\u064E\u0670\u0644\u0650\u0643\u064E \u0644\u064E\u0622\u064A\u064E\u0627\u062A\u064D \u0644\u0650\u0642\u064E\u0648\u0652\u0645\u064D \u064A\u064E\u062A\u064E\u0641\u064E\u0643\u0651\u064E\u0631\u064F\u0648\u0646\u064E",
      quoteTranslation: "Dan di antara tanda-tanda kebesaran-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda kebesaran Allah bagi kaum yang berpikir.",
      quoteSource: "(QS. Ar-Rum: 21)",
    },
    gallery: defaultGallery.map((g, i) => ({ id: String(i + 1), src: g.src, alt: g.alt, active: true })),
  };
}

export function getDefaultContent(): CmsContent {
  return defaults().content;
}
export function getDefaultGallery(): CmsGalleryItem[] {
  return defaults().gallery;
}

export function loadCmsContent(): CmsContent {
  if (typeof window === "undefined") return getDefaultContent();
  try {
    const raw = localStorage.getItem(LS_CONTENT);
    if (!raw) return getDefaultContent();
    const parsed = JSON.parse(raw);
    const d = getDefaultContent();
    return { ...d, ...parsed, groom: { ...d.groom, ...(parsed.groom || {}) }, bride: { ...d.bride, ...(parsed.bride || {}) }, events: parsed.events || d.events, gifts: parsed.gifts || d.gifts, stories: parsed.stories || d.stories };
  } catch { return getDefaultContent(); }
}

export function saveCmsContent(c: CmsContent) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_CONTENT, JSON.stringify(c));
  // optional Supabase sync - fire and forget
  trySyncToSupabase(c, null);
}

export function loadCmsGallery(): CmsGalleryItem[] {
  if (typeof window === "undefined") return getDefaultGallery();
  try {
    const raw = localStorage.getItem(LS_GALLERY);
    if (!raw) return getDefaultGallery();
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length) return parsed;
    return getDefaultGallery();
  } catch { return getDefaultGallery(); }
}

export function saveCmsGallery(g: CmsGalleryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LS_GALLERY, JSON.stringify(g));
  trySyncToSupabase(null, g);
}

async function trySyncToSupabase(content: CmsContent | null, gallery: CmsGalleryItem[] | null) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key || typeof window === "undefined") return;
    // lazy import to avoid cycle
    const { supabase } = await import("@/components/admin/supabaseClient");
    if (content) {
      await supabase.from("site_content").upsert({ id: 1, data: content, updated_at: new Date().toISOString() }, { onConflict: "id" });
    }
    if (gallery) {
      // gallery sync is per-item; store as JSON in site_content.gallery or separate table if exists
      // we try gallery_images table, fallback silently
      for (let i = 0; i < gallery.length; i++) {
        const item = gallery[i];
        await supabase.from("gallery_images").upsert({ id: item.id, src: item.src, alt: item.alt, sort_order: i, is_active: item.active }, { onConflict: "id" });
      }
    }
  } catch { /* offline or table not exists -> localStorage is source of truth */ }
}

export async function fetchCmsFromSupabase(): Promise<{ content: CmsContent | null; gallery: CmsGalleryItem[] | null }> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return { content: null, gallery: null };
    const { supabase } = await import("@/components/admin/supabaseClient");
    const { data: contentRow } = await supabase.from("site_content").select("data").eq("id", 1).maybeSingle();
    const { data: galleryRows } = await supabase.from("gallery_images").select("id,src,alt,is_active,sort_order").order("sort_order");
    const content = contentRow?.data as CmsContent | null;
    let gallery: CmsGalleryItem[] | null = null;
    if (galleryRows && galleryRows.length) {
      gallery = galleryRows.map((r: any) => ({ id: String(r.id), src: r.src, alt: r.alt, active: !!r.is_active }));
    }
    return { content: content || null, gallery };
  } catch { return { content: null, gallery: null }; }
}

export async function uploadCmsImage(file: File): Promise<string> {
  // try Supabase storage
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (url && key) {
      const { supabase } = await import("@/components/admin/supabaseClient");
      const bucket = "wedding-assets";
      const ext = file.name.split(".").pop() || "jpg";
      const name = `cms/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error } = await supabase.storage.from(bucket).upload(name, file, { upsert: true, contentType: file.type });
      if (!error) {
        const { data } = supabase.storage.from(bucket).getPublicUrl(name);
        return data.publicUrl;
      }
    }
  } catch {}
  // fallback: data URL (persists in localStorage, works offline)
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file"));
    reader.readAsDataURL(file);
  });
}
