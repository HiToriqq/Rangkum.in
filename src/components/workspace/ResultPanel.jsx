import { useEffect, useRef, useState } from "react";
import { AlertCircle, Check, Copy, Download, RotateCcw, Sparkles } from "lucide-react";
import { downloadText, slugify, toMarkdown, toPlain } from "../../lib/format";

function CopyButton({ getText }) {
  const [done, setDone] = useState(false);
  const timer = useRef();
  useEffect(() => () => clearTimeout(timer.current), []);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(getText());
      setDone(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setDone(false), 1800);
    } catch { /* clipboard ditolak: tombol tetap dapat dicoba lagi */ }
  };
  return (
    <button type="button" className="btn btn--ghost btn--sm" onClick={copy}>
      {done ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      {done ? "Tersalin" : "Salin"}
      <span className="visually-hidden" role="status">{done ? "Ringkasan disalin ke clipboard" : ""}</span>
    </button>
  );
}

export default function ResultPanel({ status, result, error, onRetry, view, setView }) {
  const headingRef = useRef(null);
  useEffect(() => { if (status === "done") headingRef.current?.focus({ preventScroll: true }); }, [status, result?.id]);

  if (status === "loading") {
    return (
      <section className="panel result-panel" aria-labelledby="result-h" aria-busy="true">
        <h2 id="result-h" className="visually-hidden">Hasil</h2>
        <div role="status" className="loading">
          <p className="loading__text">Merangkum…</p>
          <div className="skeleton" /><div className="skeleton" /><div className="skeleton skeleton--short" />
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="panel result-panel" aria-labelledby="result-h">
        <h2 id="result-h" className="visually-hidden">Hasil</h2>
        <div className="state state--error" role="alert">
          <AlertCircle size={22} aria-hidden="true" />
          <p className="state__title">Ringkasan gagal dibuat</p>
          <p className="dim">{error}</p>
          <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}><RotateCcw size={16} aria-hidden="true" /> Coba lagi</button>
        </div>
      </section>
    );
  }

  if (status !== "done" || !result) {
    return (
      <section className="panel result-panel" aria-labelledby="result-h">
        <h2 id="result-h" className="visually-hidden">Hasil</h2>
        <div className="state">
          <Sparkles size={22} aria-hidden="true" />
          <p className="state__title">Hasil ringkasan muncul di sini</p>
          <p className="dim">Tempel teks atau pilih sumber di sebelah kiri, lalu tekan Rangkum.</p>
        </div>
      </section>
    );
  }

  const ratio = result.inputWords ? Math.max(1, Math.round((1 - result.outputWords / result.inputWords) * 100)) : null;
  return (
    <section className="panel result-panel" aria-labelledby="result-h">
      <header className="result-head">
        <h2 id="result-h" className="result-title" tabIndex={-1} ref={headingRef}>{result.title}</h2>
        <ul className="chips mono">
          <li>{result.source.label}</li>
          <li>{result.language === "en" ? "English" : "Bahasa Indonesia"}</li>
          {result.inputWords ? <li>{result.inputWords.toLocaleString("id-ID")} → {result.outputWords.toLocaleString("id-ID")} kata{ratio ? ` (−${ratio}%)` : ""}</li> : null}
          <li>{result.engine === "local" ? "Ekstraktif · di browser" : "Via server"}</li>
        </ul>
      </header>

      <div className="result-toolbar">
        <div role="radiogroup" aria-label="Tampilan hasil" className="segmented segmented--sm">
          {[["bullets", "Poin-poin"], ["paragraph", "Paragraf"]].map(([v, l]) => (
            <button key={v} type="button" role="radio" aria-checked={view === v} className="segmented__btn" onClick={() => setView(v)}>{l}</button>
          ))}
        </div>
        <div className="result-actions">
          <CopyButton getText={() => toPlain(result, view)} />
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => downloadText(`${slugify(result.title)}.md`, toMarkdown(result, view))}>
            <Download size={16} aria-hidden="true" /> Unduh .md
          </button>
        </div>
      </div>

      {view === "bullets" ? (
        <ul className="points">{result.points.map((p, i) => <li key={i}>{p}</li>)}</ul>
      ) : (
        <p className="paragraph">{result.paragraph}</p>
      )}

      {result.engine === "local" ? (
        <p className="note">Ringkasan ekstraktif: kalimat dipilih langsung dari teks asli, tanpa ditulis ulang. Cocok untuk artikel dan catatan yang runtut.</p>
      ) : null}
    </section>
  );
}
