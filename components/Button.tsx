import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({ 
  children, 
  variant = 'primary',
  size = 'md',
  className = '', 
  ...props 
}: ButtonProps) {
  const baseStyles = 'rounded-xl font-semibold transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';
  const sizeStyles = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg',
  };
  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm focus:ring-indigo-500',
    secondary: 'bg-white text-zinc-700 border-2 border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 shadow-sm focus:ring-zinc-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
