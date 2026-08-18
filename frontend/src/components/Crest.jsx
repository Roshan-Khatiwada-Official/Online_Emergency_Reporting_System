export default function Crest({ className = "", size = 40 }) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="crestShield" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0b2447" />
          <stop offset="100%" stopColor="#071a33" />
        </linearGradient>
      </defs>
      <path
        d="M50 4 L90 18 V46 C90 70 73 88 50 96 C27 88 10 70 10 46 V18 Z"
        fill="url(#crestShield)"
        stroke="#dc143c"
        strokeWidth="3"
      />
      <path d="M50 12 L82 23 V46 C82 66 68 81 50 88 C32 81 18 66 18 46 V23 Z" fill="#0f2d57" />
      <path d="M30 62 L45 34 L52 46 L60 30 L72 62 Z" fill="#c7d3ea" opacity="0.9" />
      <circle cx="50" cy="24" r="7" fill="#dc143c" />
      <path d="M50 17 L52 23 H48 Z" fill="#dc143c" />
      <rect x="14" y="66" width="72" height="6" fill="#003893" opacity="0.85" />
    </svg>
  );
}
