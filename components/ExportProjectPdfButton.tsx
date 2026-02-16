'use client';

import { useState } from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { addPDFHeader, addPDFFooter, addSectionHeader, sanitizeFilename, getScoreColor as getPDFScoreColor, splitColumnsForPDF } from '@/lib/pdf-export';
import { formatCurrency, type Currency } from '@/domain/financial/format';
import { STEPS } from '@/lib/steps';
import type { RunComparisonData } from '@/domain/scorecard/compare';
import {
  calculateImplementationTotal,
  calculateOngoingTotal,
  calculateGrandTotal,
  calculateSectionTotal,
  getEntriesByCategory,
  type FinancialEntry,
} from '@/domain/financial/calculate';

const SCALE_LABELS: Record<number, string> = {
  0: 'N/A',
  1: 'Very Poor',
  2: 'Poor',
  3: 'Adequate',
  4: 'Good',
  5: 'Excellent',
};

interface GatingAnswer {
  question: {
    text: string;
    order: number;
  };
  value: boolean;
}

interface ScorecardRun {
  id: string;
  name: string | null;
  createdAt: Date;
}

interface ExportProjectPdfButtonProps {
  projectName: string;
  gatingAnswers?: GatingAnswer[];
  scorecardRuns: ScorecardRun[];
  comparisonData: {
    runs: RunComparisonData[];
    allStepNumbers: number[];
  };
  financialEntries: FinancialEntry[];
  currency: Currency;
}

