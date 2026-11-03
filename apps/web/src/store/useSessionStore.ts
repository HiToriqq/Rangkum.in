import { create } from 'zustand';
import type {
  AudioSourceType,
  RecordingStatus,
  TranscriptSegment,
  MinutesData,
  QaMessage,
  ResultTabType,
  ToastState,
  ConfirmModalState,
} from '../types';

interface SessionState {
  // Audio Input State
  sourceType: AudioSourceType;
  audioFile: File | null;
  audioBlob: Blob | null;
  audioUrl: string | null;
  audioDuration: number;
  audioName: string;
  audioSize: number;
  recordingStatus: RecordingStatus;
  recordingDuration: number;
  urlInput: string;
  urlError: string | null;

  // Transcript State
  rawTranscript: string;
  editedTranscript: string;
  language: 'auto' | 'id' | 'en';
  detectedLanguage: string | null;
  segments: TranscriptSegment[];
  isTranscribing: boolean;
  transcriptError: string | null;
  hasTranscript: boolean;
  isMock: boolean;

  // Translation State
  translations: { id?: string; en?: string };
  activeTargetLang: 'id' | 'en';
  displayMode: 'original' | 'translated';
  isTranslating: boolean;
  translationError: string | null;

  // Minutes State
  minutesData: MinutesData | null;
  isGeneratingMinutes: boolean;
  minutesError: string | null;
  minutesSource: 'original' | 'translation';
  minutesLang: 'id' | 'en';

  // QA State
  qaMessages: QaMessage[];
  isAsking: boolean;
  qaError: string | null;

  // UI & Global State
  activeInputTab: AudioSourceType;
  activeResultTab: ResultTabType;
  toast: ToastState | null;
  confirmModal: ConfirmModalState | null;

  // Actions
  setActiveInputTab: (tab: AudioSourceType) => void;
  setActiveResultTab: (tab: ResultTabType) => void;
  
  // Audio Actions
  setAudioFromRecord: (blob: Blob, duration: number) => void;
  setAudioFromFile: (file: File, duration?: number) => void;
  setAudioFromUrl: (url: string) => void;
  setUrlInput: (url: string) => void;
  setUrlError: (err: string | null) => void;
  setRecordingStatus: (status: RecordingStatus) => void;
  setRecordingDuration: (duration: number) => void;
  clearAudio: () => void;
  resetSession: () => void;

  // Transcript Actions
  setLanguage: (lang: 'auto' | 'id' | 'en') => void;
  setTranscript: (text: string, segments?: TranscriptSegment[], detectedLang?: string | null, isMock?: boolean) => void;
  setEditedTranscript: (text: string) => void;
  restoreRawTranscript: () => void;
  setIsTranscribing: (val: boolean) => void;
  setTranscriptError: (err: string | null) => void;

  // Translation Actions
  setActiveTargetLang: (lang: 'id' | 'en') => void;
  setDisplayMode: (mode: 'original' | 'translated') => void;
  setTranslation: (lang: 'id' | 'en', text: string) => void;
  setIsTranslating: (val: boolean) => void;
  setTranslationError: (err: string | null) => void;

  // Minutes Actions
  setMinutesData: (data: MinutesData | null) => void;
  updateMinutesData: (updater: (prev: MinutesData) => MinutesData) => void;
  setMinutesSource: (source: 'original' | 'translation') => void;
  setMinutesLang: (lang: 'id' | 'en') => void;
  setIsGeneratingMinutes: (val: boolean) => void;
  setMinutesError: (err: string | null) => void;

  // QA Actions
  addQaMessage: (message: Omit<QaMessage, 'id' | 'timestamp'>) => void;
  clearQaMessages: () => void;
  setIsAsking: (val: boolean) => void;
  setQaError: (err: string | null) => void;

  // Feedback Actions
  showToast: (message: string, type?: ToastState['type']) => void;
  dismissToast: () => void;
  showConfirmModal: (modal: ConfirmModalState) => void;
  dismissConfirmModal: () => void;
}

const initialAudioState = {
  sourceType: 'record' as AudioSourceType,
  audioFile: null,
  audioBlob: null,
  audioUrl: null,
  audioDuration: 0,
  audioName: '',
  audioSize: 0,
  recordingStatus: 'idle' as RecordingStatus,
  recordingDuration: 0,
  urlInput: '',
  urlError: null,
};

const initialTranscriptState = {
  rawTranscript: '',
  editedTranscript: '',
  language: 'auto' as const,
  detectedLanguage: null,
  segments: [],
  isTranscribing: false,
  transcriptError: null,
  hasTranscript: false,
  isMock: false,
};

const initialTranslationState = {
  translations: {},
  activeTargetLang: 'en' as const,
  displayMode: 'original' as const,
  isTranslating: false,
  translationError: null,
};

const initialMinutesState = {
  minutesData: null,
  isGeneratingMinutes: false,
  minutesError: null,
  minutesSource: 'original' as const,
  minutesLang: 'id' as const,
};

const initialQaState = {
  qaMessages: [],
  isAsking: false,
  qaError: null,
};

