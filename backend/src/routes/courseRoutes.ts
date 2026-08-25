import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { getCourses, getCourse, createCourse, deleteCourse } from '../controllers/courseController';
import { getModules, getModule, getModuleSummary, completeModule } from '../controllers/moduleController';
import { getQuiz, submitAttempt } from '../controllers/quizController';
import { getAssignment, submitAssignment } from '../controllers/assignmentController';
import { getHistory, sendMessage } from '../controllers/chatController';
import { getAnalytics } from '../controllers/analyticsController';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Courses
router.get('/courses', getCourses);
router.post('/courses', createCourse);
router.get('/courses/:id', getCourse);
router.delete('/courses/:id', deleteCourse);

// Modules
router.get('/courses/:courseId/modules', getModules);
router.get('/modules/:id', getModule);
router.get('/modules/:id/summary', getModuleSummary);
router.patch('/modules/:id/complete', completeModule);

// Quiz
router.get('/modules/:moduleId/quiz', getQuiz);
router.post('/quizzes/:quizId/attempt', submitAttempt);

// Assignment
router.get('/modules/:moduleId/assignment', getAssignment);
router.patch('/assignments/:id/submit', submitAssignment);

// Chat
router.get('/courses/:courseId/chat', getHistory);
router.post('/courses/:courseId/chat', sendMessage);

// Analytics
router.get('/analytics', getAnalytics);

export default router;
