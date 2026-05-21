import type { SVGProps } from "react";

interface TunePulseLogoProps extends SVGProps<SVGSVGElement> {
  title?: string;
}

export default function TunePulseLogo({ title = "TunePulse logo", ...props }: TunePulseLogoProps) {
  return (
    <svg viewBox="0 0 32 32" fill="none" aria-label={title} role="img" {...props}>
      <title>{title}</title>
      <rect x="4" y="14" width="4" height="14" rx="2" fill="#1DB954" fillOpacity="0.55" />
      <rect x="14" y="8" width="4" height="20" rx="2" fill="#1DB954" fillOpacity="0.8" />
      <rect x="24" y="4" width="4" height="24" rx="2" fill="#1DB954" fillOpacity="1" />
    </svg>
  );
}