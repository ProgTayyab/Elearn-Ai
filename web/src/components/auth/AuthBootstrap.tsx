import React, { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Spinner } from '../ui/Spinner';

interface AuthBootstrapProps {
  children: React.ReactNode;
}

/** Restores session from localStorage and validates with /auth/me on app load */
export const AuthBootstrap: React.FC<AuthBootstrapProps> = ({ children }) => {
  const { isLoading, hydrate } = useAuthStore();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background-dark text-foreground-dark gap-4">
        <Spinner size="lg" color="text-indigo-500" />
        <p className="text-sm font-medium text-muted-foreground-dark animate-pulse">
          Restoring your session...
        </p>
      </div>
    );
  }

  return <>{children}</>;
};
