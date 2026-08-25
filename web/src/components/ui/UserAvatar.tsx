import React, { useState } from 'react';
import { AuthUser } from '../../types';

interface UserAvatarProps {
  user: AuthUser | null;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm rounded-lg',
  md: 'w-10 h-10 text-sm rounded-xl',
  lg: 'w-16 h-16 text-xl rounded-2xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({ user, size = 'md', className = '' }) => {
  const sizeClass = sizeClasses[size];
  const initial = user?.name?.charAt(0).toUpperCase() ?? 'L';
  const [imgError, setImgError] = useState(false);

  if (user?.profilePicture && !imgError) {
    return (
      <img
        src={user.profilePicture}
        alt={user.name}
        className={`${sizeClass} object-cover border border-white/10 ${className}`}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div
      className={`${sizeClass} bg-gradient-to-r from-purple-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-inner ${className}`}
      aria-hidden
    >
      {initial}
    </div>
  );
};

export function getDisplayName(user: AuthUser | null): string {
  if (!user) return 'Learner';
  return user.name?.trim() || user.username || user.email.split('@')[0];
}

export function getFirstName(user: AuthUser | null): string {
  const name = getDisplayName(user);
  return name.split(' ')[0];
}
