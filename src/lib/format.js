export function toMarkdown(r, mode = "bullets") {
  const body = mode === "bullets" ? r.points.map((p) => `- ${p}`).join("\n") : r.paragraph;
  return `# ${r.title}\n\nSumber: ${r.source.label}\n\n${body}\n`;
}

export function toPlain(r, mode = "bullets") {
  return mode === "bullets" ? r.points.map((p) => `• ${p}`).join("\n") : r.paragraph;
}

export function downloadText(filename, text) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/markdown;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const slugify = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-+|-+$/g, "").slice(0, 50) || "ringkasan";

export const timeAgo = (ts) => {
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return "baru saja";
  if (s < 3600) return `${Math.floor(s / 60)} mnt lalu`;
  if (s < 86400) return `${Math.floor(s / 3600)} jam lalu`;
  return new Date(ts).toLocaleDateString("id-ID", { day: "numeric", month: "short" });
};
