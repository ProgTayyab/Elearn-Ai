import { GoogleGenerativeAI, type Content } from '@google/generative-ai';

const DEFAULT_MODELS = [
  process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
  'gemini-1.5-flash',
  'gemini-1.5-flash-8b',
].filter((v, i, a) => a.indexOf(v) === i);

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 800;

export type GeminiErrorCode =
  | 'INVALID_KEY'
  | 'RATE_LIMIT'
  | 'NETWORK'
  | 'EMPTY'
  | 'API_DOWN'
  | 'UNKNOWN';

export class GeminiServiceError extends Error {
  constructor(
    message: string,
    public code: GeminiErrorCode,
    public statusCode = 503
  ) {
    super(message);
    this.name = 'GeminiServiceError';
  }
}

function getClient(): GoogleGenerativeAI {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new GeminiServiceError(
      'Gemini API key is not configured. Set GEMINI_API_KEY in backend .env',
      'INVALID_KEY',
      500
    );
  }
  return new GoogleGenerativeAI(apiKey);
}

function mapError(err: unknown): GeminiServiceError {
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('api_key') || lower.includes('api key') || lower.includes('invalid') && lower.includes('key')) {
    return new GeminiServiceError('Invalid Gemini API key.', 'INVALID_KEY', 401);
  }
  if (lower.includes('429') || lower.includes('quota') || lower.includes('rate')) {
    return new GeminiServiceError('Gemini rate limit reached. Please try again shortly.', 'RATE_LIMIT', 429);
  }
  if (lower.includes('fetch') || lower.includes('network') || lower.includes('econnrefused') || lower.includes('timeout')) {
    return new GeminiServiceError('Network error contacting Gemini.', 'NETWORK', 503);
  }
  if (lower.includes('503') || lower.includes('unavailable') || lower.includes('overloaded')) {
    return new GeminiServiceError('Gemini service is temporarily unavailable.', 'API_DOWN', 503);
  }

  return new GeminiServiceError(message || 'Gemini request failed.', 'UNKNOWN', 503);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const mapped = mapError(err);
      const retryable = ['RATE_LIMIT', 'NETWORK', 'API_DOWN'].includes(mapped.code);
      if (!retryable || attempt === MAX_RETRIES - 1) throw mapped;
      await sleep(RETRY_BASE_MS * Math.pow(2, attempt));
    }
  }
  throw mapError(lastError);
}

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenced) return fenced[1].trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start >= 0 && end > start) return text.slice(start, end + 1);
  return text.trim();
}

export interface GeneratedResource {
  type: string;
  title: string;
  url: string;
  source: string;
  readTime: number;
}

export interface GeneratedModule {
  weekNumber: number;
  title: string;
  description: string;
  objectives: string[];
  resources: GeneratedResource[];
}

export interface GeneratedCoursePlan {
  title: string;
  modules: GeneratedModule[];
}

export interface GeneratedQuizQuestion {
  text: string;
  options: { text: string; isCorrect: boolean }[];
}

async function generateText(systemInstruction: string, userPrompt: string): Promise<string> {
  let lastError: unknown;

  for (const modelName of DEFAULT_MODELS) {
    try {
      return await withRetry(async () => {
        const model = getClient().getGenerativeModel({
          model: modelName,
          systemInstruction,
        });
        const result = await model.generateContent(userPrompt);
        const text = result.response.text()?.trim();
        if (!text) {
          throw new GeminiServiceError('Gemini returned an empty response.', 'EMPTY', 502);
        }
        return text;
      });
    } catch (err) {
      lastError = err;
      const mapped = err instanceof GeminiServiceError ? err : mapError(err);
      if (mapped.code === 'INVALID_KEY') throw mapped;
    }
  }

  throw mapError(lastError);
}

