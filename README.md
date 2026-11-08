# Rangkum.in — Voice to Minutes AI

> **Ubah Percakapan Menjadi Pemahaman.**  
> Aplikasi web cerdas end-to-end untuk merekam suara, mengimpor file audio, atau menautkan link audio langsung, lalu mengubahnya menjadi teks transkrip terverifikasi, terjemahan bilingual (ID ↔ EN), notulen rapat otomatis, dan asisten tanya-jawab AI berbasis rekaman.

---

## Daftar Isi
1. [Fitur Utama](#fitur-utama)
2. [Tech Stack & Arsitektur](#tech-stack--arsitektur)
3. [Prasyarat Sistem](#prasyarat-sistem)
4. [Instalasi & Pengaturan](#instalasi--pengaturan)
5. [Konfigurasi Environment (.env)](#konfigurasi-environment-env)
6. [Menjalankan Aplikasi](#menjalankan-aplikasi)
7. [Dokumentasi REST API](#dokumentasi-rest-api)
8. [Pipeline Audio & Keamanan](#pipeline-audio--keamanan)
9. [Pengujian (Testing & Quality Assurance)](#pengujian-testing--quality-assurance)
10. [Troubleshooting](#troubleshooting)
11. [Roadmap Versi V2](#roadmap-versi-v2)

---

## 1. Fitur Utama

- **Input Audio Fleksibel:**
  - **Rekam Suara Langsung:** Mulai, jeda (pause), lanjutkan (resume), berhenti, indikator durasi live, audio preview, buang & rekam ulang. Mikrofon dioptimalkan untuk percakapan (48 kbps, `audio/webm;codecs=opus` atau fallback `audio/mp4`).
  - **Import File:** Drag & drop file audio (.mp3, .wav, .m4a, .webm, .ogg, .flac, .aac) dengan validasi ukuran dan magic bytes sisi server.
  - **Gunakan Link:** Unduh audio dari URL publik langsung dengan proteksi SSRF tingkat lanjut.
- **Transkripsi Cerdas (Speech-to-Text):**
  - Teks transkrip dapat diedit langsung oleh pengguna.
  - Dilengkapi fitur pemulihan ke teks asli (*Restore Raw*).
  - Tampilan segmen waktu opsional (*timestamps* & *speaker labels*).
  - Penandaan bagian yang tidak terdengar jelas (`[tidak jelas]`).
- **Terjemahan Dua Arah (ID ↔ EN):**
  - Menerjemahkan transkrip antara Bahasa Indonesia dan English tanpa menimpa transkrip sumber asli.
  - Menjaga konteks, nama orang, istilah teknis, dan kode.
- **Notulen Rapat Otomatis:**
  - Menghasilkan ringkasan eksekutif, poin pembahasan, keputusan yang disepakati, dan *action items* (tugas, penanggung jawab/PIC, tenggat waktu).
  - Seluruh komponen notulen dapat diedit secara inline sebelum diekspor.
  - Transkrip adalah satu-satunya sumber fakta (tidak mengarang hal yang tidak disebutkan).
- **Tanya AI Berdasarkan Rekaman:**
  - Percakapan kontekstual interaktif atas isi rekaman.
  - Menggunakan algoritma perolehan konteks BM25 tanpa ketergantungan vector database.
  - Menjawab jujur bila topik tidak dibahas dalam rekaman.
- **Ekspor Dokumen:**
  - Salin teks sekali klik ke clipboard.
  - Unduh transkrip yang telah diedit sebagai berkas teks (`.txt`).
  - Ekspor notulen yang telah diedit sebagai berkas **TXT** atau dokumen **PDF**.

---

## 2. Tech Stack & Arsitektur

Monorepo terstruktur berbasis npm workspaces:

```text
rangkumin/
├── apps/
│   ├── web/                     # Frontend (React 19, TypeScript, Vite, Tailwind CSS, Zustand)
│   │   ├── src/
│   │   │   ├── components/      # Header, Hero, Toast, ConfirmModal
│   │   │   ├── features/
│   │   │   │   ├── audio-input/ # Record, File, Link, AudioPlayer
│   │   │   │   ├── transcript/  # Transcript Viewer & Editor
│   │   │   │   ├── translation/ # Translation Tab & View Modes
│   │   │   │   ├── minutes/     # Structured Minutes & Inline Editor
│   │   │   │   └── qa/          # Contextual Chat & Grounded QA
│   │   │   ├── lib/             # Format, Audio Validation
│   │   │   ├── store/           # Zustand Session Store
│   │   │   └── types/           # TypeScript Shared Types
│   │   └── public/              # Logo SVG, Icon Mark, Favicon
│   │
│   └── api/                     # Backend (Node.js, Express, TypeScript, Zod, ffmpeg, PDFKit)
│       ├── src/
│       │   ├── config/          # Zod Environment Validation
│       │   ├── controllers/     # Health, Transcribe, Translate, Minutes, QA, Export
│       │   ├── middleware/      # Error Handler, Multer Upload, Rate Limiter
│       │   ├── providers/
│       │   │   ├── stt/         # SttProvider (Mock, Groq Whisper, OpenAI Whisper)
│       │   │   └── llm/         # LlmProvider (Mock, Groq Llama 3, OpenAI GPT-4o-mini)
│       │   ├── routes/          # REST API Route Declarations
│       │   └── services/        # Audio Normalizer, SSRF Guard, Minutes, QA, Export PDF
│       └── dist/                # Compiled JavaScript
├── .env.example
├── package.json
└── README.md
```

---

## 3. Prasyarat Sistem

1. **Node.js**: Versi `20.x` atau lebih baru (`node -v`).
2. **NPM**: Versi `10.x` atau lebih baru (`npm -v`).
3. **FFmpeg**: Wajib terpasang di sistem PATH untuk normalisasi audio ke mono 16 kHz.
   - **Windows:** Pasang via winget `winget install Gyan.FFmpeg` atau unduh dari gyan.dev dan tambahkan ke Environment Variables PATH.
   - **macOS:** `brew install ffmpeg`
   - **Linux (Ubuntu/Debian):** `sudo apt update && sudo apt install ffmpeg`
   - Verifikasi instalasi:
     ```bash
     ffmpeg -version
     ```

---

## 4. Instalasi & Pengaturan

Clone repository dan pasang dependensi monorepo dari root direktori:

```bash
git clone https://github.com/HiToriqq/Rangkum.in.git
cd Rangkum.in

# Pasang dependensi untuk seluruh workspace (web & api)
npm install
```

---

## 5. Konfigurasi Environment (.env)

Salin berkas template konfigurasi:

```bash
cp .env.example .env
# Pada Windows PowerShell:
# copy .env.example .env
```

Buka berkas `.env` untuk mengatur konfigurasi AI provider:

```env
PORT=3001
CORS_ORIGIN=http://localhost:5173

# Pilih provider STT: "mock" | "groq" | "openai"
STT_PROVIDER=mock

# Pilih provider LLM: "mock" | "groq" | "openai" | "gemini"
LLM_PROVIDER=mock

# Isi API Key jika menggunakan provider nyata:
GROQ_API_KEY=gsk_...
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=...
```

> **Mode Mock:** `STT_PROVIDER=mock` mengembalikan contoh transkrip, bukan hasil dari audio yang dikirim. `LLM_PROVIDER=mock` tidak menghasilkan notulen atau jawaban Q&A agar isi rapat tidak direkayasa; kedua endpoint mengembalikan HTTP 503 dengan status provider yang belum tersedia. Terjemahan menampilkan pemberitahuan simulasi. Provider Groq/OpenAI yang dipilih tanpa API key mengembalikan error konfigurasi—tidak beralih diam-diam ke hasil mock.

---

## 6. Menjalankan Aplikasi

Anda dapat menjalankan Frontend dan Backend secara bersamaan atau terpisah:

### Menjalankan Frontend (Vite)
```bash
npm run dev
# Buka di browser: http://localhost:5173
```

### Menjalankan Backend API (Express)
Buka tab terminal baru pada direktori root:
```bash
npm run dev:api
# API aktif di: http://localhost:3001
```

Frontend menghubungi backend melalui proxy Vite (`/api`). Jalankan kedua perintah di terminal terpisah; indikator di header menunjukkan status koneksi dan provider STT aktif. Dengan `STT_PROVIDER=mock`, API mengembalikan contoh transkrip yang ditandai **Mock Provider Mode**—contoh tersebut bukan hasil dari audio yang diunggah. Untuk transkripsi audio nyata, pilih `groq` atau `openai`, atur API key terkait, dan pastikan FFmpeg tersedia di `PATH`.

### Menjalankan tes otomatis
```bash
npm test
```
Tes ditempatkan bersama kode yang diuji di file sumber dan hanya didaftarkan ketika dijalankan oleh Vitest. Untuk menambahkan tes, gunakan blok `if (import.meta.vitest)` pada file sumber terkait.

---

## 7. Dokumentasi REST API

| Method | Endpoint | Deskripsi | Input Utama |
|---|---|---|---|
| `GET` | `/api/health` | Cek status server dan provider aktif | - |
| `POST` | `/api/transcribe` | Transkripsikan file audio atau link URL | `multipart/form-data` (`audio`) ATAU `application/json` (`{ url, language }`) |
| `POST` | `/api/translate` | Menerjemahkan transkrip (ID ↔ EN) | `{ text, targetLanguage: "id" \| "en" }` |
| `POST` | `/api/minutes/generate` | Menghasilkan notulen rapat terstruktur | `{ transcript, language: "id" \| "en" }` |
| `POST` | `/api/qa/ask` | Bertanya kepada AI tentang rekaman | `{ question, transcript, history: [] }` |
| `POST` | `/api/export/pdf` | Ekspor notulen rapat ke format PDF resmi | `{ minutes: { title, summary, ... }, language }` |

---

## 8. Pipeline Audio & Keamanan

### Pipeline Audio Backend
1. **Penyimpanan Sementara:** Audio disimpan di direktori temp acak dengan nama yang di-hash.
2. **Validasi Magic Bytes:** Server memeriksa 32 byte pertama file untuk memastikan keaslian header audio (MP3, WAV, OGG, FLAC, WebM, M4A).
3. **Normalisasi FFmpeg:** Dikonversi secara otomatis ke format **mono 16 kHz PCM WAV** (`-ac 1 -ar 16000`), standar akurasi tertinggi untuk model Whisper.
4. **Guaranteed Cleanup:** Semua berkas audio sementara **wajib terhapus** pada blok `finally`, baik saat proses berhasil maupun gagal. Audio rekaman tidak pernah disimpan permanen.

### Proteksi SSRF (Server-Side Request Forgery) untuk Input Link
- Hanya mengizinkan skema `http://` dan `https://`.
- Menolak kredensial otentikasi di dalam URL (`user:pass@`).
- Melakukan resolusi DNS sebelum koneksi dan memblokir seluruh alamat IP privat, loopback, link-local, dan cloud metadata (`127.0.0.0/8`, `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `169.254.169.254`, `::1`, `fc00::/7`).
- Validasi IP berulang pada setiap pengalihan (*redirect*), dengan batas maksimal 3 redirect.
- Streaming unduhan dengan pembatasan ukuran (`MAX_UPLOAD_SIZE_MB`) dan batas waktu (*timeout* 25 detik).

---

## 9. Pengujian (Testing & Quality Assurance)

Jalankan rangkaian test otomatis:

```bash
# Menjalankan unit test frontend
npm run test -w @rangkumin/web

# Menjalankan test backend (SSRF guard & API integration)
npm run test -w @rangkumin/api

# Verifikasi TypeScript di seluruh workspace
npm run typecheck

# Build produksi
npm run build
```

---

## 10. Troubleshooting

- **Mikrofon tidak berfungsi di browser:**
  - Pastikan izin mikrofon telah diberikan pada icon gembok di address bar browser.
  - Browser memerlukan konteks aman (`localhost` atau `https://`).
- **Gagal normalisasi audio di backend:**
  - Pastikan `ffmpeg` telah terpasang di komputer dan dapat dipanggil lewat terminal (`ffmpeg -version`).
- **Tautan link audio gagal diproses:**
  - Pastikan tautan mengarah langsung ke file audio publik (contoh: diakhiri `.mp3` atau `.wav`).
  - Platform seperti YouTube, Google Drive, dan Zoom memerlukan token browser dan tidak didukung pada versi MVP.

---

## 11. Roadmap Versi V2

Fitur-fitur yang direncanakan untuk pengembangan fase berikutnya:
1. **Dukungan Platform Cloud:** Integrasi resmi audio extractor untuk YouTube, Google Drive, dan Zoom Cloud Recordings.
2. **Chunking Upload Bertahap:** Unggah file audio besar dari browser dalam beberapa potongan (*chunked multipart upload*).
3. **Speaker Diarization:** Deteksi otomatis multi-pembicara (Speaker A, Speaker B) secara terpisah menggunakan model neural diarization.
4. **Penyimpanan Permanen & Workspace Kolaborasi:** Database persisten (PostgreSQL) dan autentikasi multi-pengguna.
