import React, { useState, useRef, useEffect } from 'react';
import { Mic, Pause, Play, Square, Trash2, AlertCircle } from 'lucide-react';
import { useSessionStore } from '../../store/useSessionStore';
import { formatDuration } from '../../lib/format';
import { getSupportedMimeType, MAX_RECORD_DURATION_SEC } from '../../lib/audio-utils';
import { AudioPlayer } from './AudioPlayer';

export const RecordTab: React.FC = () => {
  const {
    recordingStatus,
    recordingDuration,
    audioUrl,
    setAudioFromRecord,
    setRecordingStatus,
    setRecordingDuration,
    clearAudio,
    showToast,
    showConfirmModal,
  } = useSessionStore();

  const [micError, setMicError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      stopMediaTracks();
    };
  }, []);

  const stopMediaTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startTimer = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = window.setInterval(() => {
      const current = useSessionStore.getState().recordingDuration;
      if (current >= MAX_RECORD_DURATION_SEC) {
        stopRecording();
        showToast('Batas durasi rekaman tercapai.', 'warning');
      } else {
        setRecordingDuration(current + 1);
      }
    }, 1000);
  };

  const pauseTimer = () => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
  };

  const startRecording = async () => {
    setMicError(null);
    audioChunksRef.current = [];

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Browser Anda tidak mendukung perekaman mikrofon langsung.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      const mimeType = getSupportedMimeType();

      const options: MediaRecorderOptions = {
        audioBitsPerSecond: 48000, // 48 kbps voice optimized
      };
      if (mimeType) {
        options.mimeType = mimeType;
      }

      const recorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        const finalBlob = new Blob(audioChunksRef.current, {
          type: recorder.mimeType || mimeType || 'audio/webm',
        });
        const duration = useSessionStore.getState().recordingDuration;
        setAudioFromRecord(finalBlob, duration);
        stopMediaTracks();
      };

      recorder.start(1000); // collect in 1s slices
      setRecordingStatus('recording');
      setRecordingDuration(0);
      startTimer();
      showToast('Perekaman dimulai.', 'info');
    } catch (err: unknown) {
      stopMediaTracks();
      const error = err as Error;
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setMicError('Izin akses mikrofon ditolak. Berikan izin mikrofon pada browser Anda untuk merekam.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setMicError('Perangkat mikrofon tidak ditemukan di sistem Anda.');
      } else {
        setMicError(`Gagal mengakses mikrofon: ${error.message || 'Kesalahan perangkat'}`);
      }
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'recording') {
      mediaRecorderRef.current.pause();
      setRecordingStatus('paused');
      pauseTimer();
      showToast('Perekaman dijeda.', 'info');
    }
  };

  const resumeRecording = () => {
    if (mediaRecorderRef.current && recordingStatus === 'paused') {
      mediaRecorderRef.current.resume();
      setRecordingStatus('recording');
      startTimer();
      showToast('Perekaman dilanjutkan.', 'info');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && (recordingStatus === 'recording' || recordingStatus === 'paused')) {
      pauseTimer();
      mediaRecorderRef.current.stop();
      setRecordingStatus('stopped');
      showToast('Rekaman berhasil disimpan.', 'success');
    }
  };

  const handleDiscard = () => {
    showConfirmModal({
      title: 'Hapus dan Rekam Ulang?',
      message: 'Rekaman saat ini akan dibuang dan tidak dapat dipulihkan.',
      confirmLabel: 'Buang & Rekam Ulang',
      cancelLabel: 'Batal',
      isDestructive: true,
      onConfirm: () => {
        pauseTimer();
        stopMediaTracks();
        clearAudio();
        setRecordingStatus('idle');
        setRecordingDuration(0);
        showToast('Rekaman telah dihapus.', 'info');
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Error alert if mic denied */}
      {micError && (
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-xs sm:text-sm">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Izin Mikrofon Diperlukan</p>
            <p className="mt-0.5">{micError}</p>
          </div>
        </div>
      )}

      {/* Recording Stage Visualizer & Timer */}
      <div className="flex flex-col items-center justify-center p-6 sm:p-8 bg-bg-base/60 rounded-xl border border-dashed border-border text-center">
        {/* Animated Visualizer Circle */}
        <div className="relative flex items-center justify-center mb-4">
          {recordingStatus === 'recording' && (
            <>
              <div className="absolute w-24 h-24 rounded-full bg-terracotta-500/20 animate-ping" />
              <div className="absolute w-20 h-20 rounded-full bg-terracotta-500/30 animate-pulse" />
            </>
          )}

          <div
            className={`w-16 h-16 rounded-full flex items-center justify-center transition-all ${
              recordingStatus === 'recording'
                ? 'bg-terracotta-600 text-white shadow-elevated scale-105'
                : recordingStatus === 'paused'
                ? 'bg-amber-500 text-white shadow-card'
                : recordingStatus === 'stopped' && audioUrl
                ? 'bg-navy-800 text-white'
                : 'bg-bg-surface border-2 border-border text-txt-muted'
            }`}
          >
            <Mic className="w-7 h-7" />
          </div>
        </div>

        {/* Live Timer */}
        <div className="flex flex-col items-center">
          <span className="font-mono text-2xl sm:text-3xl font-bold tracking-tight text-navy-800">
            {formatDuration(recordingDuration)}
          </span>
          <span className="text-xs text-txt-muted mt-1 font-medium">
            {recordingStatus === 'recording' && (
              <span className="inline-flex items-center gap-1.5 text-terracotta-600 font-semibold">
                <span className="w-2 h-2 rounded-full bg-terracotta-600 animate-pulse" />
                Merekam percakapan...
              </span>
            )}
            {recordingStatus === 'paused' && (
              <span className="text-amber-600 font-semibold">Perekaman dijeda</span>
            )}
            {recordingStatus === 'stopped' && audioUrl && (
              <span className="text-emerald-700 font-semibold">Rekaman selesai & siap diproses</span>
            )}
            {recordingStatus === 'idle' && 'Siap merekam. Tekan Mulai untuk memulai.'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {recordingStatus === 'idle' && (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
            >
              <Mic className="w-4 h-4 text-terracotta-400" />
              <span>Mulai Rekam</span>
            </button>
          )}

          {recordingStatus === 'recording' && (
            <>
              <button
                type="button"
                onClick={pauseRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-bg-surface hover:bg-border/60 border border-border text-xs sm:text-sm font-semibold text-txt-primary transition-colors active:scale-95 shadow-sm"
              >
                <Pause className="w-4 h-4 text-txt-muted" />
                <span>Jeda</span>
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-sm font-semibold transition-all shadow-sm active:scale-95"
              >
                <Square className="w-4 h-4" />
                <span>Berhenti & Simpan</span>
              </button>
            </>
          )}

          {recordingStatus === 'paused' && (
            <>
              <button
                type="button"
                onClick={resumeRecording}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-700 text-white text-xs sm:text-sm font-semibold transition-colors active:scale-95 shadow-sm"
              >
                <Play className="w-4 h-4" />
                <span>Lanjutkan</span>
              </button>
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-terracotta-600 hover:bg-terracotta-700 text-white text-xs sm:text-sm font-semibold transition-colors active:scale-95 shadow-sm"
              >
                <Square className="w-4 h-4" />
                <span>Selesai</span>
              </button>
            </>
          )}

          {recordingStatus === 'stopped' && audioUrl && (
            <button
              type="button"
              onClick={handleDiscard}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg border border-red-200 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus & Rekam Ulang</span>
            </button>
          )}
        </div>
      </div>

      {/* Audio Preview Player if recorded */}
      {recordingStatus === 'stopped' && audioUrl && (
        <div className="mt-1">
          <AudioPlayer src={audioUrl} title="Hasil Rekaman Suara" />
        </div>
      )}
    </div>
  );
};
