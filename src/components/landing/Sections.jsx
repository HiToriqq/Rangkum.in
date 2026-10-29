import { ArrowRight, Check, Clock } from "lucide-react";

const SOURCES = [
  { n: "01", title: "Teks tempel", body: "Artikel, catatan rapat, atau bacaan kuliah. Ditempel langsung.", ready: true },
  { n: "02", title: "File .txt dan .md", body: "Unggah berkas teks; dibaca di perangkat Anda, tidak diunggah.", ready: true },
  { n: "03", title: "Artikel dari URL", body: "Tempel tautan; server mengambil dan membersihkan isi halaman.", ready: false },
  { n: "04", title: "PDF dan DOCX", body: "Ekstraksi teks dari dokumen di server, lalu diringkas.", ready: false },
  { n: "05", title: "Video dan audio", body: "Tautan YouTube atau berkas audio, ditranskripsi lalu diringkas.", ready: false },
];

export function Sources() {
  return (
    <section id="fitur" className="lp-section container" aria-labelledby="fitur-h">
      <div className="lp-section__head">
        <h2 id="fitur-h">Satu alat untuk banyak sumber</h2>
        <p className="dim">Sumber yang bisa diproses penuh di browser tersedia sekarang. Sisanya membutuhkan layanan backend.</p>
      </div>
      <ol className="sources">
        {SOURCES.map((s) => (
          <li key={s.n} className="source">
            <span className="source__n mono dim">{s.n}</span>
            <div>
              <h3>{s.title}</h3>
              <p className="dim">{s.body}</p>
            </div>
            <span className={`status mono${s.ready ? " status--ok" : ""}`}>
              {s.ready ? <Check size={14} aria-hidden="true" /> : <Clock size={14} aria-hidden="true" />}
              {s.ready ? "Tersedia" : "Perlu backend"}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

const STEPS = [
  ["Masukkan sumber", "Tempel teks, tautan, atau pilih file. Panjang dan format dicek sebelum diproses."],
  ["Pilih panjang", "Singkat untuk gambaran cepat, Sedang untuk keseimbangan, Rinci bila ada banyak poin penting."],
  ["Baca dan bawa pulang", "Lihat sebagai poin-poin atau paragraf, salin, atau unduh sebagai Markdown. Riwayat tersimpan di browser Anda."],
];

export function HowItWorks() {
  return (
    <section id="cara-kerja" className="lp-section lp-section--tint" aria-labelledby="cara-h">
      <div className="container">
        <div className="lp-section__head"><h2 id="cara-h">Cara kerja</h2></div>
        <ol className="steps">
          {STEPS.map(([t, b], i) => (
            <li key={t} className="step">
              <span className="step__n" aria-hidden="true">{i + 1}</span>
              <h3>{t}</h3>
              <p className="dim">{b}</p>
            </li>
          ))}
        </ol>
        <p className="method dim">
          <strong>Metodenya:</strong> peringkas ekstraktif. Setiap kalimat diberi skor dari seberapa sering kata pentingnya muncul di seluruh teks, lalu kalimat berskor tertinggi diambil dengan urutan asli. Karena kalimat tidak ditulis ulang, ringkasan tidak mengarang fakta, tetapi alur antar-poin bisa terasa melompat.
        </p>
      </div>
    </section>
  );
}

const FAQ = [
  ["Apakah teks saya dikirim ke server?", "Tidak untuk teks tempel dan file .txt/.md: keduanya diproses di browser. URL, dokumen PDF/DOCX, dan video/audio memerlukan backend, dan hanya dikirim ke server yang dikonfigurasi untuk aplikasi ini."],
  ["Seberapa akurat ringkasannya?", "Hasilnya adalah kalimat asli yang dipilih berdasarkan skor, bukan parafrasa. Cocok untuk artikel dan berita yang runtut; kurang cocok untuk teks yang sangat padat angka atau dialog."],
  ["Bahasa apa yang didukung?", "Bahasa Indonesia dan Inggris, terdeteksi otomatis dari teks."],
  ["Apa batasannya?", "Teks minimal 40 kata dan maksimal 60.000 karakter. Ukuran file: 2 MB untuk teks, 15 MB untuk dokumen, 25 MB untuk audio/video."],
  ["Di mana riwayat disimpan?", "Hanya di browser perangkat ini (localStorage). Menghapus data situs atau memakai mode privat akan menghapusnya."],
];

export function Faq() {
  return (
    <section id="faq" className="lp-section container" aria-labelledby="faq-h">
      <div className="lp-section__head"><h2 id="faq-h">Pertanyaan umum</h2></div>
      <div className="faq">
        {FAQ.map(([q, a]) => (
          <details key={q} className="faq__item">
            <summary>{q}</summary>
            <p className="dim">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function FinalCta() {
  return (
    <section className="final container" aria-labelledby="final-h">
      <h2 id="final-h">Mulai dari teks yang sedang Anda baca.</h2>
      <a href="#/app" className="btn btn--primary">Buka aplikasi <ArrowRight size={18} aria-hidden="true" /></a>
    </section>
  );
}

export function LandingFooter() {
  return (
    <footer className="lp-footer">
      <div className="container lp-footer__inner mono dim">
        <span>© {new Date().getFullYear()} Rangkum.in</span>
        <a href="#top" className="lp-footer__top">Kembali ke atas ↑</a>
      </div>
    </footer>
  );
}
