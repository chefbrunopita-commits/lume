export function LumeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={className}>
      <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M12 6.8c.2 2.4 1.4 3.8 3.6 5.1-1.8.2-3.1 1.2-3.6 3.3-.5-2.1-1.8-3.1-3.6-3.3 2.2-1.3 3.4-2.7 3.6-5.1Z" fill="currentColor" />
    </svg>
  );
}
