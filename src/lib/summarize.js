// Peringkas ekstraktif lokal: memilih kalimat terpenting dari teks asli (tidak menulis ulang / tidak mengarang).
// Skor kalimat = rata-rata frekuensi kata penting (TF) dengan bonus kecil untuk kalimat pembuka.

const STOPWORDS = {
  id: new Set(("yang dan di ke dari untuk pada dengan ini itu adalah akan juga atau dalam oleh sebagai karena " +
    "tidak ada para saat dapat sudah telah bisa lebih serta agar bahwa mereka kami kita saya anda dia nya " +
    "tersebut hanya masih sangat namun tetapi sehingga ketika setelah sebelum antara seperti hingga setiap " +
    "yaitu yakni dll dsb dst pun lah kah jika bila maka lalu kemudian sedang belum sudah harus mau akan").split(" ")),
  en: new Set(("the and of to in a is that for it as was with be by on not he she this are or his her from at an " +
    "have had but they which you were their we can if has one all would there been so about into more than " +
    "when what who will no its also these those them then out up our may other only over such any some").split(" ")),
};

const LENGTHS = {
  short: { ratio: 0.12, min: 2, max: 3 },
  medium: { ratio: 0.2, min: 3, max: 6 },
  long: { ratio: 0.3, min: 5, max: 10 },
};
export const LENGTH_OPTIONS = Object.keys(LENGTHS);

const ABBREVIATIONS = /\b(dr|drs|prof|ir|jl|no|hal|mis|dll|dsb|dst|yg|dgn|tgl|sdr|bpk|st|vs|etc|e\.g|i\.e|mr|mrs|ms)\.$/i;

const tokenize = (s) => s.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
export const countWords = (s) => tokenize(s).length;

export function detectLanguage(text) {
  const words = tokenize(text).slice(0, 400);
  let id = 0, en = 0;
  for (const w of words) {
    if (STOPWORDS.id.has(w)) id++;
    if (STOPWORDS.en.has(w)) en++;
  }
  return en > id * 1.2 ? "en" : "id";
}

export function splitSentences(text) {
  const clean = text.replace(/\r/g, "").replace(/[ \t]+/g, " ").trim();
  const out = [];
  for (const block of clean.split(/\n+/)) {
    const parts = block.split(/(?<=[.!?…])\s+(?=["“([]?[\p{Lu}\p{N}])/u);
    let buf = "";
    for (const part of parts) {
      buf = buf ? `${buf} ${part}` : part;
      if (ABBREVIATIONS.test(part.trim())) continue; // singkatan, bukan akhir kalimat
      out.push(buf.trim());
      buf = "";
    }
    if (buf) out.push(buf.trim());
  }
  return out.filter(Boolean);
}

const truncate = (s, n) => {
  if (s.length <= n) return s;
  const cut = s.slice(0, n).replace(/\s+\S*$/, "");
  return `${cut}…`;
};

export function summarize(text, { length = "medium" } = {}) {
  const cfg = LENGTHS[length] ?? LENGTHS.medium;
  const language = detectLanguage(text);
  const stop = STOPWORDS[language];
  const all = splitSentences(text);
  const inputWords = countWords(text);

  // Kalimat terlalu pendek (judul/ornamen) tidak dipertimbangkan sebagai poin.
  const candidates = all.map((s, i) => ({ s, i, tokens: tokenize(s) })).filter((c) => c.tokens.length >= 5);
  const pool = candidates.length ? candidates : all.map((s, i) => ({ s, i, tokens: tokenize(s) }));

  const tf = new Map();
  for (const w of tokenize(text)) {
    if (w.length > 2 && !stop.has(w)) tf.set(w, (tf.get(w) ?? 0) + 1);
  }

  const scored = pool.map((c) => {
    const keys = c.tokens.filter((w) => tf.has(w));
    const base = keys.reduce((sum, w) => sum + tf.get(w), 0) / Math.sqrt(c.tokens.length);
    const lead = c.i === 0 ? 1.25 : 1;
    const longPenalty = c.tokens.length > 60 ? 0.7 : 1;
    return { ...c, score: base * lead * longPenalty };
  });

  const n = Math.min(pool.length, Math.max(cfg.min, Math.min(cfg.max, Math.round(pool.length * cfg.ratio))));
  const picked = [...scored].sort((a, b) => b.score - a.score).slice(0, n).sort((a, b) => a.i - b.i);
  const points = picked.map((p) => p.s);
  const paragraph = points.join(" ");

  return {
    title: truncate((all[0] ?? "").replace(/[.!?…]+$/, ""), 80) || "Tanpa judul",
    points,
    paragraph,
    language,
    inputWords,
    outputWords: countWords(paragraph),
  };
}
