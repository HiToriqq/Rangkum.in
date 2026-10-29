const MB = 1024 * 1024;

export const LIMITS = {
  minWords: 40,
  maxChars: 60_000,
  textFileBytes: 2 * MB,
  docFileBytes: 15 * MB,
  audioFileBytes: 25 * MB,
};

export const FILE_KINDS = {
  text: { exts: [".txt", ".md"], max: LIMITS.textFileBytes, label: "TXT atau MD" },
  doc: { exts: [".txt", ".md", ".pdf", ".docx"], max: LIMITS.docFileBytes, label: "TXT, MD, PDF, atau DOCX" },
  audio: { exts: [".mp3", ".m4a", ".wav", ".mp4", ".webm"], max: LIMITS.audioFileBytes, label: "MP3, M4A, WAV, MP4, atau WEBM" },
};

const ext = (name) => (name.includes(".") ? `.${name.split(".").pop().toLowerCase()}` : "");
export const isLocalTextFile = (file) => FILE_KINDS.text.exts.includes(ext(file.name));

/** Semua validator mengembalikan pesan error (string) atau null bila valid. */
export function validateText(text) {
  const t = text.trim();
  if (!t) return "Tempel teks yang ingin diringkas.";
  if (t.length > LIMITS.maxChars) return `Teks terlalu panjang (maksimal ${LIMITS.maxChars.toLocaleString("id-ID")} karakter).`;
  const words = (t.match(/[\p{L}\p{N}]+/gu) ?? []).length;
  if (words < LIMITS.minWords) return `Teks terlalu pendek (${words} kata). Minimal ${LIMITS.minWords} kata agar ringkasan bermakna.`;
  return null;
}

export function validateUrl(value, { youtubeOnly = false } = {}) {
  const v = value.trim();
  if (!v) return "Masukkan alamat URL.";
  let u;
  try { u = new URL(v); } catch { return "Format URL tidak valid. Contoh: https://contoh.com/artikel"; }
  if (u.protocol !== "https:" && u.protocol !== "http:") return "Hanya URL http:// atau https:// yang didukung.";
  if (youtubeOnly && !/(^|\.)(youtube\.com|youtu\.be)$/.test(u.hostname)) return "Saat ini hanya tautan YouTube yang didukung untuk video.";
  return null;
}

export function validateFile(file, kind) {
  const rule = FILE_KINDS[kind];
  if (!file) return "Pilih file terlebih dahulu.";
  if (!rule.exts.includes(ext(file.name))) return `Format tidak didukung. Gunakan ${rule.label}.`;
  if (file.size === 0) return "File kosong.";
  if (file.size > rule.max) return `File terlalu besar (${(file.size / MB).toFixed(1)} MB). Maksimal ${rule.max / MB} MB.`;
  return null;
}

export const formatBytes = (b) => (b < MB ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / MB).toFixed(1)} MB`);
