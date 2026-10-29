import { summarizeRemote } from "./api";
import { countWords, summarize } from "./summarize";
import { isLocalTextFile, validateFile, validateText, validateUrl } from "./validate";

/** Sumber yang bisa diproses penuh di browser tanpa backend. */
export const needsBackend = ({ tab, file }) => {
  if (tab === "text") return false;
  if (tab === "file") return !(file && isLocalTextFile(file));
  return true; // url, video/audio
};

const newId = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`);

/** Validasi input; mengembalikan pesan error atau null. */
export function validateInput({ tab, mode, text, url, file }) {
  if (tab === "text") return validateText(text);
  if (tab === "url") return validateUrl(url);
  if (tab === "file") return validateFile(file, "doc");
  return mode === "link" ? validateUrl(url, { youtubeOnly: true }) : validateFile(file, "audio");
}

const sourceLabel = ({ tab, mode, text, url, file }) => {
  if (tab === "text") return `Teks tempel · ${countWords(text).toLocaleString("id-ID")} kata`;
  if (tab === "url") return new URL(url.trim()).hostname.replace(/^www\./, "");
  if (tab === "file" || mode === "upload") return file.name;
  return "YouTube";
};

export async function runSummary(input, options, signal) {
  const { tab, mode, text, url, file } = input;
  const base = { id: newId(), createdAt: Date.now(), source: { kind: tab, label: sourceLabel(input) }, options };

  if (!needsBackend(input)) {
    const raw = tab === "text" ? text : await file.text();
    const err = validateText(raw);
    if (err) throw new Error(err);
    return { ...base, ...summarize(raw, options), engine: "local" };
  }

  const type = tab === "url" ? "url" : tab === "file" ? "file" : mode === "link" ? "video" : "audio";
  const data = await summarizeRemote({ type, url: url?.trim(), file: tab === "file" || mode === "upload" ? file : undefined, options, signal });
  const paragraph = data.paragraph ?? data.points.join(" ");
  return {
    ...base,
    title: data.title || "Tanpa judul",
    points: data.points,
    paragraph,
    language: data.language ?? "id",
    inputWords: data.inputWords ?? null,
    outputWords: countWords(paragraph),
    engine: "remote",
  };
}
