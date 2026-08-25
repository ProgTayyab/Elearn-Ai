export interface UserPreferences {
  theme?: 'dark' | 'light';
  emailNotifications?: boolean;
  defaultDifficulty?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  username: string | null;
  profilePicture: string | null;
  preferences: UserPreferences;
  streak: number;
  totalStudyMinutes: number;
  createdAt: string;
  lastLoginAt: string | null;
}

export interface Course {
  id: number;
  title: string;
  topic: string;
  difficulty: string;
  durationWeeks: number;
  status: string;
  progress: number;
  modules: { id: number; status: string }[];
}

export interface ModuleObjective {
  id: number;
  moduleId: number;
  text: string;
  completed: boolean;
}

export interface Resource {
  id: number;
  moduleId: number;
  type: string;
  title: string;
  url: string;
  source: string;
  readTime: number;
}

export interface Module {
  id: number;
  courseId: number;
  weekNumber: number;
  title: string;
  description: string;
  status: string;
  order: number;
  objectives: ModuleObjective[];
  resources: Resource[];
}

export interface QuizOption {
  id: number;
  text: string;
}

export interface Question {
  id: number;
  text: string;
  type: string;
  order: number;
  options: QuizOption[];
}

export interface Quiz {
  id: number;
  moduleId: number;
  questions: Question[];
}

export interface Assignment {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  language: string;
  status: string;
}

export interface ChatMessage {
  id: number;
  role: 'user' | 'ai';
  content: string;
  createdAt: string;
}

export interface CourseStats {
  id: number;
  title: string;
  progress: number;
}

export interface CourseRisk {
  id: number;
  courseId: number;
  courseTitle: string;
  riskLevel: string;
  predictedAt: string;
}

export interface Analytics {
  streak: number;
  totalStudyMinutes: number;
  avgScore: number;
  courseCount: number;
  courseStats: CourseStats[];
  risks: CourseRisk[];
}
