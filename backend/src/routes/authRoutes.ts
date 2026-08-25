import { Router } from 'express';
import { register, login, getMe, updateProfile, refresh, logout } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';
import { validateRegister, validateLogin } from '../middleware/validateMiddleware';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authMiddleware, getMe);
router.patch('/profile', authMiddleware, updateProfile);
router.post('/refresh', refresh);
router.post('/logout', authMiddleware, logout);

export default router;