export function ExportProjectPdfButton({
  projectName,
  gatingAnswers,
  scorecardRuns,
  comparisonData,
  financialEntries,
  currency,
}: ExportProjectPdfButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const doc = new jsPDF();
      let yPosition = addPDFHeader(doc, {
        projectName,
        comparisonType: 'Scorecard Comparison',
      });

      yPosition += 5;

      if (gatingAnswers && gatingAnswers.length > 0) {
        yPosition = addSectionHeader(doc, 'Gating Evaluation', yPosition);

        const gatingData = gatingAnswers
          .sort((a, b) => a.question.order - b.question.order)
          .map((answer) => {
            // Normalize special characters (en-dash to hyphen)
            const normalizedText = answer.question.text.replace(/[\u2011\u2013\u2014]/g, '-');
            return [normalizedText, answer.value ? 'Yes' : 'No'];
          });

        autoTable(doc, {
          head: [['Question', 'Answer']],
          body: gatingData,
          startY: yPosition,
          theme: 'grid',
          styles: { 
            fontSize: 9, 
            cellPadding: 3,
            valign: 'top',
            halign: 'left',
            overflow: 'linebreak',
            cellWidth: 'wrap',
          },
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
            valign: 'middle',
          },
          columnStyles: {
            0: { 
              cellWidth: 155,
              overflow: 'linebreak',
            },
            1: { 
              cellWidth: 25, 
              halign: 'center',
              valign: 'middle',
            },
          },
          margin: { left: 10, right: 10 },
          tableWidth: 190,
        });

        yPosition = (doc as any).lastAutoTable.finalY + 10;

        const yesCount = gatingAnswers.filter((a) => a.value).length;
        doc.setFontSize(9);
        doc.setTextColor(63, 63, 70);
        doc.text(`${yesCount} of ${gatingAnswers.length} questions answered "Yes"`, 10, yPosition);
        yPosition += 15;
      }

      if (scorecardRuns.length > 0) {
        if (yPosition > 240) {
          doc.addPage();
          yPosition = 20;
        }

        yPosition = addSectionHeader(doc, 'Scorecards', yPosition);

        const sortedScorecardRuns = [...scorecardRuns].sort((a, b) => {
          if (a.name && b.name) return a.name.localeCompare(b.name);
          if (a.name && !b.name) return -1;
          if (!a.name && b.name) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        const scorecardData = sortedScorecardRuns.map((run, index) => {
          const runComparison = comparisonData.runs.find((r) => r.runId === run.id);
          const score = runComparison ? runComparison.overall.weightedScore.toFixed(1) : 'N/A';
          const date = new Date(run.createdAt).toLocaleDateString('en-GB');
          return [run.name || `Scorecard ${scorecardRuns.length - index}`, score, date];
        });

        autoTable(doc, {
          head: [['Scorecard Name', 'Overall Score', 'Created']],
          body: scorecardData,
          startY: yPosition,
          theme: 'grid',
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: {
            fillColor: [79, 70, 229],
            textColor: [255, 255, 255],
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 100 },
            1: { cellWidth: 40, halign: 'center' },
            2: { cellWidth: 40, halign: 'center' },
          },
        });

        yPosition = (doc as any).lastAutoTable.finalY + 15;
      }

      if (comparisonData.runs.length >= 2) {
        const batches = splitColumnsForPDF(comparisonData.runs.length + 1, 5);

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          
          if (batchIndex > 0 || yPosition > 240) {
            doc.addPage();
            yPosition = 20;
          }

          const batchTitle = batchIndex === 0 
            ? 'Scorecard Comparison' 
            : `Scorecard Comparison (continued)`;
          yPosition = addSectionHeader(doc, batchTitle, yPosition);

          if (batchIndex > 0) {
            const startIdx = batch.dataColumns[0];
            const endIdx = batch.dataColumns[batch.dataColumns.length - 1];
            doc.setFontSize(8);
            doc.setTextColor(113, 113, 122);
            doc.text(`Showing scorecards ${startIdx} to ${endIdx} of ${comparisonData.runs.length}`, 10, yPosition);
            yPosition += 5;
          }

          const headers = [
            'Step',
            ...batch.dataColumns.map((colIdx) => {
              const run = comparisonData.runs[colIdx - 1];
              return run.name || `Scorecard ${comparisonData.runs.length - (colIdx - 1)}`;
            }),
          ];

          const tableData = comparisonData.allStepNumbers.map((stepNumber) => {
            const step = STEPS.find((s) => s.number === stepNumber);
            if (!step) return null;

            const row = [`${step.name} (${step.sectionWeight}%)`];

            batch.dataColumns.forEach((colIdx) => {
              const run = comparisonData.runs[colIdx - 1];
              const stepScore = run.stepScores.find((s) => s.stepNumber === stepNumber);
              if (stepScore) {
                const contribution = (stepScore.weightedScore * stepScore.sectionWeight) / 100;
                row.push(contribution.toFixed(1));
              } else {
                row.push('—');
              }
            });

            return row;
          }).filter((row): row is string[] => row !== null);

          const totalRow = [
            'Overall Total',
            ...batch.dataColumns.map((colIdx) => {
              const run = comparisonData.runs[colIdx - 1];
              return run.overall.weightedScore.toFixed(1);
            }),
          ];
          tableData.push(totalRow);

          autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: yPosition,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 3 },
            headStyles: {
              fillColor: [79, 70, 229],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center',
            },
            columnStyles: {
              0: { halign: 'left', cellWidth: 60 },
            },
            didParseCell: (data) => {
              if (data.row.index === tableData.length - 1) {
                data.cell.styles.fillColor = [250, 250, 250];
                data.cell.styles.fontStyle = 'bold';
              }
            },
            didDrawCell: (data) => {
              if (data.section === 'body' && data.column.index > 0) {
                const cellValue = data.cell.raw as string;
                if (cellValue !== '—') {
                  const value = parseFloat(cellValue);
                  const color = getPDFScoreColor(value);
                  data.cell.styles.textColor = color;
                }
              }
            },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        }
      }

      if (scorecardRuns.length > 0 && financialEntries.length > 0) {
        const sortedFinancialScorecards = [...scorecardRuns].sort((a, b) => {
          if (a.name && b.name) return a.name.localeCompare(b.name);
          if (a.name && !b.name) return -1;
          if (!a.name && b.name) return 1;
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        });

        const batches = splitColumnsForPDF(sortedFinancialScorecards.length + 1, 5);

        for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
          const batch = batches[batchIndex];
          
          doc.addPage();
          yPosition = 20;

          const batchTitle = batchIndex === 0 
            ? `Financial Comparison (${currency})` 
            : `Financial Comparison (${currency}) (continued)`;
          yPosition = addSectionHeader(doc, batchTitle, yPosition);

          if (batchIndex > 0) {
            const startIdx = batch.dataColumns[0];
            const endIdx = batch.dataColumns[batch.dataColumns.length - 1];
            doc.setFontSize(8);
            doc.setTextColor(113, 113, 122);
            doc.text(`Showing scorecards ${startIdx} to ${endIdx} of ${sortedFinancialScorecards.length}`, 10, yPosition);
            yPosition += 5;
          }

          const headers = [
            'Cost Item',
            ...batch.dataColumns.map((colIdx) => {
              const run = sortedFinancialScorecards[colIdx - 1];
              return run.name || `Scorecard ${sortedFinancialScorecards.length - (colIdx - 1)}`;
            }),
          ];

          const tableData: any[] = [];

          tableData.push([
            { content: 'Implementation Costs', colSpan: headers.length, styles: { fillColor: [199, 210, 254], fontStyle: 'bold', textColor: [49, 46, 129] } },
          ]);

          const implCapexEntries = getEntriesByCategory(financialEntries, 'IMPLEMENTATION_CAPEX');
          if (implCapexEntries.length > 0) {
            tableData.push([
              { content: 'Capital Expenditure', colSpan: headers.length, styles: { fillColor: [244, 244, 245], fontStyle: 'bold', fontSize: 7 } },
            ]);
            implCapexEntries.forEach((entry) => {
              const row = [entry.name];
              batch.dataColumns.forEach((colIdx) => {
                const run = sortedFinancialScorecards[colIdx - 1];
                const cost = entry.costs.find((c) => c.scorecardRunId === run.id);
                row.push(cost ? formatCurrency(cost.amount, currency) : '—');
              });
              tableData.push(row);
            });
            const subtotalRow = ['Capital Expenditure Sub-total'];
            batch.dataColumns.forEach((colIdx) => {
              const run = sortedFinancialScorecards[colIdx - 1];
              const total = calculateSectionTotal(financialEntries, 'IMPLEMENTATION_CAPEX', run.id);
              subtotalRow.push(formatCurrency(total, currency));
            });
            tableData.push(subtotalRow);
          }

          const implOpexEntries = getEntriesByCategory(financialEntries, 'IMPLEMENTATION_OPEX');
          if (implOpexEntries.length > 0) {
            tableData.push([
              { content: 'Operational Expenditure', colSpan: headers.length, styles: { fillColor: [244, 244, 245], fontStyle: 'bold', fontSize: 7 } },
            ]);
            implOpexEntries.forEach((entry) => {
              const row = [entry.name];
              batch.dataColumns.forEach((colIdx) => {
                const run = sortedFinancialScorecards[colIdx - 1];
                const cost = entry.costs.find((c) => c.scorecardRunId === run.id);
                row.push(cost ? formatCurrency(cost.amount, currency) : '—');
              });
              tableData.push(row);
            });
            const subtotalRow = ['Operational Expenditure Sub-total'];
            batch.dataColumns.forEach((colIdx) => {
              const run = sortedFinancialScorecards[colIdx - 1];
              const total = calculateSectionTotal(financialEntries, 'IMPLEMENTATION_OPEX', run.id);
              subtotalRow.push(formatCurrency(total, currency));
            });
            tableData.push(subtotalRow);
          }

          const implTotalRow = ['Implementation Costs Total'];
          batch.dataColumns.forEach((colIdx) => {
            const run = sortedFinancialScorecards[colIdx - 1];
            const total = calculateImplementationTotal(financialEntries, run.id);
            implTotalRow.push(formatCurrency(total, currency));
          });
          tableData.push(implTotalRow);

          tableData.push([
            { content: '3-Year Ongoing Costs', colSpan: headers.length, styles: { fillColor: [199, 210, 254], fontStyle: 'bold', textColor: [49, 46, 129] } },
          ]);

          const ongoingCapexEntries = getEntriesByCategory(financialEntries, 'ONGOING_CAPEX');
          if (ongoingCapexEntries.length > 0) {
            tableData.push([
              { content: 'Capital Expenditure', colSpan: headers.length, styles: { fillColor: [244, 244, 245], fontStyle: 'bold', fontSize: 7 } },
            ]);
            ongoingCapexEntries.forEach((entry) => {
              const row = [entry.name];
              batch.dataColumns.forEach((colIdx) => {
                const run = sortedFinancialScorecards[colIdx - 1];
                const cost = entry.costs.find((c) => c.scorecardRunId === run.id);
                row.push(cost ? formatCurrency(cost.amount, currency) : '—');
              });
              tableData.push(row);
            });
            const subtotalRow = ['Capital Expenditure Sub-total'];
            batch.dataColumns.forEach((colIdx) => {
              const run = sortedFinancialScorecards[colIdx - 1];
              const total = calculateSectionTotal(financialEntries, 'ONGOING_CAPEX', run.id);
              subtotalRow.push(formatCurrency(total, currency));
            });
            tableData.push(subtotalRow);
          }

          const ongoingOpexEntries = getEntriesByCategory(financialEntries, 'ONGOING_OPEX');
          if (ongoingOpexEntries.length > 0) {
            tableData.push([
              { content: 'Operational Expenditure', colSpan: headers.length, styles: { fillColor: [244, 244, 245], fontStyle: 'bold', fontSize: 7 } },
            ]);
            ongoingOpexEntries.forEach((entry) => {
              const row = [entry.name];
              batch.dataColumns.forEach((colIdx) => {
                const run = sortedFinancialScorecards[colIdx - 1];
                const cost = entry.costs.find((c) => c.scorecardRunId === run.id);
                row.push(cost ? formatCurrency(cost.amount, currency) : '—');
              });
              tableData.push(row);
            });
            const subtotalRow = ['Operational Expenditure Sub-total'];
            batch.dataColumns.forEach((colIdx) => {
              const run = sortedFinancialScorecards[colIdx - 1];
              const total = calculateSectionTotal(financialEntries, 'ONGOING_OPEX', run.id);
              subtotalRow.push(formatCurrency(total, currency));
            });
            tableData.push(subtotalRow);
          }

          const ongoingTotalRow = ['3-Year Ongoing Costs Total'];
          batch.dataColumns.forEach((colIdx) => {
            const run = sortedFinancialScorecards[colIdx - 1];
            const total = calculateOngoingTotal(financialEntries, run.id);
            ongoingTotalRow.push(formatCurrency(total, currency));
          });
          tableData.push(ongoingTotalRow);

          const grandTotalRow = ['Grand Total'];
          batch.dataColumns.forEach((colIdx) => {
            const run = sortedFinancialScorecards[colIdx - 1];
            const total = calculateGrandTotal(financialEntries, run.id);
            grandTotalRow.push(formatCurrency(total, currency));
          });
          tableData.push(grandTotalRow);

          autoTable(doc, {
            head: [headers],
            body: tableData,
            startY: yPosition,
            theme: 'grid',
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: {
              fillColor: [79, 70, 229],
              textColor: [255, 255, 255],
              fontStyle: 'bold',
              halign: 'center',
            },
            columnStyles: {
              0: { halign: 'left', cellWidth: 50 },
            },
            didParseCell: (data) => {
              const rowText = typeof tableData[data.row.index]?.[0] === 'string' ? tableData[data.row.index][0] : '';
              if (rowText === 'Implementation Costs Total' || rowText === '3-Year Ongoing Costs Total') {
                data.cell.styles.fillColor = [254, 243, 199];
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [120, 53, 15];
              } else if (rowText === 'Grand Total') {
                data.cell.styles.fillColor = [79, 70, 229];
                data.cell.styles.fontStyle = 'bold';
                data.cell.styles.textColor = [255, 255, 255];
                data.cell.styles.fontSize = 9;
              } else if (typeof rowText === 'string' && rowText.includes('Sub-total')) {
                data.cell.styles.fontStyle = 'bold';
              }
            },
          });

          yPosition = (doc as any).lastAutoTable.finalY + 15;
        }
      }

      // Add detailed scorecard breakdowns with comments and overview
      if (scorecardRuns.length > 0) {
        for (const run of scorecardRuns) {
          try {
            // Fetch detailed data for this scorecard
            const response = await fetch(`/api/scorecard/${run.id}/export-data`);
            const data = await response.json();
            
            if (data.ok && data.data) {
              const detailedRun = data.data;
              
              doc.addPage();
              yPosition = 20;
              
              yPosition = addSectionHeader(doc, `Detailed Scorecard: ${run.name || 'Unnamed'}`, yPosition);
              
              // Group scores by step
              const scoresByStep = new Map<number, any[]>();
              detailedRun.scores.forEach((score: any) => {
                const stepNum = score.question.stepNumber;
                if (!scoresByStep.has(stepNum)) {
                  scoresByStep.set(stepNum, []);
                }
                scoresByStep.get(stepNum)!.push(score);
              });
              
              // Render each step
              for (const step of STEPS.filter(s => s.questionsPerStep > 0)) {
                const stepScores = scoresByStep.get(step.number) || [];
                if (stepScores.length === 0) continue;
                
                // Check if we need a new page
                if (yPosition > 240) {
                  doc.addPage();
                  yPosition = 20;
                }
                
                // Step header
                doc.setFontSize(11);
                doc.setFont('helvetica', 'bold');
                doc.setTextColor(79, 70, 229);
                doc.text(`Step ${step.number}: ${step.name}`, 10, yPosition);
                yPosition += 7;
                
                // Questions and scores
                for (const score of stepScores) {
                  // Check page space
                  if (yPosition > 260) {
                    doc.addPage();
                    yPosition = 20;
                  }
                  
                  doc.setFontSize(9);
                  doc.setFont('helvetica', 'normal');
                  doc.setTextColor(63, 63, 70);
                  
                  // Question text (wrapped)
                  const questionLines = doc.splitTextToSize(score.question.text, 150);
                  doc.text(questionLines, 15, yPosition);
                  yPosition += questionLines.length * 5;
                  
                  // Score
                  doc.setFont('helvetica', 'bold');
                  const scoreLabel = `Score: ${score.value} - ${SCALE_LABELS[score.value] || 'N/A'}`;
                  doc.text(scoreLabel, 15, yPosition);
                  yPosition += 8;
                }
                
                // Step comment if exists
                const stepComment = detailedRun.stepComments?.find((sc: any) => sc.stepNumber === step.number);
                if (stepComment?.comment) {
                  if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                  }
                  
                  doc.setFont('helvetica', 'bold');
                  doc.setFontSize(9);
                  doc.setTextColor(63, 63, 70);
                  doc.text('Step Comments:', 15, yPosition);
                  yPosition += 5;
                  
                  doc.setFont('helvetica', 'italic');
                  doc.setFontSize(8);
                  doc.setTextColor(113, 113, 122);
                  const stepCommentLines = doc.splitTextToSize(stepComment.comment, 170);
                  doc.text(stepCommentLines, 15, yPosition);
                  yPosition += stepCommentLines.length * 4 + 5;
                }
                
                yPosition += 5;
              }
              
              // Overview section
              if (detailedRun.overview && (detailedRun.overview.pros || detailedRun.overview.cons || detailedRun.overview.summary)) {
                if (yPosition > 200) {
                  doc.addPage();
                  yPosition = 20;
                }
                
                yPosition = addSectionHeader(doc, 'Overview', yPosition);
                
                if (detailedRun.overview.pros) {
                  doc.setFontSize(10);
                  doc.setFont('helvetica', 'bold');
                  doc.setTextColor(63, 63, 70);
                  doc.text('Pros:', 10, yPosition);
                  yPosition += 6;
                  
                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(9);
                  const prosLines = doc.splitTextToSize(detailedRun.overview.pros, 180);
                  doc.text(prosLines, 10, yPosition);
                  yPosition += prosLines.length * 5 + 5;
                }
                
                if (detailedRun.overview.cons) {
                  if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                  }
                  
                  doc.setFontSize(10);
                  doc.setFont('helvetica', 'bold');
                  doc.setTextColor(63, 63, 70);
                  doc.text('Cons:', 10, yPosition);
                  yPosition += 6;
                  
                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(9);
                  const consLines = doc.splitTextToSize(detailedRun.overview.cons, 180);
                  doc.text(consLines, 10, yPosition);
                  yPosition += consLines.length * 5 + 5;
                }
                
                if (detailedRun.overview.summary) {
                  if (yPosition > 250) {
                    doc.addPage();
                    yPosition = 20;
                  }
                  
                  doc.setFontSize(10);
                  doc.setFont('helvetica', 'bold');
                  doc.setTextColor(63, 63, 70);
                  doc.text('Summary:', 10, yPosition);
                  yPosition += 6;
                  
                  doc.setFont('helvetica', 'normal');
                  doc.setFontSize(9);
                  const summaryLines = doc.splitTextToSize(detailedRun.overview.summary, 180);
                  doc.text(summaryLines, 10, yPosition);
                  yPosition += summaryLines.length * 5 + 5;
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching detailed data for scorecard ${run.id}:`, error);
          }
        }
      }

      addPDFFooter(doc);

      const filename = sanitizeFilename(projectName, 'Project-Export');
      doc.save(filename);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={exportToPDF}
      disabled={isExporting}
      className="px-4 py-2 text-sm rounded-lg font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
    >
      {isExporting ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Exporting...
        </span>
      ) : (
        'Export to PDF'
      )}
    </button>
  );
}
