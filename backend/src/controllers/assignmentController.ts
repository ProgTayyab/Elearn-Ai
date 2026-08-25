import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { assertModuleOwnership, assertAssignmentOwnership } from '../utils/courseAccess';
import {
  generateAssignmentContent,
  gradeAssignmentSubmission,
  handleGeminiError,
} from '../services/geminiService';
import { generateAssignmentPdf, AssignmentPdfContent } from '../utils/pdfGenerator';
import { extractTextFromPdf } from '../utils/pdfParser';
import { recordStudyActivity } from '../utils/userStats';

const prisma = new PrismaClient();

/**
 * Ensures an assignment exists for a module.
 * Generates AI content, creates a PDF, and stores in DB.
 */
async function ensureAssignment(moduleId: number, userId: number) {
  let assignment = await prisma.assignment.findFirst({ where: { moduleId } });
  if (assignment && assignment.pdfPath) return assignment;

  const module = await assertModuleOwnership(userId, moduleId);
  if (!module) throw new Error('Module not found');

  try {
    const generated = await generateAssignmentContent(
      module.course.topic,
      module.title,
      module.course.difficulty
    );

    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          moduleId,
          title: generated.title.slice(0, 200),
          description: generated.description.slice(0, 3000),
          difficulty: module.course.difficulty,
          language: generated.language.slice(0, 50),
          status: 'pending',
          rubric: JSON.stringify(generated.rubric),
          maxScore: generated.totalMarks || 100,
        },
      });
    }

    // Generate PDF
    const pdfContent: AssignmentPdfContent = {
      title: generated.title,
      courseTopic: module.course.topic,
      moduleTitle: module.title,
      difficulty: module.course.difficulty,
      description: generated.description,
      tasks: generated.tasks,
      rubric: generated.rubric,
      totalMarks: generated.totalMarks || 100,
    };

    const pdfPath = generateAssignmentPdf(assignment.id, pdfContent);

    assignment = await prisma.assignment.update({
      where: { id: assignment.id },
      data: {
        pdfPath,
        rubric: JSON.stringify({
          tasks: generated.tasks,
          criteria: generated.rubric,
          totalMarks: generated.totalMarks,
        }),
      },
    });
  } catch (err) {
    // Fallback: create assignment without AI content
    if (!assignment) {
      assignment = await prisma.assignment.create({
        data: {
          moduleId,
          title: `${module.title} — Assignment`,
          description: `Apply concepts from ${module.title} in a hands-on assignment.`,
          difficulty: module.course.difficulty,
          language: 'General',
          status: 'pending',
          maxScore: 100,
        },
      });
    }
    // Try PDF generation with fallback content
    try {
      const fallbackContent: AssignmentPdfContent = {
        title: assignment.title,
        courseTopic: module.course.topic,
        moduleTitle: module.title,
        difficulty: module.course.difficulty,
        description: assignment.description,
        tasks: [
          `Explain the key concepts covered in ${module.title}.`,
          `Provide a practical example demonstrating your understanding.`,
          `Compare and contrast two approaches discussed in this module.`,
          `Solve a problem using techniques from ${module.title}.`,
          `Reflect on real-world applications of these concepts.`,
        ],
        rubric: [
          { criterion: 'Understanding of core concepts', maxMarks: 20 },
          { criterion: 'Problem solving approach', maxMarks: 25 },
          { criterion: 'Completeness of answers', maxMarks: 20 },
          { criterion: 'Clarity and presentation', maxMarks: 15 },
          { criterion: 'Application of knowledge', maxMarks: 20 },
        ],
        totalMarks: 100,
      };

      const pdfPath = generateAssignmentPdf(assignment.id, fallbackContent);

      assignment = await prisma.assignment.update({
        where: { id: assignment.id },
        data: {
          pdfPath,
          rubric: JSON.stringify({
            tasks: fallbackContent.tasks,
            criteria: fallbackContent.rubric,
            totalMarks: 100,
          }),
        },
      });
    } catch {
      // PDF generation also failed, return what we have
    }
  }

  return assignment;
}

