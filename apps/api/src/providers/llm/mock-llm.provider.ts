import type { LlmProvider } from './llm.provider.js';
import type { MinutesData, ChatMessage, QaResponse } from '../../types/index.js';

export class MockLlmProvider implements LlmProvider {
  name = 'Mock LLM Provider';

  async translate(text: string, targetLanguage: 'id' | 'en'): Promise<string> {
    if (targetLanguage === 'en') {
      // Mock Indonesian -> English translation
      return (
        "Good morning everyone. In today's meeting, we discussed the progress of this quarter's deliverables and team responsibilities. " +
        "Budi reported that the audio processing and ffmpeg normalization module is almost complete, but integration with external providers still requires thorough testing. " +
        "Siti confirmed that the Rangkum.in user interface is responsive on both desktop and mobile devices. " +
        "For follow-up actions, Budi is assigned to finalize the API integration by next Friday at the latest, while Siti will refine the minutes export guide. " +
        "Regarding the server budget allocation [unclear], this will be decided in next week's follow-up meeting."
      );
    }

    // Mock English -> Indonesian translation
    return (
      "Selamat pagi semuanya. Dalam pertemuan hari ini, kita membahas progres penyelesaian kuartal ini dan pembagian tanggung jawab tim. " +
      "Budi melaporkan bahwa modul pemrosesan audio hampir selesai, namun kita masih perlu memverifikasi integrasi provider eksternal. " +
      "Siti menyebutkan bahwa antarmuka pengguna sudah siap dan responsif di perangkat seluler. " +
      "Untuk langkah berikutnya, Budi akan menyelesaikan pengujian API paling lambat Jumat depan, dan Siti akan menyelesaikan aset desain. " +
      "Terdapat pertanyaan mengenai anggaran server [tidak jelas] yang akan dibahas pada pertemuan berikutnya."
    );
  }

  async generateMinutes(transcript: string, language: 'id' | 'en'): Promise<MinutesData> {
    if (language === 'en') {
      return {
        title: 'Sprint Evaluation & Audio Pipeline Deliverables',
        summary:
          'The team reviewed quarterly progress regarding the audio processing pipeline and user interface responsiveness. Critical tasks were delegated for completion by next Friday, while infrastructure budget decisions were deferred.',
        discussionPoints: [
          'Progress of audio normalization module and ffmpeg integration.',
          'Responsiveness and cross-platform behavior of the web interface on desktop and mobile.',
          'External AI provider integration testing requirements.',
          'Preliminary inquiries regarding server budget allocations.',
        ],
        decisions: [
          'Agreed to proceed with comprehensive API integration tests prior to staging release.',
          'Confirmed responsive interface design as production-ready.',
        ],
        actionItems: [
          {
            task: 'Complete API integration and error handling tests',
            owner: 'Budi',
            dueDate: 'Next Friday',
          },
          {
            task: 'Finalize meeting minutes export guidelines and PDF styling',
            owner: 'Siti',
            dueDate: 'Tidak disebutkan',
          },
        ],
        openIssues: [
          'Server infrastructure budget allocation remains unresolved and deferred to next meeting.',
        ],
        notes: [
          'All team members are requested to review the updated repository documentation before next sync.',
        ],
        needsVerification: transcript.includes('[tidak jelas]') || transcript.includes('[unclear]'),
      };
    }

    return {
      title: 'Rapat Evaluasi Deliverable & Pipeline Audio Rangkum.in',
      summary:
        'Tim membahas pencapaian kuartal ini mencakup modul pemrosesan audio, normalisasi ffmpeg, dan kesiapan antarmuka pengguna. Pembagian tugas tindak lanjut telah disepakati untuk diselesaikan Jumat depan.',
      discussionPoints: [
        'Penyelesaian modul pemrosesan audio dan normalisasi ffmpeg 16 kHz.',
        'Verifikasi pengujian integrasi dengan provider AI eksternal.',
        'Uji coba antarmuka Rangkum.in pada perangkat desktop dan mobile.',
        'Pertanyaan seputar alokasi anggaran server yang belum rampung.',
      ],
      decisions: [
        'Menyetujui penyelesaian pengujian API menyeluruh sebelum deployment rilis.',
        'Menetapkan antarmuka responsif saat ini sebagai baseline siap pakai.',
      ],
      actionItems: [
        {
          task: 'Menyelesaikan integrasi API dan validasi error provider',
          owner: 'Budi',
          dueDate: 'Jumat depan',
        },
        {
          task: 'Menyempurnakan panduan ekspor notulen dan aset desain',
          owner: 'Siti',
          dueDate: 'Tidak disebutkan',
        },
      ],
      openIssues: [
        'Alokasi anggaran server [tidak jelas] ditangguhkan ke pertemuan minggu depan.',
      ],
      notes: [
        'Diharapkan seluruh anggota memeriksa transkrip hasil rekaman untuk memastikan verifikasi bagian yang kurang jelas.',
      ],
      needsVerification: transcript.includes('[tidak jelas]') || transcript.includes('[unclear]'),
    };
  }

