export default function ProgressRing({ pct, size = 84 }: { pct: number; size?: number }) {
  const stroke = 8;
  const radius = (size - stroke) / 2;
  const circumferencia = 2 * Math.PI * radius;
  const offset = circumferencia * (1 - Math.min(Math.max(pct, 0), 100) / 100);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        className="text-neutral-800"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={stroke}
        strokeDasharray={circumferencia}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        className="text-[#B97BD9] transition-all duration-500"
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="middle"
        textAnchor="middle"
        className="fill-neutral-100 font-semibold"
        style={{ fontSize: size * 0.22 }}
      >
        {Math.round(pct)}%
      </text>
    </svg>
  );
}
