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
import {
  serializeUser,
  generateUniqueUsername,
  parsePreferences,
  type UserPreferences,
} from '../utils/userProfile';

const prisma = new PrismaClient();

const userSelect = {
  id: true,
  email: true,
  name: true,
  username: true,
  profilePicture: true,
  preferences: true,
  streak: true,
  totalStudyMinutes: true,
  createdAt: true,
  lastLoginAt: true,
} as const;

async function issueAuthResponse(userId: number, res: Response, status = 200) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: userSelect });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = signToken({ userId: user.id });
  const refreshToken = await signRefreshToken(user.id);

  return res.status(status).json({
    token,
    refreshToken,
    user: serializeUser(user),
  });
}

// ── Register ───────────────────────────────────────────────────────────
export const register = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');
    const name = String(req.body.name ?? '').trim().slice(0, 100);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const passwordHash = await hashPassword(password);
    const username = await generateUniqueUsername(prisma, email, name);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
        username,
        preferences: JSON.stringify({ theme: 'dark', emailNotifications: true }),
        lastLoginAt: new Date(),
      },
      select: userSelect,
    });

    const token = signToken({ userId: user.id });
    const refreshToken = await signRefreshToken(user.id);

    res.status(201).json({
      token,
      refreshToken,
      user: serializeUser(user),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── Login ──────────────────────────────────────────────────────────────
export const login = async (req: Request, res: Response) => {
  try {
    const email = String(req.body.email ?? '').trim().toLowerCase();
    const password = String(req.body.password ?? '');

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !(await comparePassword(password, user.passwordHash))) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    return issueAuthResponse(user.id, res);
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
      select: userSelect,
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ user: serializeUser(user) });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// ── Update profile ─────────────────────────────────────────────────────
export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { name, username, profilePicture, preferences } = req.body;

    const data: Record<string, unknown> = {};

    if (name !== undefined) {
      const trimmed = String(name).trim().slice(0, 100);
      if (!trimmed) return res.status(400).json({ message: 'Name cannot be empty' });
      data.name = trimmed;
    }

    if (username !== undefined) {
      const trimmed = String(username).trim().toLowerCase().slice(0, 30);
      if (!/^[a-z0-9_]{3,30}$/.test(trimmed)) {
        return res.status(400).json({
          message: 'Username must be 3-30 characters (letters, numbers, underscore)',
        });
      }
      const taken = await prisma.user.findFirst({
        where: { username: trimmed, NOT: { id: userId } },
      });
      if (taken) return res.status(400).json({ message: 'Username is already taken' });
      data.username = trimmed;
    }

    if (profilePicture !== undefined) {
      const url = String(profilePicture).trim().slice(0, 500);
      data.profilePicture = url || null;
    }

    if (preferences !== undefined) {
      const current = await prisma.user.findUnique({ where: { id: userId }, select: { preferences: true } });
      const merged: UserPreferences = {
        ...parsePreferences(current?.preferences ?? '{}'),
        ...(typeof preferences === 'object' ? preferences : {}),
      };
      data.preferences = JSON.stringify(merged);
    }

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'No valid fields to update' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: userSelect,
    });

    res.json({ user: serializeUser(user) });
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
    res.json({ ...tokens, token: tokens.accessToken });
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
