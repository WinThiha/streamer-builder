import { Link } from 'react-router-dom';

type BackButtonProps = {
  to?: string;
  ariaLabel?: string;
  className?: string;
};

const buttonClassName =
  'inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/70 text-white shadow-[0_0_0_1px_rgba(0,0,0,0.4),0_4px_12px_rgba(0,0,0,0.5)] backdrop-blur-md transition-all duration-200 hover:scale-105 hover:border-white/70 hover:bg-black/85 hover:shadow-[0_0_0_1px_rgba(255,255,255,0.2),0_6px_16px_rgba(0,0,0,0.6)] active:scale-95';

export function BackButton({
  to = '/',
  ariaLabel = 'Back to browse',
  className = '',
}: BackButtonProps) {
  return (
    <Link to={to} aria-label={ariaLabel} className={`${buttonClassName} ${className}`.trim()}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        aria-hidden
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </Link>
  );
}
