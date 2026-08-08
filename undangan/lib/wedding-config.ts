export const wedding = {
  shortNames: "Anisa & Maulana",
  date: "2026-09-26T08:00:00+07:00",
  dateLabel: "Sabtu, 26 September 2026",
  groom: {
    shortName: "Maulana",
    fullName: "Maulana Malik Jabbar Budianto, S.Kom.",
    parents: "Putra tercinta dari Bapak Budiana Shaleh S.SOS & Ibu Enun Nurhayati",
    image: "/images/cpp.png",
  },
  bride: {
    shortName: "Anisa",
    fullName: "Anisa Syafitri, S.Sos.",
    parents: "Putri tercinta dari Bapak Oman Moch. Chotman & Ibu Idah Hamidah",
    image: "/images/cpw.JPG",
  },
  events: [
    { type: "Akad Nikah & Resepsi", time: "15.00 – 22.00 WIB", venue: "Rumah Makan Saung Gunung Jati", address: "Tasikmalaya, Jawa Barat" },
  ],
  mapsUrl: "https://maps.app.goo.gl/QNSAzPPbZwcx58Qd9",
  gifts: [
    { bank: "Rekening", number: "446101046660531", owner: "Anisa Syafitri" },
    { bank: "Rekening", number: "1270012172761", owner: "Maulana Malik J. B." },
  ],
} as const;

const galleryFiles = [
  "gambar1.jpg",
  "gambar2.jpg",
  "gambar3.jpg",
  "gambar4.jpg",
  "gambar5.jpg",
  "gambar6.jpg",
  "gambar7.jpg",
  "gambar8.jpg",
  "gambar9.jpg",
  "gambar10.jpg",
  "gambar11.jpg",
  "gambar12.JPG",
  "gambar13.JPG",
] as const;

export const gallery = galleryFiles.map((file, index) => ({
  src: `/images/${file}`,
  alt: `Momen prewedding Anisa dan Maulana ${index + 1}`,
}));