export const useSessionStore = create<SessionState>((set, get) => ({
  ...initialAudioState,
  ...initialTranscriptState,
  ...initialTranslationState,
  ...initialMinutesState,
  ...initialQaState,
  activeInputTab: 'record',
  activeResultTab: 'transcript',
  toast: null,
  confirmModal: null,

  setActiveInputTab: (tab) => set({ activeInputTab: tab }),
  setActiveResultTab: (tab) => set({ activeResultTab: tab }),

  setAudioFromRecord: (blob, duration) => {
    // Revoke previous url if any
    const prevUrl = get().audioUrl;
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    const audioUrl = URL.createObjectURL(blob);
    set({
      sourceType: 'record',
      audioBlob: blob,
      audioFile: null,
      audioUrl,
      audioDuration: duration,
      audioName: `Rekaman_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.webm`,
      audioSize: blob.size,
      recordingStatus: 'stopped',
      recordingDuration: duration,
    });
  },

  setAudioFromFile: (file, duration = 0) => {
    const prevUrl = get().audioUrl;
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    const audioUrl = URL.createObjectURL(file);
    set({
      sourceType: 'file',
      audioFile: file,
      audioBlob: file,
      audioUrl,
      audioDuration: duration,
      audioName: file.name,
      audioSize: file.size,
      urlError: null,
    });
  },

  setAudioFromUrl: (url) => {
    set({
      sourceType: 'url',
      audioFile: null,
      audioBlob: null,
      audioUrl: url,
      audioDuration: 0,
      audioName: url.split('/').pop()?.split('?')[0] || 'audio-stream',
      audioSize: 0,
      urlInput: url,
      urlError: null,
    });
  },

  setUrlInput: (url) => set({ urlInput: url, urlError: null }),
  setUrlError: (err) => set({ urlError: err }),
  setRecordingStatus: (status) => set({ recordingStatus: status }),
  setRecordingDuration: (duration) => set({ recordingDuration: duration }),

  clearAudio: () => {
    const prevUrl = get().audioUrl;
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    set({
      ...initialAudioState,
      activeInputTab: get().activeInputTab,
    });
  },

  resetSession: () => {
    const prevUrl = get().audioUrl;
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    set({
      ...initialAudioState,
      ...initialTranscriptState,
      ...initialTranslationState,
      ...initialMinutesState,
      ...initialQaState,
      activeInputTab: 'record',
      activeResultTab: 'transcript',
    });
  },

  setLanguage: (lang) => set({ language: lang }),
  
  setTranscript: (text, segments = [], detectedLang = null, isMock = false) => {
    set({
      rawTranscript: text,
      editedTranscript: text,
      segments,
      detectedLanguage: detectedLang,
      hasTranscript: Boolean(text.trim()),
      isTranscribing: false,
      transcriptError: null,
      isMock,
    });
  },

  setEditedTranscript: (text) => set({ editedTranscript: text }),

  restoreRawTranscript: () => {
    const raw = get().rawTranscript;
    set({ editedTranscript: raw });
  },

  setIsTranscribing: (val) => set({ isTranscribing: val }),
  setTranscriptError: (err) => set({ transcriptError: err, isTranscribing: false }),

  setActiveTargetLang: (lang) => set({ activeTargetLang: lang }),
  setDisplayMode: (mode) => set({ displayMode: mode }),

  setTranslation: (lang, text) => {
    set((state) => ({
      translations: {
        ...state.translations,
        [lang]: text,
      },
      isTranslating: false,
      translationError: null,
    }));
  },

  setIsTranslating: (val) => set({ isTranslating: val }),
  setTranslationError: (err) => set({ translationError: err, isTranslating: false }),

  setMinutesData: (data) => set({ minutesData: data, isGeneratingMinutes: false, minutesError: null }),
  
  updateMinutesData: (updater) => {
    const current = get().minutesData;
    if (!current) return;
    set({ minutesData: updater(current) });
  },

  setMinutesSource: (source) => set({ minutesSource: source }),
  setMinutesLang: (lang) => set({ minutesLang: lang }),
  setIsGeneratingMinutes: (val) => set({ isGeneratingMinutes: val }),
  setMinutesError: (err) => set({ minutesError: err, isGeneratingMinutes: false }),

  addQaMessage: (msg) => {
    const newMsg: QaMessage = {
      ...msg,
      id: `qa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };
    set((state) => ({
      qaMessages: [...state.qaMessages, newMsg],
      isAsking: false,
      qaError: null,
    }));
  },

  clearQaMessages: () => set({ qaMessages: [] }),
  setIsAsking: (val) => set({ isAsking: val }),
  setQaError: (err) => set({ qaError: err, isAsking: false }),

  showToast: (message, type = 'info') => {
    set({
      toast: {
        id: `toast_${Date.now()}`,
        message,
        type,
      },
    });
  },

  dismissToast: () => set({ toast: null }),

  showConfirmModal: (modal) => set({ confirmModal: modal }),
  dismissConfirmModal: () => set({ confirmModal: null }),
}));
