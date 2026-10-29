# Rangkum.in

Landing page dan aplikasi ringkasan untuk teks, artikel web, dokumen, dan video/audio.
React 19 + Vite 8, JavaScript, tanpa library UI/router tambahan.

## Menjalankan

```bash
npm install
npm run dev        # http://localhost:5173  (landing: #/  ·  aplikasi: #/app)
npm test           # unit test peringkas & validasi
npm run lint
npm run build      # keluaran statis di dist/
```

## Apa yang sudah berfungsi tanpa backend

| Sumber | Status |
|---|---|
| Teks tempel | Berfungsi penuh, diproses di browser |
| File `.txt` / `.md` | Berfungsi penuh, dibaca di browser |
| URL artikel, PDF/DOCX, YouTube, audio/video | UI + validasi lengkap; **membutuhkan backend** |

Peringkas lokal bersifat **ekstraktif** (`src/lib/summarize.js`): memilih kalimat asli berdasarkan skor
frekuensi kata penting, tanpa menulis ulang. Bahasa Indonesia dan Inggris terdeteksi otomatis.
Tanpa backend, sumber yang butuh server **dinonaktifkan dengan pesan yang jelas**, bukan menghasilkan
ringkasan palsu.

## Menghubungkan backend

Salin `.env.example` menjadi `.env`, isi `VITE_API_URL=https://api.contoh.com` (tanpa slash akhir), build ulang.

`POST {VITE_API_URL}/api/summarize`

| Sumber | Body |
|---|---|
| URL artikel / YouTube | `application/json`: `{ "type": "url" \| "video", "url": "...", "options": { "length": "short" \| "medium" \| "long" } }` |
| Dokumen / audio | `multipart/form-data`: `type` (`file` \| `audio`), `file`, `options` (string JSON) |

Respons sukses `200`:

```json
{ "title": "string", "points": ["kalimat 1", "kalimat 2"], "paragraph": "opsional", "language": "id|en", "inputWords": 900 }
```

Galat `4xx/5xx`: `{ "error": "pesan yang aman ditampilkan ke pengguna" }`.
Backend wajib mengaktifkan CORS untuk origin aplikasi, memvalidasi tipe/ukuran file di sisi server,
dan melindungi pengambilan URL dari SSRF (blokir IP privat/loopback). Validasi di klien hanya kenyamanan,
bukan batas keamanan. Batas klien ada di `src/lib/validate.js` (teks 40 kata–60.000 karakter; file 2/15/25 MB).

## Struktur

```
src/
  lib/          summarize (+test) · validate · api · run (orkestrasi) · format
  hooks/        useTheme · useHashRoute · useHistory (localStorage, maks 20)
  pages/        Landing · Workspace
  components/   landing/ · workspace/ (InputPanel, ResultPanel, Sidebar) · common/
  styles/       tokens (tema terang/gelap) · base · landing · app
```

Routing memakai hash (`#/app`) sehingga bisa di-hosting statis (GitHub Pages dll) tanpa konfigurasi rewrite.
Riwayat hanya disimpan di browser pengguna.

## Aksesibilitas

Tab dengan panah kiri/kanan, radiogroup untuk opsi, status/alert untuk loading dan galat, fokus pindah ke
judul hasil, skip link, `prefers-reduced-motion`, kontras tema ≥ 5:1.
