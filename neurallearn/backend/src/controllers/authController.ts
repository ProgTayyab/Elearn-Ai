import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import {
    hashPassword,
    comparePassword,
    signToken,
    signRefreshToken,
    rotateRefreshToken,
    revokeRefreshToken,
} from '../services/authService';

const prisma = new PrismaClient();

// ── Register ───────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
    try {
        const { email, password, name } = req.body;

        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const passwordHash = await hashPassword(password);
        const user = await prisma.user.create({
            data: { email, passwordHash, name },
        });

        const token = signToken({ userId: user.id });
        const refreshToken = await signRefreshToken(user.id);

        res.status(201).json({
            token,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Login ──────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !(await comparePassword(password, user.passwordHash))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = signToken({ userId: user.id });
        const refreshToken = await signRefreshToken(user.id);

        res.json({
            token,
            refreshToken,
            user: { id: user.id, email: user.email, name: user.name },
        });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Get current user ───────────────────────────────────────────────────
export const getMe = async (req: Request, res: Response) => {
    try {
        const userId = req.user!.userId;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                streak: true,
                totalStudyMinutes: true,
            },
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ user });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// ── Refresh tokens ─────────────────────────────────────────────────────
export const refresh = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken || typeof refreshToken !== 'string') {
            return res.status(400).json({ message: 'Refresh token is required' });
        }

        const tokens = await rotateRefreshToken(refreshToken);
        res.json(tokens);
    } catch (error: any) {
        res.status(401).json({ message: error.message });
    }
};

// ── Logout ─────────────────────────────────────────────────────────────
export const logout = async (req: Request, res: Response) => {
    try {
        const { refreshToken } = req.body;

        if (refreshToken && typeof refreshToken === 'string') {
            await revokeRefreshToken(refreshToken);
        }

        res.json({ message: 'Logged out successfully' });
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
