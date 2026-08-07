import Image from "next/image";

export default function Home() {
  return (
    <main className="relative min-h-[100svh] w-full bg-[#0a0a08]">
      <Image
        src="/maulanaanisa.png"
        alt="Undangan pernikahan Anisa dan Maulana, 26 September 2026"
        fill
        priority
        sizes="100vw"
        className="object-contain"
      />
    </main>
  );
}
