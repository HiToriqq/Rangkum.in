import { useId, useRef, useState } from "react";
import { FileText, Link2, Mic, Upload, X } from "lucide-react";
import { hasBackend } from "../../lib/api";
import { countWords, LENGTH_OPTIONS } from "../../lib/summarize";
import { FILE_KINDS, formatBytes } from "../../lib/validate";
import { needsBackend } from "../../lib/run";

const TABS = [
  { id: "text", label: "Teks", Icon: FileText },
  { id: "url", label: "Artikel (URL)", Icon: Link2 },
  { id: "file", label: "Dokumen", Icon: Upload },
  { id: "media", label: "Video / Audio", Icon: Mic },
];
const LENGTH_LABEL = { short: "Singkat", medium: "Sedang", long: "Rinci" };

function Dropzone({ kind, file, onFile, inputId, describedBy }) {
  const [over, setOver] = useState(false);
  const ref = useRef(null);
  const rule = FILE_KINDS[kind];
  const pick = (f) => { if (f) onFile(f); };

  if (file) {
    return (
      <div className="file-chip">
        <FileText size={18} aria-hidden="true" />
        <span className="file-chip__name">{file.name}</span>
        <span className="dim mono">{formatBytes(file.size)}</span>
        <button type="button" className="icon-btn" aria-label={`Hapus file ${file.name}`} onClick={() => { onFile(null); if (ref.current) ref.current.value = ""; }}>
          <X size={16} aria-hidden="true" />
        </button>
      </div>
    );
  }
  return (
    <label
      htmlFor={inputId}
      className={`dropzone${over ? " is-over" : ""}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files?.[0]); }}
    >
      <Upload size={22} aria-hidden="true" />
      <span><strong>Pilih file</strong> atau seret ke sini</span>
      <span className="dim mono">{rule.label} · maks {rule.max / 1048576} MB</span>
      <input
        ref={ref} id={inputId} type="file" className="visually-hidden"
        accept={rule.exts.join(",")} aria-describedby={describedBy}
        onChange={(e) => pick(e.target.files?.[0])}
      />
    </label>
  );
}

export default function InputPanel({ state, setState, onSubmit, onCancel, loading, error }) {
  const uid = useId();
  const { tab, mode, text, url, file, length } = state;
  const set = (patch) => setState((s) => ({ ...s, ...patch }));
  const backendNeeded = needsBackend({ tab, mode, file });
  const blocked = backendNeeded && !hasBackend();
  const noteId = `${uid}-note`;
  const errId = `${uid}-err`;

  const onTabKey = (e) => {
    const i = TABS.findIndex((t) => t.id === tab);
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (!dir) return;
    e.preventDefault();
    const next = TABS[(i + dir + TABS.length) % TABS.length].id;
    set({ tab: next });
    document.getElementById(`${uid}-tab-${next}`)?.focus();
  };

  return (
    <form className="panel input-panel" onSubmit={(e) => { e.preventDefault(); onSubmit(); }} noValidate>
      <div role="tablist" aria-label="Jenis sumber" className="tabs" onKeyDown={onTabKey}>
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id} id={`${uid}-tab-${id}`} type="button" role="tab"
            aria-selected={tab === id} aria-controls={`${uid}-panel`} tabIndex={tab === id ? 0 : -1}
            className="tab" onClick={() => set({ tab: id })}
          >
            <Icon size={16} aria-hidden="true" /> <span>{label}</span>
          </button>
        ))}
      </div>

      <div role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${tab}`} className="input-panel__body">
        {tab === "text" && (
          <div className="field">
            <label htmlFor={`${uid}-text`} className="field__label">Teks yang ingin diringkas</label>
            <textarea
              id={`${uid}-text`} className="textarea" rows={11} value={text}
              placeholder="Tempel artikel, catatan rapat, atau bacaan di sini…"
              aria-invalid={Boolean(error)} aria-describedby={error ? errId : undefined}
              onChange={(e) => set({ text: e.target.value })}
            />
            <p className="field__hint mono dim">{countWords(text).toLocaleString("id-ID")} kata · diproses di browser Anda</p>
          </div>
        )}

        {tab === "url" && (
          <div className="field">
            <label htmlFor={`${uid}-url`} className="field__label">Alamat artikel</label>
            <input
              id={`${uid}-url`} className="input" type="text" inputMode="url" autoComplete="off" spellCheck="false"
              placeholder="https://contoh.com/artikel" value={url}
              aria-invalid={Boolean(error)} aria-describedby={`${noteId}${error ? ` ${errId}` : ""}`}
              onChange={(e) => set({ url: e.target.value })}
            />
          </div>
        )}

        {tab === "file" && (
          <div className="field">
            <span className="field__label" id={`${uid}-flabel`}>Dokumen</span>
            <Dropzone kind="doc" file={file} onFile={(f) => set({ file: f })} inputId={`${uid}-file`} describedBy={noteId} />
          </div>
        )}

        {tab === "media" && (
          <div className="field">
            <div role="radiogroup" aria-label="Cara memberi sumber" className="segmented segmented--sm">
              {[["link", "Tautan YouTube"], ["upload", "Unggah audio/video"]].map(([v, l]) => (
                <button key={v} type="button" role="radio" aria-checked={mode === v} className="segmented__btn" onClick={() => set({ mode: v, file: null })}>{l}</button>
              ))}
            </div>
            {mode === "link" ? (
              <>
                <label htmlFor={`${uid}-yt`} className="field__label">Tautan video</label>
                <input
                  id={`${uid}-yt`} className="input" type="text" inputMode="url" autoComplete="off" spellCheck="false"
                  placeholder="https://www.youtube.com/watch?v=…" value={url}
                  aria-invalid={Boolean(error)} aria-describedby={`${noteId}${error ? ` ${errId}` : ""}`}
                  onChange={(e) => set({ url: e.target.value })}
                />
              </>
            ) : (
              <Dropzone kind="audio" file={file} onFile={(f) => set({ file: f })} inputId={`${uid}-media`} describedBy={noteId} />
            )}
          </div>
        )}

        <p id={noteId} className={`note${blocked ? " note--warn" : ""}`}>
          {blocked
            ? "Sumber ini membutuhkan layanan backend untuk mengambil dan memprosesnya, dan backend belum terhubung. Gunakan tab Teks atau file .txt/.md."
            : backendNeeded
              ? "Sumber ini dikirim ke server backend untuk diproses."
              : "Diproses sepenuhnya di browser. Tidak ada data yang dikirim ke server."}
        </p>

        {error ? <p id={errId} className="field__error" role="alert">{error}</p> : null}
      </div>

      <div className="input-panel__foot">
        <div className="field field--inline">
          <span className="field__label" id={`${uid}-len`}>Panjang</span>
          <div role="radiogroup" aria-labelledby={`${uid}-len`} className="segmented">
            {LENGTH_OPTIONS.map((l) => (
              <button key={l} type="button" role="radio" aria-checked={length === l} className="segmented__btn" onClick={() => set({ length: l })}>{LENGTH_LABEL[l]}</button>
            ))}
          </div>
        </div>
        {loading ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>Batalkan</button>
        ) : (
          <button type="submit" className="btn btn--primary" disabled={blocked} aria-describedby={blocked ? noteId : undefined}>Rangkum</button>
        )}
      </div>
    </form>
  );
}
