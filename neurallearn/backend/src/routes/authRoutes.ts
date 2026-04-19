import { Router } from 'express';
import { register, login, getMe, refresh, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';
import { validateRegister, validateLogin } from '../middleware/validate';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authMiddleware, getMe);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

export default router;
