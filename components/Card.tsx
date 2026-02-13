import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-zinc-100 p-8 transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}
