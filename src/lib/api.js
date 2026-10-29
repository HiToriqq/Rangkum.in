// Lapisan akses backend. Kontrak (lihat README):
//   POST {VITE_API_URL}/api/summarize
//     JSON      : { type: "url" | "video", url, options }
//     multipart : type ("file" | "audio"), file, options (JSON string)
//   200 -> { title, points: string[], paragraph?, language?, inputWords? }
//   4xx/5xx -> { error: "pesan untuk pengguna" }

const BASE = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const TIMEOUT_MS = 120_000;

export const hasBackend = () => BASE.length > 0;

export class BackendNotConfiguredError extends Error {
  constructor() {
    super("Backend belum terhubung. Sumber ini memerlukan layanan server untuk mengambil dan memproses konten.");
    this.name = "BackendNotConfiguredError";
  }
}

export async function summarizeRemote({ type, url, file, options, signal }) {
  if (!hasBackend()) throw new BackendNotConfiguredError();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => ctrl.abort(), { once: true });

  try {
    const init = { method: "POST", signal: ctrl.signal };
    if (file) {
      const body = new FormData();
      body.append("type", type);
      body.append("file", file);
      body.append("options", JSON.stringify(options));
      init.body = body;
    } else {
      init.headers = { "Content-Type": "application/json" };
      init.body = JSON.stringify({ type, url, options });
    }

    let res;
    try {
      res = await fetch(`${BASE}/api/summarize`, init);
    } catch (e) {
      if (e.name === "AbortError") throw new Error(signal?.aborted ? "Dibatalkan." : "Permintaan terlalu lama. Coba lagi.", { cause: e });
      throw new Error("Tidak dapat menghubungi server. Periksa koneksi Anda.", { cause: e });
    }

    const data = await res.json().catch(() => null);
    if (!res.ok) throw new Error(data?.error || `Server mengembalikan kesalahan (${res.status}).`);
    if (!data || !Array.isArray(data.points) || data.points.length === 0) throw new Error("Respons server tidak valid.");
    return data;
  } finally {
    clearTimeout(timer);
  }
}