  async answerQuestion(
    question: string,
    transcriptContext: string,
    _history: ChatMessage[]
  ): Promise<QaResponse> {
    const qLower = question.toLowerCase();
    const isEnglishQ = /^(what|who|when|where|how|is|are|can|could)\b/i.test(question);

    // Rule 2 & 3: Jawab hanya dari isi rekaman. Jika tidak ada: nyatakan tidak dibahas.
    if (qLower.includes('cuaca') || qLower.includes('weather') || qLower.includes('saham') || qLower.includes('harga')) {
      return {
        answer: isEnglishQ
          ? 'Based on the recording transcript, this topic is not discussed or cannot be determined from the provided audio.'
          : 'Berdasarkan transkrip rekaman yang tersedia, topik ini tidak dibahas atau tidak dapat dipastikan dari isi rekaman.',
      };
    }

    if (qLower.includes('budi') || qLower.includes('tugas') || qLower.includes('task') || qLower.includes('pic')) {
      return {
        answer: isEnglishQ
          ? 'According to the transcript, Budi is assigned to complete the API integration and testing by next Friday. Siti is assigned to finalize the design assets and export guidelines.'
          : 'Berdasarkan isi transkrip rekaman, Budi ditugaskan untuk menyelesaikan integrasi API paling lambat Jumat depan, sedangkan Siti bertanggung jawab menyempurnakan panduan ekspor notulen.',
        references: ['00:18 - 00:24'],
      };
    }

    if (qLower.includes('keputusan') || qLower.includes('decision') || qLower.includes('sepakat')) {
      return {
        answer: isEnglishQ
          ? 'The primary decisions recorded in the transcript are: 1) Thorough API integration testing will be conducted before release, and 2) The responsive mobile interface was approved as ready.'
          : 'Keputusan yang tercatat dalam rekaman adalah: 1) Pengujian integrasi API akan diselesaikan secara menyeluruh, dan 2) Antarmuka responsif desktop/mobile telah disetujui sebagai baseline siap pakai.',
        references: ['00:12 - 00:24'],
      };
    }

    if (qLower.includes('anggaran') || qLower.includes('budget') || qLower.includes('biaya')) {
      return {
        answer: isEnglishQ
          ? 'Regarding the server budget, the transcript indicates that the details were unclear and the decision has been postponed to next week’s meeting.'
          : 'Mengenai anggaran server, transkrip mencatat bahwa pembahasannya sempat tidak jelas dan keputusannya ditunda untuk dibahas pada pertemuan lanjutan minggu depan.',
        references: ['00:24 - 00:29'],
      };
    }

    // Default grounded summary answer
    return {
      answer: isEnglishQ
        ? `Based strictly on the recording transcript: The meeting discussed project deliverables, Budi's progress on audio processing, Siti's validation of the responsive UI, and pending follow-ups due next Friday.`
        : `Berdasarkan isi transkrip rekaman: Pertemuan membahas progres deliverable kuartal ini, penyelesaian modul audio oleh Budi, konfirmasi kesiapan antarmuka oleh Siti, dan tenggat waktu tugas Jumat depan.`,
      references: ['00:00 - 00:29'],
    };
  }
}
