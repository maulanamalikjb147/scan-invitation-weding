"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Heart, LoaderCircle, MessageSquareText } from "lucide-react";
import { listRsvps, submitRsvp, type Rsvp, type RsvpInput } from "@/lib/rsvp-client";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

export function RsvpSection() {
  const [wishes, setWishes] = useState<Rsvp[]>([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<RsvpInput>({ defaultValues: { guests: 1, attendance: "hadir", message: "" } });

  const refresh = useCallback(async () => {
    try { setWishes(await listRsvps()); } catch { /* keep the invitation usable if the network is briefly unavailable */ }
  }, []);
  useEffect(() => {
    void refresh();
    const timer = setInterval(() => void refresh(), 6000);
    return () => clearInterval(timer);
  }, [refresh]);

  const onSubmit = async (values: RsvpInput) => {
    setError("");
    try {
      await submitRsvp({ ...values, guests: Number(values.guests) });
      setSent(true);
      reset();
      await refresh();
      setTimeout(() => setSent(false), 4000);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Terjadi kesalahan"); }
  };

  return (
    <section id="rsvp" className="section-rule relative overflow-hidden py-24 md:py-36">
      <SectionBackdrop src="/images/gambar9.jpg" position="object-[50%_48%]" strength="opacity-[.58]" />
      <div className="page-shell relative z-10 grid gap-14 lg:grid-cols-[.92fr_1.08fr]">
        <Reveal>
          <p className="eyebrow text-[#c5a059]">Konfirmasi kehadiran</p>
          <h2 className="font-display mt-4 text-5xl md:text-7xl">Bisakah kamu <span className="italic text-[#c5a059]">hadir?</span></h2>
          <p className="mt-6 max-w-lg leading-7 text-[#d1c5b4]">Konfirmasi kehadiran dan tinggalkan satu-dua kalimat yang nanti bisa kami baca lagi sambil tersenyum.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-9 space-y-4">
            <div><input className="field" placeholder="Nama kamu" aria-label="Nama" {...register("name", { required: "Nama wajib diisi", minLength: { value: 2, message: "Nama terlalu singkat" } })} />{errors.name && <p className="font-label mt-1 text-xs text-[#ffb4ab]">{errors.name.message}</p>}</div>
            <div className="grid grid-cols-2 gap-3">
              <select className="field" aria-label="Jumlah tamu" {...register("guests", { valueAsNumber: true })}>{[1,2].map((guest) => <option key={guest} value={guest}>{guest} tamu</option>)}</select>
              <select className="field" aria-label="Konfirmasi kehadiran" {...register("attendance")}><option value="hadir">Aku hadir</option><option value="tidak">Belum bisa hadir</option></select>
            </div>
            <textarea className="field min-h-28 resize-y" placeholder="Tulis ucapan terbaikmu…" aria-label="Ucapan" {...register("message", { maxLength: { value: 500, message: "Maksimal 500 karakter" } })} />
            {errors.message && <p className="font-label text-xs text-[#ffb4ab]">{errors.message.message}</p>}
            {error && <p className="font-label text-xs text-[#ffb4ab]">{error}</p>}
            {sent && <p className="font-label flex items-center gap-2 text-xs text-[#e9c176]"><Check size={16} /> RSVP terkirim. Terima kasih!</p>}
            <button disabled={isSubmitting} className="font-label inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-[4px] bg-[#c5a059] px-6 text-xs font-semibold uppercase tracking-[.16em] text-[#131410] transition hover:bg-[#e9c176] disabled:opacity-50">{isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : <Heart size={17} />} Kirim RSVP</button>
          </form>
        </Reveal>
        <Reveal delay={.1} className="min-h-[520px] rounded-[8px] border border-white/10 bg-[#1b1c18] p-5 md:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="eyebrow text-[#c5a059]">Ucapan para tamu</p><h3 className="font-display mt-2 text-3xl">Doa dan harapan</h3></div><MessageSquareText className="text-white/30" /></div>
          <div className="mt-2 max-h-[520px] overflow-y-auto pr-2">
            {wishes.length === 0 && <div className="py-16 text-center text-[#837c71]"><Heart className="mx-auto mb-4" size={28} /><p>Jadilah orang pertama yang meninggalkan ucapan.</p></div>}
            {wishes.map((wish) => <article key={wish.id} className="border-b border-white/[.06] py-5"><div className="flex items-start justify-between gap-3"><h4 className="font-display text-lg">{wish.name}</h4><span className="eyebrow border border-white/10 px-2 py-1 text-[8px] text-[#c5a059]">{wish.attendance === "hadir" ? "Hadir" : "Titip doa"}</span></div><p className="mt-2 leading-6 text-[#d1c5b4]">{wish.message || "Semoga acaranya lancar dan penuh bahagia!"}</p></article>)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
