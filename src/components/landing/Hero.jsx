import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { splitSentences, summarize } from "../../lib/summarize";

// Contoh nyata: ringkasan di bawah dihitung langsung oleh peringkas yang sama dengan aplikasi.
const SAMPLE = `Energi surya kini menjadi sumber listrik yang tumbuh paling cepat di dunia. Harga panel surya turun drastis dalam sepuluh tahun terakhir. Penurunan harga panel surya membuat banyak negara mempercepat pembangunan pembangkit surya skala besar. Di Indonesia, pemerintah daerah mulai memasang panel surya di gedung sekolah dan kantor. Namun tantangan penyimpanan energi masih menjadi masalah utama bagi jaringan listrik. Baterai berkapasitas besar diperlukan agar listrik dari panel surya tetap tersedia pada malam hari. Para peneliti sedang menguji baterai baru yang lebih murah dan lebih tahan lama. Biaya awal tetap menjadi hambatan bagi rumah tangga berpenghasilan rendah. Skema pembiayaan bersama dinilai dapat membantu mempercepat adopsi panel surya di perdesaan.`;

export default function Hero() {
  const { sentences, picked, inputWords, outputWords } = useMemo(() => {
    const r = summarize(SAMPLE, { length: "short" });
    return { sentences: splitSentences(SAMPLE), picked: new Set(r.points), inputWords: r.inputWords, outputWords: r.outputWords };
  }, []);

  return (
    <section className="hero container" aria-labelledby="hero-title">
      <div className="hero__copy">
        <p className="eyebrow mono">Ringkas teks · artikel · dokumen · video</p>
        <h1 id="hero-title" className="hero__title">Baca intinya.<br />Lewati sisanya.</h1>
        <p className="hero__lead">
          Rangkum.in memilih kalimat terpenting dari bacaan panjang, sehingga Anda tahu apakah sebuah artikel layak dibaca penuh atau cukup intinya saja.
        </p>
        <div className="hero__actions">
          <a href="#/app" className="btn btn--primary">Coba sekarang <ArrowRight size={18} aria-hidden="true" /></a>
          <a href="#cara-kerja" className="btn btn--ghost">Lihat cara kerja</a>
        </div>
        <p className="hero__fine dim">Teks tempel dan file .txt/.md diproses di browser Anda. Tidak perlu akun.</p>
      </div>

      <figure className="demo" aria-label="Contoh hasil ringkasan">
        <div className="demo__col">
          <p className="demo__label mono dim">Teks asli · {inputWords} kata</p>
          <p className="demo__text">
            {sentences.map((s, i) => (
              picked.has(s) ? <mark key={i}>{s} </mark> : <span key={i}>{s} </span>
            ))}
          </p>
        </div>
        <div className="demo__col demo__col--out">
          <p className="demo__label mono"><span className="demo__badge">Ringkasan · {outputWords} kata</span></p>
          <ul className="points points--demo">
            {[...picked].map((p, i) => <li key={i}>{p}</li>)}
          </ul>
        </div>
        <figcaption className="demo__caption mono dim">Contoh nyata: bagian yang ditandai adalah kalimat yang dipilih peringkas.</figcaption>
      </figure>
    </section>
  );
}