/**
 * GET /api/modules/:moduleId/assignment
 * Returns assignment data (generates if needed).
 */
export const getAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const moduleId = parseInt(req.params.moduleId, 10);

    const module = await assertModuleOwnership(userId, moduleId);
    if (!module) return res.status(404).json({ message: 'Module not found' });

    const assignment = await ensureAssignment(moduleId, userId);

    res.json({
      assignment: {
        ...assignment,
        pdfUrl: assignment.pdfPath ? `/api/assignments/${assignment.id}/pdf` : null,
        submissionPdfUrl: assignment.submissionPdfPath
          ? `/api/assignments/${assignment.id}/submission-pdf`
          : null,
      },
    });
  } catch (error: unknown) {
    handleGeminiError(res, error);
  }
};

/**
 * GET /api/assignments/:id/pdf
 * Serves the generated assignment PDF.
 */
export const downloadAssignmentPdf = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const assignmentId = parseInt(req.params.id, 10);

    const assignment = await assertAssignmentOwnership(userId, assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (!assignment.pdfPath) {
      return res.status(404).json({ message: 'Assignment PDF not generated yet' });
    }

    const absolutePath = path.resolve(__dirname, '../../', assignment.pdfPath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'PDF file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${assignment.title.replace(/[^a-zA-Z0-9 ]/g, '')}_assignment.pdf"`
    );
    res.sendFile(absolutePath);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * POST /api/assignments/:id/submit
 * Accepts a PDF upload, saves it, extracts text, and grades via AI.
 */
export const submitAssignment = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const assignmentId = parseInt(req.params.id, 10);

    const assignment = await assertAssignmentOwnership(userId, assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    const file = req.file;
    if (!file) {
      return res.status(400).json({ message: 'No PDF file uploaded' });
    }

    const submissionPdfPath = `uploads/submissions/${file.filename}`;

    // Update assignment with submission path
    let updated = await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        submissionPdfPath,
        status: 'submitted',
      },
    });

    // Extract text from submitted PDF
    const studentText = await extractTextFromPdf(submissionPdfPath);

    // Parse rubric for grading
    let rubricData = {
      tasks: [] as string[],
      criteria: [] as { criterion: string; maxMarks: number }[],
      totalMarks: 100,
    };
    try {
      if (assignment.rubric) {
        rubricData = JSON.parse(assignment.rubric);
      }
    } catch {
      // Use defaults
    }

    // Grade with AI
    try {
      const gradingResult = await gradeAssignmentSubmission(
        assignment.title,
        assignment.description,
        rubricData.tasks || [],
        rubricData.criteria || [],
        studentText
      );

      updated = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          status: 'graded',
          score: gradingResult.score,
          feedback: JSON.stringify({
            overall: gradingResult.feedback,
            criterionScores: gradingResult.criterionScores,
          }),
          gradedAt: new Date(),
        },
      });
    } catch {
      // Grading failed, keep as submitted
      updated = await prisma.assignment.update({
        where: { id: assignmentId },
        data: { status: 'submitted' },
      });
    }

    await recordStudyActivity(userId, 20);

    res.json({
      assignment: {
        ...updated,
        pdfUrl: updated.pdfPath ? `/api/assignments/${updated.id}/pdf` : null,
        submissionPdfUrl: `/api/assignments/${updated.id}/submission-pdf`,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * GET /api/assignments/:id/submission-pdf
 * Serves the uploaded submission PDF.
 */
export const downloadSubmissionPdf = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const assignmentId = parseInt(req.params.id, 10);

    const assignment = await assertAssignmentOwnership(userId, assignmentId);
    if (!assignment) return res.status(404).json({ message: 'Assignment not found' });

    if (!assignment.submissionPdfPath) {
      return res.status(404).json({ message: 'No submission uploaded yet' });
    }

    const absolutePath = path.resolve(__dirname, '../../', assignment.submissionPdfPath);
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ message: 'Submission file not found on server' });
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="submission_${assignmentId}.pdf"`);
    res.sendFile(absolutePath);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
