import { cn } from '../../lib/cn';

const VARIANTS = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 disabled:bg-primary-300',
  accent: 'bg-accent-600 text-ink-900 hover:bg-accent-700 active:bg-accent-800 disabled:bg-accent-200 disabled:text-ink-400',
  secondary: 'bg-white text-ink-700 border border-ink-200 hover:bg-ink-50 hover:border-ink-300 active:bg-ink-100 disabled:text-ink-400',
  ghost: 'bg-transparent text-ink-600 hover:bg-ink-100 hover:text-ink-900 disabled:text-ink-400',
  danger: 'bg-danger-600 text-white hover:bg-danger-700 active:bg-danger-700/90 disabled:bg-danger-200 disabled:text-white/70',
  success: 'bg-success-600 text-white hover:bg-success-700 active:bg-success-700/90 disabled:bg-success-200 disabled:text-white/70',
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs gap-1.5 rounded-lg',
  md: 'px-4 py-2.5 text-sm gap-2 rounded-xl',
  lg: 'px-6 py-3 text-sm gap-2 rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className,
  children,
  type = 'button',
  href,
  ...rest
}) {
  const classes = cn(
    'inline-flex items-center justify-center font-medium whitespace-nowrap',
    'transition-all duration-150 ease-out',
    'disabled:cursor-not-allowed',
    'focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  const spinner = loading && (
    <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin shrink-0" />
  );

  if (href) {
    return (
      <a href={href} className={classes} {...rest}>
        {spinner}
        {children}
      </a>
    );
  }

  return (
    <button type={type} disabled={disabled || loading} className={classes} {...rest}>
      {spinner}
      {children}
    </button>
  );
}
