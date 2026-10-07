/**
 * Banderas simplificadas en SVG (no emoji: Windows muestra los emoji de
 * bandera como las letras "AR"/"UY"). Sin bandera para el país, no dibuja nada.
 */
export default function Flag({ code, className = "" }: { code: string; className?: string }) {
  const flag = FLAGS[code];
  if (!flag) return null;
  return (
    <svg
      viewBox="0 0 27 18"
      className={`h-3 w-[18px] shrink-0 rounded-[2px] ring-1 ring-ink/10 ${className}`}
      aria-hidden="true"
    >
      {flag}
    </svg>
  );
}

const FLAGS: Record<string, React.ReactNode> = {
  AR: (
    <>
      <rect width="27" height="18" fill="#74acdf" />
      <rect y="6" width="27" height="6" fill="#fff" />
      <circle cx="13.5" cy="9" r="2" fill="#f6b40e" />
    </>
  ),
  UY: (
    <>
      <rect width="27" height="18" fill="#fff" />
      {[2, 6, 10, 14].map((y) => (
        <rect key={y} y={y} width="27" height="2" fill="#0038a8" />
      ))}
      <rect width="10" height="10" fill="#fff" />
      <circle cx="5" cy="5" r="2.6" fill="#fcd116" />
    </>
  ),
};
