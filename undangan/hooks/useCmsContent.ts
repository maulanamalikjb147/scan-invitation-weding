"use client";
import { useEffect, useState, useCallback } from "react";
import { loadCmsContent, loadCmsGallery, fetchCmsFromSupabase, type CmsContent, type CmsGalleryItem, getDefaultContent, getDefaultGallery } from "@/lib/cms";

export function useCmsContent() {
  const [content, setContent] = useState<CmsContent>(() => getDefaultContent());
  const [gallery, setGallery] = useState<CmsGalleryItem[]>(() => getDefaultGallery());
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    // local first
    const localContent = loadCmsContent();
    const localGallery = loadCmsGallery();
    setContent(localContent);
    setGallery(localGallery);
    setLoaded(true);
    // try remote sync (override local if remote exists)
    const remote = await fetchCmsFromSupabase();
    if (remote.content) {
      setContent(remote.content);
      if (typeof window !== "undefined") localStorage.setItem("cms_wedding_content_v2", JSON.stringify(remote.content));
    }
    if (remote.gallery) {
      setGallery(remote.gallery);
      if (typeof window !== "undefined") localStorage.setItem("cms_wedding_gallery_v2", JSON.stringify(remote.gallery));
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "cms_wedding_content_v2" || e.key === "cms_wedding_gallery_v2") void refresh();
    };
    const onCustom = () => void refresh();
    window.addEventListener("storage", onStorage);
    window.addEventListener("cms-update", onCustom as EventListener);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("cms-update", onCustom as EventListener);
    };
  }, [refresh]);

  return { content, gallery, loaded, refresh };
}
