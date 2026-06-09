export default function FrenchFlag({ className = "h-3 w-[18px]" }) {
  return (
    <svg viewBox="0 0 18 12" className={`inline-block rounded-[2px] ring-1 ring-white/15 align-[-1px] ${className}`} aria-label="France">
      <rect width="6" height="12" x="0" fill="#1c3a9e" />
      <rect width="6" height="12" x="6" fill="#f2f2f2" />
      <rect width="6" height="12" x="12" fill="#d0303a" />
    </svg>
  );
}
