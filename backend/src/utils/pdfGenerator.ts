import { jsPDF } from 'jspdf';
import path from 'path';
import fs from 'fs';

const UPLOADS_DIR = path.resolve(__dirname, '../../uploads/assignments');

export interface AssignmentPdfContent {
  title: string;
  courseTopic: string;
  moduleTitle: string;
  difficulty: string;
  description: string;
  tasks: string[];
  rubric: { criterion: string; maxMarks: number }[];
  totalMarks: number;
}

/**
 * Generates a professional assignment PDF and saves it to disk.
 * Returns the relative path to the saved file.
 */
export function generateAssignmentPdf(
  assignmentId: number,
  content: AssignmentPdfContent
): string {
  // Ensure upload directory exists
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = 20;

  const checkPage = (needed: number) => {
    if (y + needed > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = 20;
    }
  };

  // Header bar
  doc.setFillColor(79, 70, 229); // Indigo-600
  doc.rect(0, 0, pageWidth, 35, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('NeuralLearn Assignment', margin, 15);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Course: ${content.courseTopic} | Module: ${content.moduleTitle}`, margin, 25);
  doc.text(`Difficulty: ${content.difficulty} | Total Marks: ${content.totalMarks}`, margin, 31);

  y = 45;

  // Title
  doc.setTextColor(30, 30, 50);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  const titleLines = doc.splitTextToSize(content.title, contentWidth);
  doc.text(titleLines, margin, y);
  y += titleLines.length * 8 + 5;

  // Horizontal rule
  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;

  // Description
  checkPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text('Description', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);
  const descLines = doc.splitTextToSize(content.description, contentWidth);
  for (const line of descLines) {
    checkPage(6);
    doc.text(line, margin, y);
    y += 5;
  }
  y += 8;

  // Tasks
  checkPage(20);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text('Tasks / Questions', margin, y);
  y += 8;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(50, 50, 50);

  content.tasks.forEach((task, index) => {
    checkPage(15);
    const taskText = `${index + 1}. ${task}`;
    const taskLines = doc.splitTextToSize(taskText, contentWidth - 5);
    for (const line of taskLines) {
      checkPage(6);
      doc.text(line, margin + 3, y);
      y += 5;
    }
    y += 4;
  });
  y += 5;

  // Rubric table
  checkPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(79, 70, 229);
  doc.text('Marking Rubric', margin, y);
  y += 8;

  // Table header
  doc.setFillColor(240, 240, 255);
  doc.rect(margin, y - 4, contentWidth, 8, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);
  doc.text('Criterion', margin + 3, y);
  doc.text('Max Marks', pageWidth - margin - 25, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  content.rubric.forEach((item) => {
    checkPage(8);
    doc.setDrawColor(230, 230, 230);
    doc.line(margin, y - 3, pageWidth - margin, y - 3);
    const critLines = doc.splitTextToSize(item.criterion, contentWidth - 35);
    doc.text(critLines[0], margin + 3, y);
    doc.text(String(item.maxMarks), pageWidth - margin - 20, y);
    y += 6;
  });

  // Total
  checkPage(12);
  doc.setDrawColor(79, 70, 229);
  doc.line(margin, y - 2, pageWidth - margin, y - 2);
  y += 3;
  doc.setFont('helvetica', 'bold');
  doc.text('Total', margin + 3, y);
  doc.text(String(content.totalMarks), pageWidth - margin - 20, y);
  y += 10;

  // Instructions
  checkPage(30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(79, 70, 229);
  doc.text('Submission Instructions', margin, y);
  y += 7;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const instructions = [
    '1. Complete all tasks listed above in a separate PDF document.',
    '2. Ensure your answers are clear, well-structured, and properly formatted.',
    '3. Upload your completed PDF through the NeuralLearn assignment portal.',
    '4. Your submission will be evaluated by our AI grading system.',
    '5. You will receive a detailed score and feedback after submission.',
  ];
  instructions.forEach((inst) => {
    checkPage(6);
    doc.text(inst, margin + 3, y);
    y += 5;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `NeuralLearn — AI-Powered Adaptive Learning | Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  const filename = `assignment_${assignmentId}_${Date.now()}.pdf`;
  const filePath = path.join(UPLOADS_DIR, filename);
  fs.writeFileSync(filePath, Buffer.from(doc.output('arraybuffer')));

  return `uploads/assignments/${filename}`;
}
