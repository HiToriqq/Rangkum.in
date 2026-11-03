export type AudioSourceType = 'record' | 'file' | 'url';

export type RecordingStatus = 'idle' | 'recording' | 'paused' | 'stopped';

export interface TranscriptSegment {
  id?: string;
  start: number; // seconds
  end: number;   // seconds
  text: string;
  speaker?: string;
}

export interface MinutesActionItem {
  task: string;
  owner: string;
  dueDate: string;
}

export interface MinutesData {
  title: string;
  summary: string;
  discussionPoints: string[];
  decisions: string[];
  actionItems: MinutesActionItem[];
  openIssues: string[];
  notes: string[];
  needsVerification?: boolean;
}

export interface QaMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  references?: string[];
}

export type ResultTabType = 'transcript' | 'translation' | 'minutes' | 'qa';

export interface ToastState {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

export interface ConfirmModalState {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
}
