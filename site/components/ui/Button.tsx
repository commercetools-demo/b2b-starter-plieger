import Link from 'next/link';
import { classNames } from '@/lib/utils';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

const variantStyles = {
  primary:
    'bg-primary text-white hover:bg-primary-dark focus:ring-primary',
  secondary:
    'bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 focus:ring-slate-400',
  danger:
    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  ghost:
    'bg-transparent text-slate-600 hover:bg-slate-100 focus:ring-slate-400',
} as const;

const sizeStyles = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variantStyles;
  size?: keyof typeof sizeStyles;
  loading?: boolean;
  href?: string;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  href,
  disabled,
  className,
  children,
  ...rest
}: ButtonProps) {
  const baseClasses = classNames(
    'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
    variantStyles[variant],
    sizeStyles[size],
    className,
  );

  const content = (
    <>
      {loading && (
        <svg
          className="mr-2 h-4 w-4 animate-spin"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
      )}
      {children}
    </>
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={baseClasses} onClick={rest.onClick as any}>
        {content}
      </Link>
    );
  }

  return (
    <button
      className={baseClasses}
      disabled={disabled || loading}
      {...rest}
    >
      {content}
    </button>
  );
}
