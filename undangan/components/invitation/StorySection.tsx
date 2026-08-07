import { HeartHandshake } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionBackdrop } from "./SectionBackdrop";

const stories = [
  {
    title: "Awal Pertemuan",
    body: "Setiap perjalanan punya cara indahnya sendiri untuk dimulai. Dari pertemuan sederhana, Allah menumbuhkan rasa saling mengenal, saling memahami, dan saling menguatkan.",
  },
  {
    title: "Langkah Pertama",
    body: "Dengan niat baik dan restu keluarga, kami melangkah lebih dekat. Bukan hanya tentang dua hati, tetapi juga tentang dua keluarga yang dipertemukan dalam doa.",
  },
  {
    title: "Menuju Selamanya",
    body: "Hari ini menjadi awal dari perjalanan baru. Semoga Allah menjadikan rumah tangga kami penuh sakinah, mawaddah, warahmah, serta keberkahan di setiap langkah.",
  },
];

export function StorySection() {
  return (
    <section id="story" className="section-rule relative overflow-hidden py-18 md:py-36">
      <SectionBackdrop src="/images/gambar8.jpg" position="object-[50%_46%]" strength="opacity-[.52]" />
      <div className="page-shell relative z-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <HeartHandshake className="mx-auto text-[#c5a059]" />
          <p className="eyebrow mt-5 text-[#c5a059]">Love Story</p>
          <h2 className="font-display mt-4 text-4xl md:text-7xl">Cerita menuju <span className="italic text-[#c5a059]">akad.</span></h2>
          <p className="mt-6 leading-7 text-[#d1c5b4]">Sedikit kisah tentang perjalanan kami sebelum sampai pada hari yang insyaAllah menjadi awal ibadah terpanjang.</p>
        </Reveal>
        <div className="mx-auto mt-10 grid max-w-4xl gap-4 md:grid-cols-3">
          {stories.map((story, index) => (
            <Reveal key={story.title} delay={index * .08} className="rounded-[8px] border border-white/10 bg-[#1b1c18]/90 p-5 md:p-6">
              <p className="eyebrow text-[#c5a059]">0{index + 1}</p>
              <h3 className="font-display mt-4 text-2xl">{story.title}</h3>
              <p className="mt-4 text-[0.96rem] leading-7 text-[#d1c5b4]">{story.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
