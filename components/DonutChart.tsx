interface Slice {
  code: string;
  name: string;
  count: number;
  color: string;
}

interface Props {
  slices: Slice[];
  total: number;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 80;
const STROKE = 28;
const GAP = 3; // px de "aire" (color de superficie) entre segmentos
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Donut (pie con el centro vacío): cada slice es un arco dibujado con
 * stroke-dasharray sobre un círculo, dejando un hueco de GAP px entre
 * segmentos. El centro vacío queda libre para el número total.
 */
export default function DonutChart({ slices, total }: Props) {
  const gapCount = slices.length > 1 ? slices.length : 0;
  const usable = CIRCUMFERENCE - gapCount * GAP;

  let offset = 0;
  const arcs = slices.map((s) => {
    const length = (s.count / total) * usable;
    const arc = { ...s, length, offset };
    offset += length + GAP;
    return arc;
  });

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      role="img"
      aria-label={`${total} ${total === 1 ? "persona" : "personas"} ya le escribieron a sus representantes: ${slices
        .map((s) => `${s.name} ${s.count}`)
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
            {arc.name}: {arc.count} {arc.count === 1 ? "persona" : "personas"}
          </title>
        </circle>
      ))}
      <text
        x={CENTER}
        y={CENTER - 4}
        textAnchor="middle"
        className="fill-ink text-3xl font-bold"
      >
        {total}
      </text>
      <text
        x={CENTER}
        y={CENTER + 18}
        textAnchor="middle"
        className="fill-ink/50 text-[10px] font-semibold uppercase tracking-wide"
      >
        {total === 1 ? "carta enviada" : "cartas enviadas"}
      </text>
    </svg>
  );
}
