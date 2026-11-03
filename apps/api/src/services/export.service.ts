import PDFDocument from 'pdfkit';
import type { MinutesData } from '../types/index.js';

export function sanitizeExportFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9_\-\.]/g, '_').replace(/_+/g, '_');
}

export async function generateMinutesPdf(minutes: MinutesData, language: 'id' | 'en' = 'id'): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        margin: 50,
        size: 'A4',
      });

      const chunks: Buffer[] = [];
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err) => reject(err));

      const isEnglish = language === 'en';

      // Colors
      const navyColor = '#172A43';
      const terracottaColor = '#B9684B';
      const textColor = '#202B38';
      const mutedColor = '#7D858C';

      // Header Banner
      doc
        .fillColor(navyColor)
        .fontSize(20)
        .font('Helvetica-Bold')
        .text('Rangkum.in', 50, 50, { continued: true })
        .fillColor(terracottaColor)
        .text('.in', { continued: false });

      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica')
        .text(isEnglish ? 'VOICE TO MINUTES AI — OFFICIAL RECORD' : 'NOTULEN RAPAT RESMI — VOICE TO MINUTES AI', 50, 75);

      // Horizontal line
      doc
        .strokeColor('#E7E3DA')
        .lineWidth(1)
        .moveTo(50, 92)
        .lineTo(545, 92)
        .stroke();

      let yPos = 110;

      // Date & Metadata
      const formattedDate = new Date().toLocaleDateString(isEnglish ? 'en-US' : 'id-ID', {
        dateStyle: 'full',
      });
      doc
        .fillColor(mutedColor)
        .fontSize(9)
        .font('Helvetica')
        .text(`${isEnglish ? 'Generated on' : 'Tanggal dibuat'}: ${formattedDate}`, 50, yPos);

      yPos += 20;

      // Meeting Title
      doc
        .fillColor(navyColor)
        .fontSize(16)
        .font('Helvetica-Bold')
        .text(minutes.title, 50, yPos, { width: 495 });

      yPos = doc.y + 15;

      // Executive Summary
      doc
        .fillColor(terracottaColor)
        .fontSize(11)
        .font('Helvetica-Bold')
        .text(isEnglish ? 'EXECUTIVE SUMMARY' : 'RINGKASAN EKSEKUTIF', 50, yPos);
      yPos = doc.y + 4;

      doc
        .fillColor(textColor)
        .fontSize(10)
        .font('Helvetica')
        .text(minutes.summary, 50, yPos, { width: 495, lineGap: 3 });
      yPos = doc.y + 15;

      // Discussion Points
      if (minutes.discussionPoints && minutes.discussionPoints.length > 0) {
        doc
          .fillColor(terracottaColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(isEnglish ? 'DISCUSSION POINTS' : 'POIN PEMBAHASAN', 50, yPos);
        yPos = doc.y + 4;

        minutes.discussionPoints.forEach((point, i) => {
          doc
            .fillColor(textColor)
            .fontSize(10)
            .font('Helvetica')
            .text(`${i + 1}.  ${point}`, 55, yPos, { width: 490, lineGap: 2 });
          yPos = doc.y + 3;
        });
        yPos += 10;
      }

      // Agreed Decisions
      if (minutes.decisions && minutes.decisions.length > 0) {
        doc
          .fillColor(terracottaColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(isEnglish ? 'AGREED DECISIONS' : 'KEPUTUSAN YANG DISEPAKATI', 50, yPos);
        yPos = doc.y + 4;

        minutes.decisions.forEach((dec) => {
          doc
            .fillColor(textColor)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text('•  ', 55, yPos, { continued: true })
            .font('Helvetica')
            .text(dec, { width: 490, lineGap: 2 });
          yPos = doc.y + 3;
        });
        yPos += 10;
      }

      // Action Items
      if (minutes.actionItems && minutes.actionItems.length > 0) {
        doc
          .fillColor(terracottaColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(isEnglish ? 'ACTION ITEMS & RESPONSIBILITIES' : 'ACTION ITEMS / TINDAK LANJUT', 50, yPos);
        yPos = doc.y + 6;

        minutes.actionItems.forEach((item, i) => {
          doc
            .fillColor(navyColor)
            .fontSize(10)
            .font('Helvetica-Bold')
            .text(`${i + 1}. ${item.task}`, 55, yPos, { width: 490 });
          yPos = doc.y + 2;

          doc
            .fillColor(mutedColor)
            .fontSize(9)
            .font('Helvetica')
            .text(`    PIC: ${item.owner}   |   ${isEnglish ? 'Due Date' : 'Tenggat'}: ${item.dueDate}`, 55, yPos);
          yPos = doc.y + 5;
        });
        yPos += 10;
      }

      // Open Issues
      if (minutes.openIssues && minutes.openIssues.length > 0) {
        doc
          .fillColor(terracottaColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(isEnglish ? 'OPEN ISSUES / UNRESOLVED' : 'ISU TERBUKA', 50, yPos);
        yPos = doc.y + 4;

        minutes.openIssues.forEach((issue) => {
          doc
            .fillColor(textColor)
            .fontSize(10)
            .font('Helvetica')
            .text(`-  ${issue}`, 55, yPos, { width: 490 });
          yPos = doc.y + 3;
        });
        yPos += 10;
      }

      // Notes
      if (minutes.notes && minutes.notes.length > 0) {
        doc
          .fillColor(terracottaColor)
          .fontSize(11)
          .font('Helvetica-Bold')
          .text(isEnglish ? 'ADDITIONAL NOTES' : 'CATATAN TAMBAHAN', 50, yPos);
        yPos = doc.y + 4;

        minutes.notes.forEach((note) => {
          doc
            .fillColor(textColor)
            .fontSize(10)
            .font('Helvetica')
            .text(`-  ${note}`, 55, yPos, { width: 490 });
          yPos = doc.y + 3;
        });
      }

      // Footer
      doc
        .strokeColor('#E7E3DA')
        .lineWidth(0.5)
        .moveTo(50, 780)
        .lineTo(545, 780)
        .stroke();

      doc
        .fillColor(mutedColor)
        .fontSize(8)
        .font('Helvetica')
        .text('Dokumen ini dihasilkan secara otomatis oleh Rangkum.in (Voice to Minutes AI).', 50, 788, {
          align: 'center',
          width: 495,
        });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
