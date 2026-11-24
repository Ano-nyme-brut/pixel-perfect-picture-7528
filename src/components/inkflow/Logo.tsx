import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn("size-7", className)}>
      <defs>
        <linearGradient id="inkflow-g" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="var(--primary-glow)" />
          <stop offset="1" stopColor="var(--primary)" />
        </linearGradient>
      </defs>
      <path
        d="M16 2c4.5 6.2 9 11 9 16.4A9 9 0 0 1 16 27.5a9 9 0 0 1-9-9.1C7 13 11.5 8.2 16 2Z"
        fill="none"
        stroke="url(#inkflow-g)"
        strokeWidth="1.6"
      />
      <path d="M16 10v12.5M12.5 18.5 16 22.5l3.5-4" fill="none" stroke="url(#inkflow-g)" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark />
      <span className="font-display text-2xl leading-none">
        Ink<span className="text-gold">Flow</span>
      </span>
    </Link>
  );
}
