interface Slice {
  code: string;
  name: string;
  count: number;
  color: string;
}

interface Props {
  slices: Slice[];
  total: number;
  /** Unidad en singular y plural, para el centro y los tooltips. Ej: ["mail enviado", "mails enviados"]. */
  unit: [string, string];
}

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;
const STROKE = 28;
const GAP = 3; // px de "aire" (color de superficie) entre segmentos
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

const fmt = (n: number) => n.toLocaleString("es-AR");

/**
 * Donut (pie con el centro vacío): cada slice es un arco dibujado con
 * stroke-dasharray sobre un círculo, dejando un hueco de GAP px entre
 * segmentos. El centro vacío queda libre para el número total.
 */
export default function DonutChart({ slices, total, unit }: Props) {
  const label = (n: number) => (n === 1 ? unit[0] : unit[1]);
  const gapCount = slices.length > 1 ? slices.length : 0;
  const usable = CIRCUMFERENCE - gapCount * GAP;

  let offset = 0;
  const arcs = slices.map((s) => {
    const length = total > 0 ? (s.count / total) * usable : 0;
    const arc = { ...s, length, offset };
    offset += length + GAP;
    return arc;
  });

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${fmt(total)} ${label(total)}: ${slices
        .map((s) => `${s.name} ${fmt(s.count)}`)
        .join(", ")}`}
      className="mx-auto h-52 w-52"
    >
      <circle
        cx={CENTER}
        cy={CENTER}
        r={RADIUS}
        fill="none"
        stroke="currentColor"
        className="text-ink/5"
        strokeWidth={STROKE}
      />
      {arcs.map((arc) => (
        <circle
          key={arc.code}
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={arc.color}
          strokeWidth={STROKE}
          strokeLinecap="butt"
          strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
          strokeDashoffset={-arc.offset}
          transform={`rotate(-90 ${CENTER} ${CENTER})`}
        >
          <title>
            {arc.name}: {fmt(arc.count)} {label(arc.count)}
          </title>
        </circle>
      ))}
      <text
        x={CENTER}
        y={CENTER - 4}
        textAnchor="middle"
        className="fill-ink text-3xl font-bold"
      >
        {fmt(total)}
      </text>
      <text
        x={CENTER}
        y={CENTER + 18}
        textAnchor="middle"
        className="fill-ink/50 text-[10px] font-semibold uppercase tracking-wide"
      >
        {label(total)}
      </text>
    </svg>
  );
}
