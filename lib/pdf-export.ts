import jsPDF from 'jspdf';
import type autoTable from 'jspdf-autotable';

export interface PDFHeaderOptions {
  projectName: string;
  comparisonType: 'Scorecard Comparison' | 'Financial Comparison';
  currency?: string;
}

export function addPDFHeader(doc: jsPDF, options: PDFHeaderOptions): number {
  const { projectName, comparisonType, currency } = options;
  let yPosition = 15;

  doc.setFillColor(79, 70, 229);
  doc.roundedRect(10, yPosition - 5, 8, 8, 1, 1, 'F');
  
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.3);
  doc.setFillColor(255, 255, 255);
  doc.rect(11.5, yPosition - 3.5, 5, 4, 'F');
  doc.line(12, yPosition - 2, 16, yPosition - 2);
  doc.line(12.5, yPosition - 0.5, 15.5, yPosition - 0.5);
  doc.line(12.5, yPosition + 0.5, 15.5, yPosition + 0.5);

  doc.setFontSize(18);
  doc.setTextColor(24, 24, 27);
  doc.setFont('helvetica', 'bold');
  doc.text(projectName, 22, yPosition);

  yPosition += 8;
  doc.setFontSize(12);
  doc.setTextColor(63, 63, 70);
  doc.setFont('helvetica', 'normal');
  const subtitle = currency ? `${comparisonType} (${currency})` : comparisonType;
  doc.text(subtitle, 22, yPosition);

  yPosition += 5;
  doc.setFontSize(8);
  doc.setTextColor(113, 113, 122);
  const exportDate = new Date().toLocaleDateString('en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  doc.text(`Exported on ${exportDate}`, 22, yPosition);

  yPosition += 10;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(10, yPosition, 200, yPosition);

  return yPosition + 5;
}

export function addPDFFooter(doc: jsPDF) {
  const pageCount = (doc as any).internal.getNumberOfPages();
  
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(113, 113, 122);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }
}

export function sanitizeFilename(projectName: string, comparisonType: string): string {
  const sanitizedProject = projectName.replace(/[^a-z0-9]/gi, '-').replace(/-+/g, '-');
  const date = new Date().toISOString().split('T')[0];
  const type = comparisonType.replace(/\s+/g, '-');
  return `${sanitizedProject}-${type}-${date}.pdf`;
}

export function getScoreColor(value: number): [number, number, number] {
  if (value >= 80) return [22, 163, 74];
  if (value >= 60) return [202, 138, 4];
  return [220, 38, 38];
}

export function addSectionHeader(doc: jsPDF, title: string, yPosition: number): number {
  doc.setFontSize(14);
  doc.setTextColor(79, 70, 229);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 10, yPosition);
  
  yPosition += 2;
  doc.setDrawColor(228, 228, 231);
  doc.setLineWidth(0.5);
  doc.line(10, yPosition, 200, yPosition);
  
  return yPosition + 5;
}

export interface ColumnBatch {
  headers: string[];
  dataColumns: number[];
}

export function splitColumnsForPDF(totalColumns: number, maxColumnsPerPage: number = 5): ColumnBatch[] {
  const batches: ColumnBatch[] = [];
  const dataColumnCount = totalColumns - 1;
  
  for (let i = 0; i < dataColumnCount; i += maxColumnsPerPage) {
    const end = Math.min(i + maxColumnsPerPage, dataColumnCount);
    batches.push({
      headers: [],
      dataColumns: Array.from({ length: end - i }, (_, idx) => i + idx + 1),
    });
  }
  
  return batches;
}
