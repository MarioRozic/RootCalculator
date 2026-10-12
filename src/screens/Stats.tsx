import type { Dispatch } from 'react'
import { FactionIcon } from '../components/FactionIcon'
import { FACTION_BY_ID, WIN_VP } from '../data/factions'
import { displayName, type Action, type Game, type LogEntry, type TurnRecord } from '../game'

/** "42s", "4m 05s" or "1h 05m". */
function formatSpan(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000))
  if (s < 60) return `${s}s`
  if (s < 3600) return `${Math.floor(s / 60)}m ${String(s % 60).padStart(2, '0')}s`
  return `${Math.floor(s / 3600)}h ${String(Math.floor(s / 60) % 60).padStart(2, '0')}m`
}

/** VP change of a score log entry ("+3", "−1"), 0 for anything else. */
function vpChange(e: LogEntry) {
  return /^[+−]\d+$/.test(e.text) ? Number(e.text.replace('−', '-')) : 0
}

export function Stats({ game, dispatch }: { game: Game; dispatch: Dispatch<Action> }) {
  const players = game.players
  const name = (id: string) => {
    const p = players.find((x) => x.faction === id)!
    return displayName(p, FACTION_BY_ID[p.faction].short)
  }

  // The turn that was running when the game ended counts too.
  const current = players[game.turn]
  const turns: TurnRecord[] = [...game.turns, { faction: current.faction, round: game.round, ms: game.endedAt - game.turnStartedAt }]
  const total = game.endedAt - game.startedAt
  const turnTime = turns.reduce((n, t) => n + t.ms, 0)

  const timing = players
    .map((p) => {
      const mine = turns.filter((t) => t.faction === p.faction)
      const ms = mine.reduce((n, t) => n + t.ms, 0)
      return { p, ms, count: mine.length, longest: Math.max(0, ...mine.map((t) => t.ms)) }
    })
    .sort((a, b) => b.ms - a.ms)
  const slowest = Math.max(1, ...timing.map((t) => t.ms))
  const longest = turns.reduce((a, b) => (b.ms > a.ms ? b : a))

  // Most VP one player gained within a single turn, whoever's turn it was.
  const gains = new Map<string, { faction: LogEntry['faction']; round: number; vp: number }>()
  for (const e of game.log) {
    if (e.turn === undefined) continue
    const key = `${e.turn}:${e.faction}`
    const g = gains.get(key) ?? { faction: e.faction, round: e.round, vp: 0 }
    gains.set(key, { ...g, vp: g.vp + vpChange(e) })
  }
  const best = [...gains.values()].reduce<{ faction: LogEntry['faction']; round: number; vp: number } | null>(
    (a, b) => (b.vp > (a?.vp ?? 0) ? b : a),
    null,
  )

  const standings = [...players].sort((a, b) => b.vp - a.vp)
  const winner = standings[0].vp >= WIN_VP ? standings[0] : null

  return (
    <div className="screen">
      <header className="bar">
        <button className="chip" onClick={() => dispatch({ type: 'resume' })}>
          ‹ Back to game
        </button>
        <small>Game stats</small>
      </header>

      <div className="scroll">
        <div className="pills">
          <div>
            <small>Game time</small>
            <b>{formatSpan(total)}</b>
          </div>
          <div>
            <small>Rounds</small>
            <b>{game.round}</b>
          </div>
          <div>
            <small>Avg turn</small>
            <b>{formatSpan(turnTime / turns.length)}</b>
          </div>
        </div>

        <div className="sub">{winner ? `${name(winner.faction)} won` : 'Final score'}</div>
        <div className="steps">
          {standings.map((p) => {
            const f = FACTION_BY_ID[p.faction]
            return (
              <div className="step" key={p.faction}>
                <span className="dot" style={{ background: f.color, color: f.fg }}>
                  <FactionIcon id={f.id} />
                </span>
                <span className="n">
                  {name(p.faction)}
                  {p.name.trim() && <small>{f.name}</small>}
                </span>
                <span className="num wide">{p.vp}</span>
              </div>
            )
          })}
        </div>

        <div className="sub">Time per player</div>
        <div className="steps">
          {timing.map(({ p, ms, count, longest }) => {
            const f = FACTION_BY_ID[p.faction]
            return (
              <div className="step" key={p.faction}>
                <span className="dot" style={{ background: f.color, color: f.fg }}>
                  <FactionIcon id={f.id} />
                </span>
                <span className="n">
                  {name(p.faction)}
                  <span className="tbar">
                    <i style={{ width: `${(ms / slowest) * 100}%`, background: f.color }} />
                  </span>
                  <small>
                    {count} {count === 1 ? 'turn' : 'turns'} · avg {formatSpan(count ? ms / count : 0)} · longest {formatSpan(longest)}
                  </small>
                </span>
                <span className="num wide">
                  {formatSpan(ms)}
                  <small>{Math.round((ms / Math.max(1, turnTime)) * 100)}%</small>
                </span>
              </div>
            )
          })}
        </div>

        <div className="sub">Victory points by round</div>
        <VpChart game={game} />
        <div className="legend">
          {players.map((p) => (
            <span key={p.faction}>
              <i style={{ background: FACTION_BY_ID[p.faction].color }} />
              {name(p.faction)}
            </span>
          ))}
        </div>

        <div className="sub">Highlights</div>
        <div className="steps">
          <div className="step">
            <span className="tag">🐢</span>
            <span className="n">
              Longest turn: {formatSpan(longest.ms)}
              <small>
                {name(longest.faction)} in round {longest.round}
              </small>
            </span>
          </div>
          {best && (
            <div className="step">
              <span className="tag">🚀</span>
              <span className="n">
                Biggest turn: +{best.vp} VP
                <small>
                  {name(best.faction)} in round {best.round}
                </small>
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={() => dispatch({ type: 'end' })}>
          New game
        </button>
      </div>
    </div>
  )
}

const W = 320
const H = 170
const PAD = { l: 24, r: 10, t: 10, b: 22 }

function VpChart({ game }: { game: Game }) {
  const rounds = game.round
  // Score at the end of each round, starting from 0 before round 1.
  const lines = game.players.map((p) => {
    const at = [0]
    for (let r = 1; r <= rounds; r++) {
      at.push(at[r - 1] + game.log.filter((e) => e.faction === p.faction && e.round === r).reduce((n, e) => n + vpChange(e), 0))
    }
    return { p, at }
  })
  const top = Math.max(10, Math.ceil(Math.max(...lines.flatMap((l) => l.at)) / 5) * 5)
  const x = (r: number) => PAD.l + (r / Math.max(1, rounds)) * (W - PAD.l - PAD.r)
  const y = (v: number) => H - PAD.b - (v / top) * (H - PAD.t - PAD.b)
  const ticks = []
  for (let v = 0; v <= top; v += 5) ticks.push(v)
  const step = Math.ceil(rounds / 8)

  return (
    <svg className="vpchart" viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Victory points at the end of each round">
      {ticks.map((v) => (
        <g key={v}>
          <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="grid" />
          <text x={PAD.l - 5} y={y(v) + 3} textAnchor="end">
            {v}
          </text>
        </g>
      ))}
      {Array.from({ length: rounds + 1 }, (_, r) => r)
        .filter((r) => r > 0 && (r % step === 0 || r === rounds))
        .map((r) => (
          <text key={r} x={x(r)} y={H - 6} textAnchor="middle">
            {r}
          </text>
        ))}
      {lines.map(({ p, at }) => {
        const f = FACTION_BY_ID[p.faction]
        return (
          <g key={p.faction}>
            <polyline points={at.map((v, r) => `${x(r)},${y(v)}`).join(' ')} fill="none" stroke={f.color} strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx={x(rounds)} cy={y(at[rounds])} r="3.5" fill={f.color} />
          </g>
        )
      })}
    </svg>
  )
}
