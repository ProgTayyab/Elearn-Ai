type UserProfileRow = {
  id: number;
  email: string;
  name: string;
  username: string | null;
  profilePicture: string | null;
  preferences: string;
  streak: number;
  totalStudyMinutes: number;
  createdAt: Date;
  lastLoginAt: Date | null;
};

export interface UserPreferences {
  theme?: 'dark' | 'light';
  emailNotifications?: boolean;
  defaultDifficulty?: string;
}

export type PublicUser = {
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
};

export function parsePreferences(raw: string): UserPreferences {
  try {
    const parsed = JSON.parse(raw || '{}');
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

export function serializeUser(user: UserProfileRow): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    profilePicture: user.profilePicture,
    preferences: parsePreferences(user.preferences),
    streak: user.streak,
    totalStudyMinutes: user.totalStudyMinutes,
    createdAt: user.createdAt.toISOString(),
    lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
  };
}

export function slugifyUsername(base: string): string {
  return base
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 24) || 'learner';
}

export async function generateUniqueUsername(
  prisma: { user: { findUnique: (args: { where: { username: string } }) => Promise<unknown | null> } },
  email: string,
  name: string
): Promise<string> {
  const base = slugifyUsername(name || email.split('@')[0]);
  let candidate = base;
  let n = 0;
  while (await prisma.user.findUnique({ where: { username: candidate } })) {
    n += 1;
    candidate = `${base}_${n}`;
  }
  return candidate;
}
