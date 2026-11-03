import { z } from 'zod';

export interface TranscriptionSegment {
  start: number;
  end: number;
  text: string;
  speaker?: string;
}

export interface TranscriptionResult {
  text: string;
  language: string;
  segments?: TranscriptionSegment[];
  isMock?: boolean;
}

export const ActionItemSchema = z.object({
  task: z.string().min(1, 'Tugas wajib diisi'),
  owner: z.string().default('Tidak disebutkan'),
  dueDate: z.string().default('Tidak disebutkan'),
});

export const MinutesSchema = z.object({
  title: z.string().min(1, 'Judul wajib diisi'),
  summary: z.string().min(1, 'Ringkasan wajib diisi'),
  discussionPoints: z.array(z.string()).default([]),
  decisions: z.array(z.string()).default([]),
  actionItems: z.array(ActionItemSchema).default([]),
  openIssues: z.array(z.string()).default([]),
  notes: z.array(z.string()).default([]),
  needsVerification: z.boolean().optional().default(false),
});

export type ActionItem = z.infer<typeof ActionItemSchema>;
export type MinutesData = z.infer<typeof MinutesSchema>;

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface QaResponse {
  answer: string;
  references?: string[];
}
