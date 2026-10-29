import { useState } from "react";
import { History, Plus, Trash2 } from "lucide-react";
import { timeAgo } from "../../lib/format";

export default function Sidebar({ items, activeId, onSelect, onNew, onRemove, onClear }) {
  const [confirm, setConfirm] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <aside className="sidebar" aria-label="Riwayat">
      <div className="sidebar__top">
        <button type="button" className="btn btn--primary btn--sm sidebar__new" onClick={() => { onNew(); setOpen(false); }}>
          <Plus size={16} aria-hidden="true" /> Ringkasan baru
        </button>
        <button type="button" className="btn btn--ghost btn--sm sidebar__toggle" aria-expanded={open} aria-controls="history-list" onClick={() => setOpen((v) => !v)}>
          <History size={16} aria-hidden="true" /> Riwayat ({items.length})
        </button>
      </div>

      <div id="history-list" className={`sidebar__list${open ? " is-open" : ""}`}>
        <p className="sidebar__title mono dim">Riwayat</p>
        {items.length === 0 ? (
          <p className="dim sidebar__empty">Belum ada ringkasan. Hasil Anda tersimpan di browser ini.</p>
        ) : (
          <ul>
            {items.map((it) => (
              <li key={it.id} className="history-item">
                <button type="button" className="history-item__main" aria-current={it.id === activeId ? "true" : undefined} onClick={() => { onSelect(it); setOpen(false); }}>
                  <span className="history-item__title">{it.title}</span>
                  <span className="history-item__meta mono dim">{it.source.label} · {timeAgo(it.createdAt)}</span>
                </button>
                <button type="button" className="icon-btn history-item__del" aria-label={`Hapus ringkasan ${it.title}`} onClick={() => onRemove(it.id)}>
                  <Trash2 size={15} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          confirm ? (
            <div className="sidebar__confirm">
              <span className="dim">Hapus semua riwayat?</span>
              <button type="button" className="btn btn--sm btn--ghost" onClick={() => setConfirm(false)}>Batal</button>
              <button type="button" className="btn btn--sm btn--danger" onClick={() => { onClear(); setConfirm(false); }}>Hapus</button>
            </div>
          ) : (
            <button type="button" className="link-btn" onClick={() => setConfirm(true)}>Hapus semua riwayat</button>
          )
        )}
      </div>
    </aside>
  );
}
