import { CLEARING_SUITS, type ClearingSuit, type RootMap } from '../data/maps'

const R = 30

export function MapDrawing({ map, suits }: { map: RootMap; suits: ClearingSuit[] }) {
  const c = map.clearings
  const line = (pts: [number, number][]) => pts.map((p) => p.join(',')).join(' ')
  return (
    <svg viewBox="72 20 656 560" role="img" aria-label={`${map.name} map with clearing suits`}>
      <rect x="72" y="20" width="656" height="560" fill={map.ground} />
      {map.lake && <polygon points={line(map.lake)} fill="#5f9fb8" />}
      {map.rivers?.map((r, i) => (
        <polyline key={i} points={line(r)} fill="none" stroke="#5f9fb8" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
      ))}
      {map.paths.map(([a, b]) => (
        <line key={`${a}-${b}`} x1={c[a][0]} y1={c[a][1]} x2={c[b][0]} y2={c[b][1]} stroke={map.path} strokeWidth="5" strokeDasharray="10 8" strokeLinecap="round" />
      ))}
      {map.closed?.map(([a, b]) => (
        <line key={`x${a}-${b}`} x1={c[a][0]} y1={c[a][1]} x2={c[b][0]} y2={c[b][1]} stroke="#b4532a" strokeWidth="11" strokeLinecap="round" opacity=".8" />
      ))}
      {c.map(([x, y], i) => {
        const s = CLEARING_SUITS[suits[i]]
        return (
          <g key={i}>
            <circle cx={x} cy={y} r={R} fill={s.color} stroke="#3a2816" strokeWidth="4" />
            <text x={x} y={y + 2} textAnchor="middle" dominantBaseline="middle" fontSize="30">
              {s.emoji}
            </text>
            {map.tower === i && (
              <text x={x + R - 2} y={y - R + 4} textAnchor="middle" fontSize="24">
                🏰
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
