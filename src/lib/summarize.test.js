import { describe, expect, it } from "vitest";
import { detectLanguage, splitSentences, summarize } from "./summarize";
import { validateFile, validateText, validateUrl } from "./validate";

const ARTIKEL = `Energi surya kini menjadi sumber listrik yang tumbuh paling cepat di dunia. Panel surya yang dulu mahal kini harganya turun drastis dalam sepuluh tahun terakhir. Penurunan harga panel surya membuat banyak negara mempercepat pembangunan pembangkit surya skala besar. Di Indonesia, pemerintah daerah mulai memasang panel surya di gedung sekolah dan kantor. Namun tantangan penyimpanan energi masih menjadi masalah utama bagi jaringan listrik. Baterai berkapasitas besar diperlukan agar listrik dari panel surya tetap tersedia pada malam hari. Para peneliti sedang menguji baterai baru yang lebih murah dan lebih tahan lama. Selain itu, dr. Rina menjelaskan bahwa perawatan panel surya relatif sederhana dibanding pembangkit lain. Biaya awal tetap menjadi hambatan bagi rumah tangga berpenghasilan rendah. Skema pembiayaan bersama dinilai dapat membantu mempercepat adopsi panel surya di perdesaan.`;

describe("splitSentences", () => {
  it("memecah kalimat tapi tidak memotong di singkatan", () => {
    const s = splitSentences(ARTIKEL);
    expect(s.length).toBe(10);
    expect(s.some((x) => x.includes("dr. Rina menjelaskan"))).toBe(true);
  });
  it("tidak memecah angka desimal", () => {
    expect(splitSentences("Nilainya 3.5 persen. Itu naik dari tahun lalu.")).toHaveLength(2);
  });
});

describe("summarize", () => {
  it("memilih kalimat asli, urutan terjaga, dan lebih pendek dari input", () => {
    const r = summarize(ARTIKEL, { length: "short" });
    const all = splitSentences(ARTIKEL);
    expect(r.points.length).toBeGreaterThanOrEqual(2);
    expect(r.points.length).toBeLessThanOrEqual(3);
    r.points.forEach((p) => expect(all).toContain(p));
    const idx = r.points.map((p) => all.indexOf(p));
    expect([...idx].sort((a, b) => a - b)).toEqual(idx);
    expect(r.outputWords).toBeLessThan(r.inputWords);
  });
  it("mode rinci menghasilkan lebih banyak poin daripada singkat", () => {
    expect(summarize(ARTIKEL, { length: "long" }).points.length)
      .toBeGreaterThan(summarize(ARTIKEL, { length: "short" }).points.length);
  });
  it("teks sangat pendek tidak error", () => {
    const r = summarize("Halo dunia. Ini tes.");
    expect(r.points.length).toBeGreaterThan(0);
  });
  it("mendeteksi bahasa", () => {
    expect(detectLanguage(ARTIKEL)).toBe("id");
    expect(detectLanguage("The quick brown fox jumps over the lazy dog and the cat is in the house with the boy")).toBe("en");
  });
});

describe("validate", () => {
  it("menolak teks kosong, pendek; menerima cukup panjang", () => {
    expect(validateText("")).toBeTruthy();
    expect(validateText("terlalu pendek")).toMatch(/pendek/);
    expect(validateText(ARTIKEL)).toBeNull();
  });
  it("memvalidasi URL", () => {
    expect(validateUrl("bukan url")).toBeTruthy();
    expect(validateUrl("ftp://x.com/a")).toMatch(/http/);
    expect(validateUrl("https://contoh.com/a")).toBeNull();
    expect(validateUrl("https://vimeo.com/1", { youtubeOnly: true })).toMatch(/YouTube/);
    expect(validateUrl("https://youtu.be/abc", { youtubeOnly: true })).toBeNull();
  });
  it("memvalidasi file", () => {
    expect(validateFile({ name: "a.exe", size: 10 }, "doc")).toMatch(/Format/);
    expect(validateFile({ name: "a.pdf", size: 99 * 1024 * 1024 }, "doc")).toMatch(/besar/);
    expect(validateFile({ name: "a.txt", size: 100 }, "text")).toBeNull();
    expect(validateFile({ name: "a.mp3", size: 100 }, "audio")).toBeNull();
  });
});
