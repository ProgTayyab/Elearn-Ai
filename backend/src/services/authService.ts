import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret';
const REFRESH_TOKEN_EXPIRY_DAYS = parseInt(process.env.REFRESH_TOKEN_EXPIRY_DAYS || '30', 10);

// ── Types ──────────────────────────────────────────────────────────────
export interface JwtUserPayload {
    userId: number;
}

// ── Access tokens ──────────────────────────────────────────────────────
export const signToken = (payload: JwtUserPayload): string => {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: '15m' });
};

export const verifyToken = (token: string): JwtUserPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtUserPayload;
};

// ── Refresh tokens ─────────────────────────────────────────────────────
export const signRefreshToken = async (userId: number): Promise<string> => {
    const token = crypto.randomBytes(40).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRY_DAYS);

    await prisma.refreshToken.create({
        data: { token, userId, expiresAt },
    });

    return token;
};

export const rotateRefreshToken = async (
    oldToken: string
): Promise<{ accessToken: string; refreshToken: string }> => {
    const stored = await prisma.refreshToken.findUnique({ where: { token: oldToken } });

    if (!stored || stored.revoked || stored.expiresAt < new Date()) {
        throw new Error('Invalid or expired refresh token');
    }

    // Revoke old token
    await prisma.refreshToken.update({
        where: { id: stored.id },
        data: { revoked: true },
    });

    // Issue new pair
    const accessToken = signToken({ userId: stored.userId });
    const refreshToken = await signRefreshToken(stored.userId);

    return { accessToken, refreshToken };
};

export const revokeRefreshToken = async (token: string): Promise<void> => {
    await prisma.refreshToken.updateMany({
        where: { token, revoked: false },
        data: { revoked: true },
    });
};

// ── Password helpers ───────────────────────────────────────────────────
export const hashPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
    return bcrypt.compare(password, hash);
};
