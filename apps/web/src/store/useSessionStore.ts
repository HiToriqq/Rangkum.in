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
import { getAudioFileExtension } from '../lib/audio-utils';

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
  translationIsMock: boolean;
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
  setTranslation: (lang: 'id' | 'en', text: string, isMock?: boolean) => void;
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
  translationIsMock: false,
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
    const prevUrl = get().audioUrl;
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    const audioUrl = URL.createObjectURL(blob);
    const extension = getAudioFileExtension(blob.type);
    set({
      sourceType: 'record',
      audioBlob: blob,
      audioFile: null,
      audioUrl,
      audioDuration: duration,
      audioName: `Rekaman_${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.${extension}`,
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
      recordingStatus: 'idle',
      recordingDuration: 0,
      urlError: null,
    });
  },

  setAudioFromUrl: (url) => {
    const prevUrl = get().audioUrl;
    if (prevUrl && prevUrl.startsWith('blob:')) {
      URL.revokeObjectURL(prevUrl);
    }
    set({
      sourceType: 'url',
      audioFile: null,
      audioBlob: null,
      audioUrl: url,
      audioDuration: 0,
      audioName: url.split('/').pop()?.split('?')[0] || 'audio-stream',
      audioSize: 0,
      recordingStatus: 'idle',
      recordingDuration: 0,
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
      ...initialTranslationState,
      ...initialMinutesState,
      ...initialQaState,
    });
  },

  setEditedTranscript: (text) => set({
    editedTranscript: text,
    translations: {},
    translationIsMock: false,
    isTranslating: false,
    translationError: null,
    minutesData: null,
    minutesError: null,
    ...initialQaState,
  }),

  restoreRawTranscript: () => {
    const raw = get().rawTranscript;
    get().setEditedTranscript(raw);
  },

  setIsTranscribing: (val) => set({ isTranscribing: val }),
  setTranscriptError: (err) => set({ transcriptError: err, isTranscribing: false }),

  setActiveTargetLang: (lang) => set({ activeTargetLang: lang }),
  setDisplayMode: (mode) => set({ displayMode: mode }),

  setTranslation: (lang, text, isMock = false) => {
    set((state) => ({
      translations: {
        ...state.translations,
        [lang]: text,
      },
      translationIsMock: isMock,
      isTranslating: false,
      translationError: null,
      minutesData: state.minutesSource === 'translation' ? null : state.minutesData,
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

  setMinutesSource: (source) => set((state) => source === state.minutesSource
    ? { minutesSource: source }
    : { minutesSource: source, minutesData: null, minutesError: null }),
  setMinutesLang: (lang) => set((state) => lang === state.minutesLang
    ? { minutesLang: lang }
    : { minutesLang: lang, minutesData: null, minutesError: null }),
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

  clearQaMessages: () => set({ ...initialQaState }),
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

if (import.meta.vitest) {
  const { afterEach, describe, expect, it } = import.meta.vitest;

  afterEach(() => {
    useSessionStore.getState().resetSession();
  });

  describe('Session state', () => {
    it('keeps the original transcript separate and marks simulated translations', () => {
      const store = useSessionStore.getState();
      store.setTranscript('Teks asli', [], 'id');
      store.setTranslation('en', '[Simulasi] Not available.', true);

      expect(useSessionStore.getState().rawTranscript).toBe('Teks asli');
      expect(useSessionStore.getState().editedTranscript).toBe('Teks asli');
      expect(useSessionStore.getState().translations.en).toBe('[Simulasi] Not available.');
      expect(useSessionStore.getState().translationIsMock).toBe(true);
    });

    it('invalidates translations when the edited source changes', () => {
      const store = useSessionStore.getState();
      store.setTranscript('Original transcript', [], 'en');
      store.setTranslation('id', 'Terjemahan', false);
      useSessionStore.getState().setEditedTranscript('Corrected transcript');

      expect(useSessionStore.getState().rawTranscript).toBe('Original transcript');
      expect(useSessionStore.getState().editedTranscript).toBe('Corrected transcript');
      expect(useSessionStore.getState().translations).toEqual({});
      expect(useSessionStore.getState().translationIsMock).toBe(false);
    });

    it('invalidates minutes when their transcript or selected source changes', () => {
      const store = useSessionStore.getState();
      store.setTranscript('Original transcript', [], 'en');
      store.setMinutesData({
        title: 'Old minutes',
        summary: 'Old summary',
        discussionPoints: [],
        decisions: [],
        actionItems: [],
        openIssues: [],
        notes: [],
      });

      useSessionStore.getState().setEditedTranscript('Corrected transcript');
      expect(useSessionStore.getState().minutesData).toBeNull();

      useSessionStore.getState().setMinutesData({
        title: 'New minutes',
        summary: 'New summary',
        discussionPoints: [],
        decisions: [],
        actionItems: [],
        openIssues: [],
        notes: [],
      });
      useSessionStore.getState().setMinutesSource('translation');
      expect(useSessionStore.getState().minutesData).toBeNull();
    });

    it('clears Q&A history and errors when its transcript changes', () => {
      const store = useSessionStore.getState();
      store.setTranscript('Original transcript', [], 'en');
      store.addQaMessage({ role: 'user', content: 'Old question' });
      useSessionStore.getState().addQaMessage({ role: 'assistant', content: 'Old answer' });

      useSessionStore.getState().setEditedTranscript('Updated transcript');
      expect(useSessionStore.getState().qaMessages).toEqual([]);
      expect(useSessionStore.getState().qaError).toBeNull();
      expect(useSessionStore.getState().isAsking).toBe(false);
    });
  });
}
