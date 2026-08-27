"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Download, QrCode } from "lucide-react";
import QRCode from "qrcode";
import { useEffect, useState } from "react";
import type { WeddingGuest } from "@/lib/guest";

export function QrPrelude({
  guest,
  open,
  onContinue,
}: {
  guest: WeddingGuest;
  open: boolean;
  onContinue: () => void;
}) {
  const [qrCode, setQrCode] = useState("");

  useEffect(() => {
    let active = true;
    QRCode.toDataURL(JSON.stringify({
      id: guest.id,
      nama_tamu: guest.name,
      alamat_tamu: guest.address,
    }), {
      width: 720,
      margin: 2,
      color: { dark: "#131410", light: "#ffffff" },
      errorCorrectionLevel: "M",
    }).then((value) => {
      if (active) setQrCode(value);
    });

    return () => { active = false; };
  }, [guest]);

  const saveQr = () => {
    if (!qrCode) return;
    const link = document.createElement("a");
    link.href = qrCode;
    link.download = `qr-checkin-${guest.slug}.png`;
    link.click();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="invitation-panel-overlay fixed inset-0 z-[60] overflow-hidden bg-[#131410]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: .65 }}
          role="dialog"
          aria-modal="true"
          aria-label="QR check-in tamu"
        >
          <Image
            src="/images/gambar1.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="scale-110 object-cover object-[50%_54%] opacity-30 blur-xl"
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(77,17,27,.08),rgba(19,20,16,.92)_72%)]" />

          <div className="relative z-10 flex min-h-full items-center justify-center px-5 py-8 text-center">
            <motion.div
              className="w-full max-w-sm rounded-[6px] border border-white/10 bg-[#181914]/95 px-6 py-7 shadow-2xl shadow-black/50 backdrop-blur-md"
              initial={{ y: 28, opacity: 0, scale: .96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{ delay: .12, duration: .65 }}
            >
              <div className="eyebrow flex items-center justify-center gap-3 text-[#e9c176]">
                <span className="h-px w-8 bg-[#c5a059]" /> Check-in <span className="h-px w-8 bg-[#c5a059]" />
              </div>
              <h1 className="font-display mt-4 text-3xl italic text-[#e4e3db]">Simpan QR Tamu</h1>
              <p className="mt-2 text-sm text-white/60">Tunjukkan QR ini kepada petugas saat tiba di lokasi.</p>

              <div className="mx-auto my-6 flex aspect-square w-[min(72vw,270px)] items-center justify-center rounded-[5px] bg-white p-3 shadow-[0_0_0_1px_rgba(197,160,89,.5)]">
                {qrCode ? (
                  <Image src={qrCode} alt={`QR check-in ${guest.name}`} width={720} height={720} unoptimized className="h-full w-full" />
                ) : (
                  <QrCode className="h-16 w-16 animate-pulse text-[#c5a059]" />
                )}
              </div>

              <p className="font-display text-xl text-[#e4e3db]">{guest.name}</p>
              {guest.address && <p className="mt-1 text-xs text-white/45">{guest.address}</p>}

              <button
                type="button"
                onClick={saveQr}
                disabled={!qrCode}
                className="font-label mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-[#c5a059]/60 px-5 text-xs font-semibold uppercase tracking-[.14em] text-[#e9c176] transition hover:bg-[#c5a059]/10 disabled:opacity-40"
              >
                <Download size={16} /> Save QR untuk check-in
              </button>
              <button
                type="button"
                onClick={onContinue}
                className="font-label mt-3 min-h-11 w-full rounded-[4px] bg-[#c5a059] px-5 text-xs font-semibold uppercase tracking-[.16em] text-[#131410] transition hover:bg-[#e9c176]"
              >
                Tap untuk lanjut <span aria-hidden="true">→</span>
              </button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
