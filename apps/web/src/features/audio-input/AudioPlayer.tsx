import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { formatDuration } from '../../lib/format';

interface AudioPlayerProps {
  src: string;
  title?: string;
  fallbackDuration?: number;
  onDurationDetected?: (duration: number) => void;
}

export const AudioPlayer: React.FC<AudioPlayerProps> = ({
  src,
  title,
  fallbackDuration = 0,
  onDurationDetected,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const isDetectingDurationRef = useRef(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(fallbackDuration);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(fallbackDuration);
    isDetectingDurationRef.current = false;
  }, [src, fallbackDuration]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    }
  };

  const handleTimeUpdate = () => {
    if (!audioRef.current) return;
    if (isDetectingDurationRef.current) {
      isDetectingDurationRef.current = false;
      const detectedDuration = audioRef.current.duration;
      const actualDuration = Number.isFinite(detectedDuration) && detectedDuration > 0
        ? detectedDuration
        : audioRef.current.currentTime;
      if (actualDuration > 0) {
        setDuration(actualDuration);
        onDurationDetected?.(actualDuration);
      }
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    setCurrentTime(audioRef.current.currentTime);
  };

  const updateDuration = (value: number) => {
    if (!Number.isFinite(value) || value <= 0) return;
    setDuration(value);
    onDurationDetected?.(value);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    const dur = audioRef.current.duration;
    if (Number.isFinite(dur) && dur > 0) {
      updateDuration(dur);
    } else if (dur === Infinity) {
      isDetectingDurationRef.current = true;
      audioRef.current.currentTime = Number.MAX_SAFE_INTEGER;
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return;
    const seekTime = Number(e.target.value);
    audioRef.current.currentTime = seekTime;
    setCurrentTime(seekTime);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const handleRestart = () => {
    if (!audioRef.current) return;
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
  };

  return (
    <div className="w-full p-3 sm:p-3.5 bg-bg-surface rounded-xl border border-border shadow-card flex flex-col gap-2">
      <audio
        ref={audioRef}
        src={src}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onDurationChange={() => {
          if (!audioRef.current) return;
          const actualDuration = audioRef.current.duration;
          if (Number.isFinite(actualDuration) && actualDuration > 0) {
            updateDuration(actualDuration);
            if (isDetectingDurationRef.current) {
              isDetectingDurationRef.current = false;
              audioRef.current.currentTime = 0;
              setCurrentTime(0);
            }
          }
        }}
        onEnded={handleEnded}
        preload="metadata"
      />

      {title && (
        <div className="flex items-center justify-between text-xs text-txt-muted font-medium truncate">
          <span className="truncate pr-2">{title}</span>
          <span className="text-[11px] font-mono shrink-0">
            {formatDuration(currentTime)} / {formatDuration(duration)}
          </span>
        </div>
      )}

      {/* Seekbar and Controls */}
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={togglePlay}
          className="w-8 h-8 rounded-full bg-navy-800 hover:bg-navy-700 text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-sm"
          aria-label={isPlaying ? 'Jeda Audio' : 'Putar Audio'}
        >
          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          type="button"
          onClick={handleRestart}
          className="p-1.5 text-txt-muted hover:text-navy-800 rounded-md hover:bg-bg-subtle transition-colors shrink-0"
          aria-label="Putar dari awal"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>

        {/* Progress Slider */}
        <input
          type="range"
          min={0}
          max={duration || 100}
          step={0.1}
          value={currentTime}
          onChange={handleSeek}
          className="flex-1 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-terracotta-600 hover:accent-terracotta-700 focus:outline-none"
        />

        {/* Mute button */}
        <button
          type="button"
          onClick={toggleMute}
          className="p-1.5 text-txt-muted hover:text-navy-800 rounded-md hover:bg-bg-subtle transition-colors shrink-0"
          aria-label={isMuted ? 'Bunyikan' : 'Senyapkan'}
        >
          {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-500" /> : <Volume2 className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};
