import { useCallback, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import InputPanel from "../components/workspace/InputPanel";
import ResultPanel from "../components/workspace/ResultPanel";
import Sidebar from "../components/workspace/Sidebar";
import Logo from "../components/common/Logo";
import ThemeToggle from "../components/common/ThemeToggle";
import { useHistory } from "../hooks/useHistory";
import { runSummary, validateInput } from "../lib/run";

const EMPTY = { tab: "text", mode: "link", text: "", url: "", file: null, length: "medium" };

export default function Workspace() {
  const [input, setInput] = useState(EMPTY);
  const [status, setStatus] = useState("idle"); // idle | loading | done | error
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [view, setView] = useState("bullets");
  const history = useHistory();
  // Mengubah input menghapus pesan galat lama agar tidak menempel di tab lain.
  const update = useCallback((fn) => { setFieldError(""); setInput(fn); }, []);
  const abortRef = useRef(null);
  const resultRef = useRef(null);

  const submit = useCallback(async () => {
    const invalid = validateInput(input);
    setFieldError(invalid ?? "");
    if (invalid) return;

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setStatus("loading");
    setError("");
    resultRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    try {
      // jeda mikro agar status "memuat" sempat terlihat untuk proses lokal yang instan
      await new Promise((r) => setTimeout(r, 250));
      const res = await runSummary(input, { length: input.length }, ctrl.signal);
      if (ctrl.signal.aborted) return;
      setResult(res);
      setStatus("done");
      history.add(res);
    } catch (e) {
      if (ctrl.signal.aborted) return;
      setError(e.message || "Terjadi kesalahan tak terduga.");
      setStatus("error");
    }
  }, [input, history]);

  const cancel = () => { abortRef.current?.abort(); setStatus("idle"); };
  const reset = () => { abortRef.current?.abort(); setInput(EMPTY); setResult(null); setStatus("idle"); setFieldError(""); };
  const select = (item) => { abortRef.current?.abort(); setResult(item); setStatus("done"); resultRef.current?.scrollIntoView({ block: "nearest" }); };

  return (
    <>
      {/* Bukan anchor hash biasa: hash non-"#/app" akan dibaca router sebagai pindah ke landing. */}
      <a href="#/app" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById("workspace")?.focus(); }}>Lewati ke area kerja</a>
      <header className="app-header">
        <div className="app-header__bar">
          <Logo />
          <div className="app-header__actions">
            <a href="#/" className="btn btn--ghost btn--sm"><ArrowLeft size={16} aria-hidden="true" /> Beranda</a>
            <ThemeToggle />
          </div>
        </div>
      </header>
      <div className="workspace">
        <Sidebar items={history.items} activeId={result?.id} onSelect={select} onNew={reset} onRemove={history.remove} onClear={history.clear} />
        <main id="workspace" tabIndex={-1} className="workspace__main">
          <h1 className="visually-hidden">Buat ringkasan</h1>
          <InputPanel
            state={input} setState={update} onSubmit={submit} onCancel={cancel}
            loading={status === "loading"} error={fieldError}
          />
          <div ref={resultRef} className="workspace__result">
            <ResultPanel status={status} result={result} error={error} onRetry={submit} view={view} setView={setView} />
          </div>
        </main>
      </div>
    </>
  );
}
