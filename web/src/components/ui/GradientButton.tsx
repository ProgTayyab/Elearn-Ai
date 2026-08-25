import React from 'react';
import { Spinner } from './Spinner';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  children: React.ReactNode;
}

export const GradientButton: React.FC<GradientButtonProps> = ({
  loading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      className={`relative overflow-hidden group rounded-2xl transition-all duration-300 transform active:scale-98 font-semibold text-white tracking-wide shadow-lg hover:shadow-indigo-500/25 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-300 group-hover:opacity-90" />
      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <div className="relative flex items-center justify-center gap-2 py-4 px-6">
        {loading ? <Spinner size="sm" color="text-white" /> : children}
      </div>
    </button>
  );
};
