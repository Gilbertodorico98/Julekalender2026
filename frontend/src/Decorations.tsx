// Norsk julepynt som inline SVG: Selbu-stjerne, nordlys og vinterlandskab. Ingen eksterne filer.

/** Åttebladrosen (Selbu-stjernen) tegnet som strikkede masker. X = maske. */
const SELBU_GRID = [
  '....X...X....',
  '....XX.XX....',
  '....XXXXX....',
  '.X...XXX...X.',
  'XXX...X...XXX',
  '.XXXX...XXXX.',
  '..X.X.X.X.X..',
  '.XXXX...XXXX.',
  'XXX...X...XXX',
  '.X...XXX...X.',
  '....XXXXX....',
  '....XX.XX....',
  '....X...X....',
]

const SELBU_PATH = SELBU_GRID.flatMap((row, y) =>
  [...row].map((cell, x) => (cell === 'X' ? `M${x} ${y}h1v1h-1z` : '')),
).join('')

export function SelbuStar({ className, color = 'currentColor' }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 13 13" aria-hidden="true" focusable="false" shapeRendering="crispEdges">
      <path d={SELBU_PATH} fill={color} />
    </svg>
  )
}

/** Grønt nordlys øverst på himlen. Bølger langsomt (slås fra ved reduceret bevægelse). */
export function Aurora() {
  return (
    <div className="aurora" aria-hidden="true">
      <div className="aurora__band aurora__band--1" />
      <div className="aurora__band aurora__band--2" />
    </div>
  )
}

function Spruce({ x, y, s }: { x: number; y: number; s: number }) {
  // Tre lag gran med sne på spidserne
  const layer = (top: number, w: number, h: number) =>
    `${x},${y - top} ${x - w},${y - top + h} ${x + w},${y - top + h}`
  return (
    <g>
      <rect x={x - 2 * s} y={y} width={4 * s} height={8 * s} fill="#3b2416" />
      <polygon points={layer(60 * s, 16 * s, 26 * s)} fill="#0e3b2c" />
      <polygon points={layer(44 * s, 22 * s, 30 * s)} fill="#0e3b2c" />
      <polygon points={layer(26 * s, 28 * s, 32 * s)} fill="#0b3226" />
      <polygon points={layer(60 * s, 7 * s, 11 * s)} fill="#f4f8fc" />
      <polygon points={`${x - 22 * s},${y - 14 * s} ${x - 10 * s},${y - 18 * s} ${x - 4 * s},${y - 14 * s}`} fill="#e9f0f7" />
      <polygon points={`${x + 4 * s},${y - 32 * s} ${x + 12 * s},${y - 36 * s} ${x + 19 * s},${y - 31 * s}`} fill="#e9f0f7" />
    </g>
  )
}

function Cabin({ x, y, s }: { x: number; y: number; s: number }) {
  const w = 70 * s
  const h = 42 * s
  return (
    <g>
      {/* rødt træhus */}
      <rect x={x} y={y - h} width={w} height={h} fill="#9e1b16" />
      <rect x={x} y={y - h} width={w} height={h} fill="url(#planks)" opacity="0.35" />
      {/* tag med sne */}
      <polygon points={`${x - 8 * s},${y - h} ${x + w / 2},${y - h - 30 * s} ${x + w + 8 * s},${y - h}`} fill="#2b1a12" />
      <polygon
        points={`${x - 10 * s},${y - h + 2 * s} ${x + w / 2},${y - h - 32 * s} ${x + w + 10 * s},${y - h + 2 * s} ${x + w + 4 * s},${y - h + 6 * s} ${x + w / 2},${y - h - 22 * s} ${x - 4 * s},${y - h + 6 * s}`}
        fill="#f4f8fc"
      />
      {/* vinduer med varmt lys og hvide karme */}
      {[0.18, 0.62].map((p) => (
        <g key={p}>
          <rect x={x + w * p} y={y - h * 0.7} width={16 * s} height={14 * s} fill="#ffd46b" className="cabin__window" />
          <rect x={x + w * p + 7.5 * s} y={y - h * 0.7} width={s} height={14 * s} fill="#fff" />
          <rect x={x + w * p} y={y - h * 0.7 + 6.5 * s} width={16 * s} height={s} fill="#fff" />
        </g>
      ))}
      <rect x={x + w * 0.42} y={y - 20 * s} width={11 * s} height={20 * s} fill="#4a1410" />
      {/* hvide hjørnebrædder */}
      <rect x={x} y={y - h} width={3 * s} height={h} fill="#f1ece2" />
      <rect x={x + w - 3 * s} y={y - h} width={3 * s} height={h} fill="#f1ece2" />
    </g>
  )
}

/** Snedækket landskab med graner og røde træhuse, fast nederst på skærmen. */
export function WinterScene() {
  return (
    <div className="winter-scene" aria-hidden="true">
      <svg viewBox="0 0 1200 220" preserveAspectRatio="xMidYMax slice" focusable="false">
        <defs>
          <pattern id="planks" width="6" height="6" patternUnits="userSpaceOnUse">
            <rect width="1" height="6" fill="#000" />
          </pattern>
          <radialGradient id="window-glow">
            <stop offset="0" stopColor="#ffd46b" stopOpacity="0.55" />
            <stop offset="1" stopColor="#ffd46b" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* fjelde langt væk */}
        <path d="M0 150 L120 90 L210 130 L330 70 L450 135 L560 95 L690 140 L820 80 L940 130 L1060 85 L1200 140 V220 H0 Z" fill="#1b2b45" />
        <path d="M120 90 L150 105 L135 104 L120 112 L100 101 Z M330 70 L360 88 L340 86 L325 95 L305 83 Z M820 80 L850 97 L830 95 L815 104 L795 92 Z M1060 85 L1088 101 L1070 99 L1055 108 L1037 96 Z" fill="#c9d6e6" opacity="0.8" />
        {/* bakke i midten */}
        <path d="M0 175 Q200 135 420 165 T820 160 T1200 158 V220 H0 Z" fill="#b7c7da" />
        {/* lysskær fra vinduerne */}
        <circle cx="300" cy="170" r="60" fill="url(#window-glow)" />
        <circle cx="905" cy="176" r="55" fill="url(#window-glow)" />
        <Spruce x={70} y={190} s={1.1} />
        <Spruce x={150} y={182} s={0.8} />
        <Cabin x={255} y={192} s={1.1} />
        <Spruce x={430} y={190} s={1.25} />
        <Spruce x={505} y={186} s={0.9} />
        <Spruce x={700} y={188} s={1} />
        <Cabin x={860} y={196} s={0.95} />
        <Spruce x={1010} y={192} s={1.2} />
        <Spruce x={1100} y={184} s={0.85} />
        <Spruce x={1170} y={192} s={1} />
        {/* sne i forgrunden */}
        <path d="M0 200 Q300 182 600 198 T1200 194 V220 H0 Z" fill="#eef3f9" />
      </svg>
    </div>
  )
}
