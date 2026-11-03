import type { SttProvider, SttOptions } from './stt.provider.js';
import type { TranscriptionResult } from '../../types/index.js';

export class MockSttProvider implements SttProvider {
  name = 'Mock STT Provider';

  async transcribe(_audioFilePath: string, options?: SttOptions): Promise<TranscriptionResult> {
    const isEnglish = options?.language === 'en';

    if (isEnglish) {
      return {
        text: "Good morning everyone. Today we are discussing the quarterly project deliverables and team responsibilities. Budi reported that the audio processing module is almost complete, but we still need to verify the external provider integration. Siti mentioned that the user interface is ready and responsive on mobile devices. For next steps, Budi will complete the API tests by next Friday, and Siti will finalize the design assets. There was an inquiry regarding the [unclear] server budget which will be addressed in the next meeting.",
        language: 'en',
        segments: [
          {
            start: 0.0,
            end: 4.8,
            speaker: 'Pembicara 1',
            text: 'Good morning everyone. Today we are discussing the quarterly project deliverables and team responsibilities.',
          },
          {
            start: 5.1,
            end: 11.2,
            speaker: 'Pembicara 2',
            text: 'Budi reported that the audio processing module is almost complete, but we still need to verify the external provider integration.',
          },
          {
            start: 11.5,
            end: 16.4,
            speaker: 'Pembicara 3',
            text: 'Siti mentioned that the user interface is ready and responsive on mobile devices.',
          },
          {
            start: 16.8,
            end: 22.0,
            speaker: 'Pembicara 1',
            text: 'For next steps, Budi will complete the API tests by next Friday, and Siti will finalize the design assets.',
          },
          {
            start: 22.3,
            end: 27.5,
            speaker: 'Pembicara 2',
            text: 'There was an inquiry regarding the [unclear] server budget which will be addressed in the next meeting.',
          },
        ],
        isMock: true,
      };
    }

    return {
      text: "Selamat pagi rekan-rekan semua. Pada pertemuan hari ini kita membahas progres deliverable kuartal ini dan pembagian tanggung jawab tim. Budi menyampaikan bahwa modul pemrosesan audio dan normalisasi ffmpeg sudah hampir rampung, namun integrasi provider eksternal masih perlu pengujian ketat. Siti mengonfirmasi bahwa antarmuka pengguna Rangkum.in sudah responsif di desktop maupun mobile. Untuk tindak lanjut, Budi ditugaskan menyelesaikan integrasi API paling lambat Jumat depan, sedangkan Siti akan menyempurnakan panduan ekspor notulen. Terkait alokasi anggaran server [tidak jelas], hal ini akan diputuskan pada pertemuan lanjutan minggu depan.",
      language: 'id',
      segments: [
        {
          start: 0.0,
          end: 5.2,
          speaker: 'Pembicara 1',
          text: 'Selamat pagi rekan-rekan semua. Pada pertemuan hari ini kita membahas progres deliverable kuartal ini dan pembagian tanggung jawab tim.',
        },
        {
          start: 5.5,
          end: 12.4,
          speaker: 'Pembicara 2',
          text: 'Budi menyampaikan bahwa modul pemrosesan audio dan normalisasi ffmpeg sudah hampir rampung, namun integrasi provider eksternal masih perlu pengujian ketat.',
        },
        {
          start: 12.8,
          end: 17.6,
          speaker: 'Pembicara 3',
          text: 'Siti mengonfirmasi bahwa antarmuka pengguna Rangkum.in sudah responsif di desktop maupun mobile.',
        },
        {
          start: 18.0,
          end: 24.1,
          speaker: 'Pembicara 1',
          text: 'Untuk tindak lanjut, Budi ditugaskan menyelesaikan integrasi API paling lambat Jumat depan, sedangkan Siti akan menyempurnakan panduan ekspor notulen.',
        },
        {
          start: 24.5,
          end: 29.8,
          speaker: 'Pembicara 2',
          text: 'Terkait alokasi anggaran server [tidak jelas], hal ini akan diputuskan pada pertemuan lanjutan minggu depan.',
        },
      ],
      isMock: true,
    };
  }
}
