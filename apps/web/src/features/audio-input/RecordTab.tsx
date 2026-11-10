import React, { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Play, Square, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { formatDuration } from '../../lib/format';
import { getSupportedMimeType, MAX_RECORD_DURATION_SEC } from '../../lib/audio-utils';
import { AudioPlayer } from './AudioPlayer';

export const RecordTab: React.FC = () => {
  const {
    recordingStatus, recordingDuration, audioDuration, audioUrl, sourceType,
    setAudioFromRecord, setRecordingStatus, setRecordingDuration, clearAudio, showToast, showConfirmModal,
  } = useSessionStore();

  const [micError, setMicError] = useState<string | null>(null);
  const [isStarting, setIsStarting] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);
  const isMountedRef = useRef(false);
  const isStartingRef = useRef(false);
  const hasRecording = sourceType === 'record' && Boolean(audioUrl);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current?.state !== 'inactive') mediaRecorderRef.current?.stop();
      stopTracks();
    };
  }, []);

  const stopTracks = () => { streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      const cur = useSessionStore.getState().recordingDuration;
      if (cur >= MAX_RECORD_DURATION_SEC) { stopRecording(); showToast('Batas durasi rekaman tercapai.', 'warning'); }
      else setRecordingDuration(cur + 1);
    }, 1000);
  };

  const pauseTimer = () => { if (timerIntervalRef.current) { clearInterval(timerIntervalRef.current); timerIntervalRef.current = null; } };

  const startRecording = async () => {
    if (isStartingRef.current) return;
    setMicError(null); audioChunksRef.current = [];
    if (typeof MediaRecorder === 'undefined') { setMicError('Browser tidak mendukung perekaman audio.'); return; }
    isStartingRef.current = true; setIsStarting(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
      if (!isMountedRef.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      const mimeType = getSupportedMimeType();
      const recorder = new MediaRecorder(stream, { audioBitsPerSecond: 96000, ...(mimeType ? { mimeType } : {}) });
      mediaRecorderRef.current = recorder;
      recorder.ondataavailable = (e) => { if (e.data?.size > 0) audioChunksRef.current.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: recorder.mimeType || mimeType || 'audio/webm' });
        const dur = useSessionStore.getState().recordingDuration;
        if (blob.size === 0) { setRecordingStatus('idle'); setRecordingDuration(0); setMicError('Tidak ada audio terekam.'); stopTracks(); return; }
        setAudioFromRecord(blob, dur); stopTracks();
      };
      recorder.start(1000);
      setRecordingStatus('recording'); setRecordingDuration(0); startTimer();
      showToast('Perekaman dimulai.', 'info');
    } catch (err: unknown) {
      stopTracks();
      if (!isMountedRef.current) return;
      const e = err instanceof Error ? err : new Error('Kesalahan perangkat');
      if (e.name === 'NotAllowedError' || e.name === 'PermissionDeniedError') setMicError('Izin mikrofon ditolak. Berikan izin pada browser Anda.');
      else if (e.name === 'NotFoundError') setMicError('Perangkat mikrofon tidak ditemukan.');
      else setMicError(`Gagal mengakses mikrofon: ${e.message}`);
    } finally { isStartingRef.current = false; if (isMountedRef.current) setIsStarting(false); }
  };

  const pauseRecording = () => { mediaRecorderRef.current?.pause(); setRecordingStatus('paused'); pauseTimer(); showToast('Perekaman dijeda.', 'info'); };
  const resumeRecording = () => { mediaRecorderRef.current?.resume(); setRecordingStatus('recording'); startTimer(); showToast('Perekaman dilanjutkan.', 'info'); };
  const stopRecording = () => {
    if (mediaRecorderRef.current?.state !== 'inactive') {
      pauseTimer(); mediaRecorderRef.current?.stop(); setRecordingStatus('stopped'); showToast('Rekaman berhasil disimpan.', 'success');
    }
  };

  const handleDiscard = () => {
    showConfirmModal({
      title: 'Hapus dan Rekam Ulang?', message: 'Rekaman saat ini akan dibuang.',
      confirmLabel: 'Buang & Rekam Ulang', cancelLabel: 'Batal', isDestructive: true,
      onConfirm: () => { pauseTimer(); stopTracks(); clearAudio(); setRecordingStatus('idle'); setRecordingDuration(0); showToast('Rekaman dihapus.', 'info'); },
    });
  };

  const isRecording = recordingStatus === 'recording';
  const isPaused = recordingStatus === 'paused';
  const isStopped = recordingStatus === 'stopped' && hasRecording;

  return (
    <div className="flex flex-col gap-4">
      {micError && (
        <div className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)' }}>
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
          <div className="text-red-300"><p className="font-semibold">Perekaman Tidak Dapat Dilanjutkan</p><p className="mt-0.5 text-red-400/80">{micError}</p></div>
        </div>
      )}

      {/* Visualizer */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 rounded-xl text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(255,255,255,0.1)' }}>
        <div className="relative flex items-center justify-center mb-4">
          {isRecording && (
            <>
              <div className="absolute w-24 h-24 rounded-full animate-ping" style={{ background: 'rgba(185,104,75,0.2)' }} />
              <div className="absolute w-20 h-20 rounded-full animate-pulse" style={{ background: 'rgba(185,104,75,0.15)' }} />
            </>
          )}
          <div className="w-16 h-16 rounded-full flex items-center justify-center transition-all"
            style={{
              background: isRecording ? 'rgba(185,104,75,0.8)' : isPaused ? 'rgba(245,158,11,0.7)' : isStopped ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.06)',
              border: `1px solid ${isRecording ? 'rgba(185,104,75,0.6)' : 'rgba(255,255,255,0.12)'}`,
              boxShadow: isRecording ? '0 0 24px rgba(185,104,75,0.5)' : 'none',
            }}>
            <Mic className="w-7 h-7 text-white" />
          </div>
        </div>

        <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-white/90">
          {formatDuration(recordingDuration)}
        </span>
        <span className="text-xs mt-1 font-medium">
          {isRecording && <span className="inline-flex items-center gap-1.5 text-terracotta-400"><span className="w-2 h-2 rounded-full bg-terracotta-500 animate-pulse" />Merekam percakapan...</span>}
          {isPaused && <span className="text-amber-400">Perekaman dijeda</span>}
          {isStopped && <span className="text-emerald-400">Rekaman selesai & siap diproses</span>}
          {recordingStatus === 'idle' && <span className="text-white/30">Siap merekam. Tekan Mulai untuk memulai.</span>}
        </span>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
          {recordingStatus === 'idle' && (
            <button type="button" onClick={startRecording} disabled={isStarting}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold">
              {isStarting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mic className="w-4 h-4" />}
              {isStarting ? 'Mengakses Mikrofon...' : 'Mulai Rekam'}
            </button>
          )}
          {isRecording && (
            <>
              <button type="button" onClick={pauseRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white/70 transition-all"
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)' }}>
                <Pause className="w-4 h-4" /><span>Jeda</span>
              </button>
              <button type="button" onClick={stopRecording}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-semibold transition-all"
                style={{ background: 'rgba(185,104,75,0.7)', border: '1px solid rgba(185,104,75,0.5)', boxShadow: '0 0 16px rgba(185,104,75,0.3)' }}>
                <Square className="w-4 h-4" /><span>Berhenti & Simpan</span>
              </button>
            </>
          )}
          {isPaused && (
            <>
              <button type="button" onClick={resumeRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold"
                style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)' }}>
                <Play className="w-4 h-4" /><span>Lanjutkan</span>
              </button>
              <button type="button" onClick={stopRecording}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-xs sm:text-sm font-semibold"
                style={{ background: 'rgba(185,104,75,0.7)', border: '1px solid rgba(185,104,75,0.5)' }}>
                <Square className="w-4 h-4" /><span>Selesai</span>
              </button>
            </>
          )}
          {isStopped && (
            <button type="button" onClick={handleDiscard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-400 rounded-lg transition-colors"
              style={{ border: '1px solid rgba(239,68,68,0.25)', background: 'rgba(239,68,68,0.07)' }}>
              <Trash2 className="w-3.5 h-3.5" /><span>Hapus & Rekam Ulang</span>
            </button>
          )}
        </div>
      </div>

      {isStopped && audioUrl && (
        <AudioPlayer src={audioUrl} title="Hasil Rekaman Suara" fallbackDuration={audioDuration} />
      )}
    </div>
  );
};