/** Fallback tutor reply when Gemini is unavailable */
export function fallbackChatReply(userMessage: string, courseTopic: string): string {
  const templates = [
    `Great question about ${courseTopic}! Focus on understanding core concepts first, then practice with small exercises.`,
    `For ${courseTopic}, I recommend reviewing this week's module objectives and trying the quiz to reinforce learning.`,
    `That's an important topic in ${courseTopic}. Break the problem into smaller steps and test your understanding with examples.`,
  ];
  const index = Math.abs(userMessage.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % templates.length;
  return (
    templates[index] +
    '\n\n_(Note: Live Gemini responses are temporarily unavailable — using offline tutor mode. Check your API quota or try again later.)_'
  );
}

export async function generateChatReply(params: {
  courseTitle: string;
  courseTopic: string;
  difficulty: string;
  moduleSummaries: string;
  history: { role: string; content: string }[];
  userMessage: string;
}): Promise<string> {
  const systemInstruction = `You are NeuralLearn AI Tutor, an expert teaching assistant.
You help students learn "${params.courseTopic}" (${params.courseTitle}, ${params.difficulty} level).
Use the course syllabus context below. Be clear, encouraging, and accurate. Keep answers concise unless the student asks for depth.
If unsure, say so. Never invent harmful content.

Syllabus:
${params.moduleSummaries}`;

  const historyBlock = params.history
    .slice(-12)
    .map((m) => `${m.role === 'user' ? 'Student' : 'Tutor'}: ${m.content}`)
    .join('\n');

  const prompt = `${historyBlock ? `Conversation so far:\n${historyBlock}\n\n` : ''}Student: ${params.userMessage}\n\nTutor:`;

  return generateText(systemInstruction, prompt);
}

export async function generateCoursePlan(
  topic: string,
  difficulty: string,
  durationWeeks: number
): Promise<GeneratedCoursePlan> {
  const prompt = `Create a ${durationWeeks}-week online course curriculum for the topic "${topic}" at ${difficulty} level.

Return ONLY valid JSON (no markdown) with this exact shape:
{
  "title": "string",
  "modules": [
    {
      "weekNumber": 1,
      "title": "string",
      "description": "2-3 sentences",
      "objectives": ["objective 1", "objective 2"],
      "resources": [
        {
          "type": "article",
          "title": "string",
          "url": "https://...",
          "source": "string",
          "readTime": 15
        }
      ]
    }
  ]
}

Requirements:
- Exactly ${durationWeeks} modules, weekNumber 1..${durationWeeks}
- Progressive difficulty week over week
- Realistic resource titles; use plausible https URLs (documentation, MDN, official docs)
- 2 objectives and 1-2 resources per module`;

  const raw = await generateText(
    'You are a curriculum designer. Output strict JSON only.',
    prompt
  );

  try {
    const parsed = JSON.parse(extractJson(raw)) as GeneratedCoursePlan;
    if (!parsed.title || !Array.isArray(parsed.modules) || parsed.modules.length === 0) {
      throw new Error('Invalid course structure');
    }
    return parsed;
  } catch {
    throw new GeminiServiceError('Failed to parse AI-generated course plan.', 'EMPTY', 502);
  }
}

export async function generateQuizForModule(
  topic: string,
  moduleTitle: string,
  moduleDescription: string,
  questionCount = 5
): Promise<GeneratedQuizQuestion[]> {
  const prompt = `Create ${questionCount} multiple-choice quiz questions for:
Topic: ${topic}
Module: ${moduleTitle}
Description: ${moduleDescription}

Return ONLY valid JSON array:
[
  {
    "text": "question",
    "options": [
      { "text": "option A", "isCorrect": false },
      { "text": "option B", "isCorrect": true }
    ]
  }
]

Each question needs exactly 4 options and exactly one isCorrect: true.`;

  const raw = await generateText(
    'You are an assessment author. Output strict JSON only.',
    prompt
  );

  try {
    const parsed = JSON.parse(extractJson(raw)) as GeneratedQuizQuestion[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('empty quiz');
    return parsed;
  } catch {
    throw new GeminiServiceError('Failed to parse AI-generated quiz.', 'EMPTY', 502);
  }
}

export async function generateAssignmentDescription(
  topic: string,
  moduleTitle: string,
  difficulty: string
): Promise<{ title: string; description: string; language: string }> {
  const prompt = `Create a coding assignment for module "${moduleTitle}" in course "${topic}" (${difficulty}).
Return ONLY JSON: { "title": "...", "description": "detailed instructions", "language": "Python|JavaScript|etc" }`;

  const raw = await generateText(
    'You are a programming instructor. Output strict JSON only.',
    prompt
  );

  try {
    return JSON.parse(extractJson(raw));
  } catch {
    return {
      title: `${moduleTitle} — Practice Assignment`,
      description: `Apply concepts from ${moduleTitle} in a hands-on exercise related to ${topic}.`,
      language: 'Python',
    };
  }
}

export async function generateModuleSummaryDocument(params: {
  courseTitle: string;
  courseTopic: string;
  difficulty: string;
  weekNumber: number;
  moduleTitle: string;
  description: string;
  objectives: string[];
  resources: { title: string; type: string; url: string; readTime: number }[];
}): Promise<string> {
  const objectivesBlock = params.objectives.map((o, i) => `${i + 1}. ${o}`).join('\n');
  const resourcesBlock = params.resources
    .map((r) => `- ${r.title} (${r.type}, ${r.readTime} min): ${r.url || 'N/A'}`)
    .join('\n');

  const prompt = `Write a complete Week ${params.weekNumber} study guide document in Markdown for this course module.

Course: ${params.courseTitle}
Topic: ${params.courseTopic}
Difficulty: ${params.difficulty}
Module title: ${params.moduleTitle}
Module description: ${params.description}

Objectives:
${objectivesBlock}

Resources:
${resourcesBlock}

Requirements for the document:
- Use clear Markdown headings (# ## ###)
- Include: title, week overview, all week ${params.weekNumber} learning objectives, detailed content sections explaining concepts for beginners at ${params.difficulty} level, resource summaries, a day-by-day study plan, and next steps
- Minimum 600 words of educational content
- Expand on the module description with teachable material (definitions, examples, tips)
- Do NOT wrap in code fences — output raw Markdown only`;

  return generateText(
    'You are an expert curriculum writer creating weekly study guides for online learners.',
    prompt
  );
}

export interface GeneratedAssignmentContent {
  title: string;
  description: string;
  language: string;
  tasks: string[];
  rubric: { criterion: string; maxMarks: number }[];
  totalMarks: number;
}

export async function generateAssignmentContent(
  topic: string,
  moduleTitle: string,
  difficulty: string
): Promise<GeneratedAssignmentContent> {
  const prompt = `Create a detailed assignment for module "${moduleTitle}" in course "${topic}" (${difficulty} level).

Return ONLY valid JSON with this exact shape:
{
  "title": "assignment title",
  "description": "detailed description of the assignment (2-3 paragraphs)",
  "language": "subject area or programming language",
  "tasks": [
    "Task 1: detailed task description",
    "Task 2: detailed task description",
    "Task 3: detailed task description",
    "Task 4: detailed task description",
    "Task 5: detailed task description"
  ],
  "rubric": [
    { "criterion": "Understanding of core concepts", "maxMarks": 20 },
    { "criterion": "Problem solving approach", "maxMarks": 25 },
    { "criterion": "Completeness of answers", "maxMarks": 20 },
    { "criterion": "Clarity and presentation", "maxMarks": 15 },
    { "criterion": "Application of knowledge", "maxMarks": 20 }
  ],
  "totalMarks": 100
}

Requirements:
- 5 tasks/questions of progressive difficulty
- Rubric criteria must sum to totalMarks (100)
- Tasks should be practical and require critical thinking
- Description should explain what is expected`;

  const raw = await generateText(
    'You are a professor creating academic assignments. Output strict JSON only.',
    prompt
  );

  try {
    const parsed = JSON.parse(extractJson(raw)) as GeneratedAssignmentContent;
    if (!parsed.title || !Array.isArray(parsed.tasks) || parsed.tasks.length === 0) {
      throw new Error('Invalid assignment structure');
    }
    // Ensure totalMarks consistency
    if (!parsed.totalMarks) {
      parsed.totalMarks = parsed.rubric?.reduce((s, r) => s + r.maxMarks, 0) || 100;
    }
    return parsed;
  } catch {
    // Fallback
    return {
      title: `${moduleTitle} — Assignment`,
      description: `Apply concepts from ${moduleTitle} in a comprehensive assignment related to ${topic}.`,
      language: topic,
      tasks: [
        `Explain the key concepts covered in ${moduleTitle}.`,
        `Provide a practical example demonstrating your understanding of ${topic}.`,
        `Compare and contrast two approaches discussed in this module.`,
        `Solve the following problem using techniques from ${moduleTitle}.`,
        `Reflect on how ${topic} can be applied in real-world scenarios.`,
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
  }
}

export interface GradingResult {
  score: number;
  maxScore: number;
  feedback: string;
  criterionScores: { criterion: string; score: number; maxMarks: number; comment: string }[];
}

export async function gradeAssignmentSubmission(
  assignmentTitle: string,
  assignmentDescription: string,
  tasks: string[],
  rubric: { criterion: string; maxMarks: number }[],
  studentText: string
): Promise<GradingResult> {
  const rubricBlock = rubric
    .map((r) => `- ${r.criterion} (max ${r.maxMarks} marks)`)
    .join('\n');
  const tasksBlock = tasks.map((t, i) => `${i + 1}. ${t}`).join('\n');
  const maxScore = rubric.reduce((s, r) => s + r.maxMarks, 0);

  const prompt = `You are grading a student's assignment submission. Evaluate it fairly and provide constructive feedback.

ASSIGNMENT TITLE: ${assignmentTitle}
ASSIGNMENT DESCRIPTION: ${assignmentDescription}

TASKS:
${tasksBlock}

RUBRIC:
${rubricBlock}

STUDENT'S SUBMISSION (extracted text):
---
${studentText.slice(0, 8000)}
---

Grade the submission and return ONLY valid JSON:
{
  "score": <total score out of ${maxScore}>,
  "maxScore": ${maxScore},
  "feedback": "Overall feedback paragraph — be constructive, specific, and encouraging",
  "criterionScores": [
    {
      "criterion": "${rubric[0]?.criterion || 'Criterion'}",
      "score": <marks awarded>,
      "maxMarks": ${rubric[0]?.maxMarks || 20},
      "comment": "specific feedback for this criterion"
    }
  ]
}

Rules:
- Be fair but thorough
- Provide specific comments for each criterion
- The total score should equal the sum of criterion scores
- If the submission is blank or irrelevant, give a low score with helpful guidance
- Scores must be non-negative integers not exceeding maxMarks`;

  const raw = await generateText(
    'You are a fair and thorough academic grader. Output strict JSON only.',
    prompt
  );

  try {
    const parsed = JSON.parse(extractJson(raw)) as GradingResult;
    if (typeof parsed.score !== 'number') throw new Error('No score');
    parsed.maxScore = maxScore;
    return parsed;
  } catch {
    // Fallback: give a baseline grade
    return {
      score: Math.round(maxScore * 0.5),
      maxScore,
      feedback:
        'Your submission has been received. The AI grading system was unable to fully evaluate your work at this time. Please consult with your instructor for a detailed review.',
      criterionScores: rubric.map((r) => ({
        criterion: r.criterion,
        score: Math.round(r.maxMarks * 0.5),
        maxMarks: r.maxMarks,
        comment: 'Evaluation pending detailed review.',
      })),
    };
  }
}

export function handleGeminiError(res: import('express').Response, error: unknown): void {
  if (error instanceof GeminiServiceError) {
    res.status(error.statusCode).json({ message: error.message, code: error.code });
    return;
  }
  const mapped = mapError(error);
  res.status(mapped.statusCode).json({ message: mapped.message, code: mapped.code });
}

