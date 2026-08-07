"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Check, Heart, LoaderCircle, MessageSquareText, UsersRound } from "lucide-react";
import { listRsvps, submitRsvp, type Rsvp, type RsvpInput } from "@/lib/rsvp-client";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

export function RsvpSection() {
  const [wishes, setWishes] = useState<Rsvp[]>([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset, setValue, watch, formState: { errors, isSubmitting } } = useForm<RsvpInput>({ defaultValues: { guests: 1, attendance: "hadir", message: "" } });
  const attendance = watch("attendance");
  const guests = Number(watch("guests")) || 1;
  const guestSelectionDisabled = attendance === "tidak";

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
    <section id="rsvp" className="section-rule relative overflow-hidden py-18 md:py-32">
      <SectionBackdrop src="/images/gambar9.jpg" position="object-[50%_48%]" strength="opacity-[.58]" />
      <div className="page-shell relative z-10 grid gap-8 lg:grid-cols-[.88fr_1.12fr] lg:gap-12">
        <Reveal>
          <p className="eyebrow text-[#c5a059]">Konfirmasi kehadiran</p>
          <h2 className="font-display mt-3 text-4xl leading-[1.02] md:text-6xl">Bisakah kamu <span className="italic text-[#c5a059]">hadir?</span></h2>
          <p className="mt-5 max-w-lg text-[0.96rem] leading-7 text-[#d1c5b4]">Berikan ucapan, harapan, dan konfirmasi kehadiran untuk hari bahagia kami.</p>
          <form onSubmit={handleSubmit(onSubmit)} className="rsvp-panel mt-7 space-y-6 p-4 md:p-6">
            <input type="hidden" {...register("attendance")} />
            <input type="hidden" {...register("guests", { valueAsNumber: true })} />
            <div>
              <label className="font-display mb-2 block text-center text-xl text-[#e4e3db]">Nama Tamu</label>
              <input className="field bg-[#f4f1ea]/95 text-[#251d18] placeholder:text-[#9a9388] focus:bg-white" placeholder="Nama kamu" aria-label="Nama" {...register("name", { required: "Nama wajib diisi", minLength: { value: 2, message: "Nama terlalu singkat" } })} />
              {errors.name && <p className="font-label mt-1 text-xs text-[#ffb4ab]">{errors.name.message}</p>}
            </div>
            <div>
              <p className="font-display mb-3 text-center text-xl text-[#e4e3db]">Konfirmasi Kehadiran</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" className="segmented-button" data-active={attendance === "hadir"} onClick={() => setValue("attendance", "hadir", { shouldDirty: true })}>Hadir</button>
                <button type="button" className="segmented-button" data-active={attendance === "tidak"} onClick={() => setValue("attendance", "tidak", { shouldDirty: true })}>Tidak Hadir</button>
              </div>
            </div>
            <div>
              <p className="font-display mb-3 flex items-center justify-center gap-2 text-xl text-[#e4e3db]"><UsersRound size={18} className="text-[#c5a059]" /> Jumlah Kehadiran</p>
              <div className="grid grid-cols-2 gap-3">
                {[1, 2].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="segmented-button"
                    data-active={!guestSelectionDisabled && guests === value}
                    disabled={guestSelectionDisabled}
                    aria-disabled={guestSelectionDisabled}
                    onClick={() => setValue("guests", value, { shouldDirty: true })}
                  >
                    {value} Orang
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="font-display mb-2 block text-center text-xl text-[#e4e3db]">Ucapan untuk pengantin</label>
              <textarea className="field min-h-30 resize-y bg-[#f4f1ea]/95 text-[#251d18] placeholder:text-[#9a9388] focus:bg-white" placeholder="Tulis ucapan terbaikmu..." aria-label="Ucapan" {...register("message", { maxLength: { value: 500, message: "Maksimal 500 karakter" } })} />
              {errors.message && <p className="font-label mt-1 text-xs text-[#ffb4ab]">{errors.message.message}</p>}
            </div>
            {error && <p className="font-label text-xs text-[#ffb4ab]">{error}</p>}
            {sent && <p className="font-label flex items-center gap-2 text-xs text-[#e9c176]"><Check size={16} /> RSVP terkirim. Terima kasih!</p>}
            <button disabled={isSubmitting} className="font-label inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-full bg-[#c5a059] px-6 text-xs font-semibold uppercase tracking-[.14em] text-[#131410] transition hover:bg-[#e9c176] disabled:opacity-50">{isSubmitting ? <LoaderCircle className="animate-spin" size={17} /> : <Heart size={17} />} Confirm</button>
          </form>
        </Reveal>
        <Reveal delay={.1} className="min-h-[420px] rounded-[8px] border border-white/10 bg-[#1b1c18]/92 p-4 md:p-7">
          <div className="flex items-center justify-between border-b border-white/10 pb-5"><div><p className="eyebrow text-[#c5a059]">Ucapan para tamu</p><h3 className="font-display mt-2 text-3xl">Doa dan harapan</h3></div><MessageSquareText className="text-white/30" /></div>
          <div className="mt-2 max-h-[420px] overflow-y-auto pr-2 md:max-h-[520px]">
            {wishes.length === 0 && <div className="py-16 text-center text-[#837c71]"><Heart className="mx-auto mb-4" size={28} /><p>Jadilah orang pertama yang meninggalkan ucapan.</p></div>}
            {wishes.map((wish) => <article key={wish.id} className="border-b border-white/[.06] py-4"><h4 className="font-display text-base md:text-lg">{wish.name}</h4><p className="mt-2 text-[0.96rem] leading-6 text-[#d1c5b4]">{wish.message || "Semoga acaranya lancar dan penuh bahagia!"}</p></article>)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
