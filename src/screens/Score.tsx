import { useEffect, useRef, useState, type Dispatch } from 'react'
import { FactionIcon } from '../components/FactionIcon'
import { FACTION_BY_ID, SUITS, WIN_VP, type FactionId } from '../data/factions'
import { displayName, type Action, type Game, type Player } from '../game'

const HOLD_MS = 450

/** Ruler position for a score, as a CSS bottom offset. */
function y(v: number) {
  return `calc(18px + ${v / WIN_VP} * (100% - 36px))`
}

function formatDuration(ms: number) {
  const mins = Math.max(0, Math.floor(ms / 60000))
  return `${Math.floor(mins / 60)}:${String(mins % 60).padStart(2, '0')}`
}

function GameClock({ since }: { since: number }) {
  const [now, setNow] = useState(Date.now)
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 10000)
    return () => window.clearInterval(id)
  }, [])
  return <small title="Game time">⏱ {formatDuration(now - since)}</small>
}

function useWakeLock() {
  useEffect(() => {
    let lock: WakeLockSentinel | null = null
    const request = () => {
      if (document.visibilityState === 'visible' && 'wakeLock' in navigator) {
        navigator.wakeLock.request('screen').then((l) => (lock = l), () => {})
      }
    }
    request()
    document.addEventListener('visibilitychange', request)
    return () => {
      document.removeEventListener('visibilitychange', request)
      lock?.release()
    }
  }, [])
}

export function Score({ game, dispatch }: { game: Game; dispatch: Dispatch<Action> }) {
  useWakeLock()
  const [pad, setPad] = useState<FactionId | null>(null)
  const [showLog, setShowLog] = useState(false)
  const [showStandings, setShowStandings] = useState(false)
  const [confirmEnd, setConfirmEnd] = useState(false)
  const players = game.players
  const winner = players.find((p) => p.vp >= WIN_VP)
  const cols = players.length <= 2 ? 1 : 2
  const rows = Math.ceil(players.length / cols)
  const current = FACTION_BY_ID[players[game.turn]?.faction ?? players[0].faction]
  const next = players[(game.turn + 1) % players.length]
  const nextName = displayName(next, FACTION_BY_ID[next.faction].short)

  return (
    <div className="screen score">
      <header className="bar">
        <span className="round">
          Round {game.round} <GameClock since={game.startedAt} />
        </span>
        <button className="chip" disabled={!game.undo.length} onClick={() => dispatch({ type: 'undo' })}>
          ↶ Undo
        </button>
      </header>

      <LeadLine players={players} />

      <div className="sidewrap">
        <Ruler players={players} onOpen={() => setShowStandings(true)} />
        <div className={`grid g${players.length}`} style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {players.map((p, i) => (
            <Tile
              key={p.faction}
              player={p}
              current={i === game.turn}
              partner={players.find((x) => x.coalitionWith === p.faction || p.coalitionWith === x.faction)}
              rotated={game.rotate && Math.floor(i / cols) < Math.floor(rows / 2)}
              onAdd={() => dispatch({ type: 'score', faction: p.faction, delta: 1 })}
              onRemove={() => dispatch({ type: 'score', faction: p.faction, delta: -1 })}
              onHold={() => setPad(p.faction)}
            />
          ))}
        </div>
      </div>

      <button
        className="endturn"
        style={{ background: current.color, color: current.fg }}
        onClick={() => dispatch({ type: 'endTurn' })}
      >
        <FactionIcon id={current.id} />
        End {displayName(players[game.turn], current.short)} turn
        <small>{game.turn === players.length - 1 ? `→ round ${game.round + 1}` : `→ ${nextName}`}</small>
      </button>

      <footer className="foot">
        <button onClick={() => setShowLog(true)}>☰ Log</button>
        <button onClick={() => dispatch({ type: 'toggleRotate' })} aria-pressed={game.rotate}>
          ⟳ Rotate{game.rotate ? ' on' : ''}
        </button>
        <button onClick={() => setConfirmEnd(true)}>⚑ End game</button>
      </footer>

      {pad && <Pad game={game} faction={pad} dispatch={dispatch} onClose={() => setPad(null)} />}

      {showStandings && <Standings game={game} onClose={() => setShowStandings(false)} />}

      {showLog && (
        <Sheet title="Score log" onClose={() => setShowLog(false)}>
          {game.log.length === 0 && <p className="why">No points scored yet.</p>}
          <ol className="log">
            {[...game.log].reverse().map((e, i) => {
              const f = FACTION_BY_ID[e.faction]
              return (
                <li key={i}>
                  <span className="dot sm" style={{ background: f.color, color: f.fg }}>
                    <FactionIcon id={f.id} />
                  </span>
                  <b>{f.short}</b> {e.text}
                  <small>round {e.round}</small>
                </li>
              )
            })}
          </ol>
        </Sheet>
      )}

      {confirmEnd && (
        <Sheet title="End this game?" onClose={() => setConfirmEnd(false)}>
          <p className="why">Scores are cleared. Your factions stay picked for the next game.</p>
          <div className="actions inline">
            <button className="btn ghost" onClick={() => setConfirmEnd(false)}>
              Keep playing
            </button>
            <button className="btn" onClick={() => dispatch({ type: 'end' })}>
              End game
            </button>
          </div>
        </Sheet>
      )}

      {winner && !game.winnerSeen && <Winner winner={winner} players={players} round={game.round} startedAt={game.startedAt} dispatch={dispatch} />}
    </div>
  )
}

function LeadLine({ players }: { players: Player[] }) {
  const top = Math.max(...players.map((p) => p.vp))
  const leaders = players.filter((p) => p.vp === top)
  const f = FACTION_BY_ID[leaders[0].faction]
  if (top === 0) {
    return (
      <div className="leadline">
        <b>Everyone at 0</b>
        <span>{WIN_VP} to win</span>
      </div>
    )
  }
  return (
    <div className="leadline">
      {leaders.length > 1 ? (
        <b>Tied for the lead</b>
      ) : (
        <b>
          <span className="dot sm" style={{ background: f.color, color: f.fg }}>
            <FactionIcon id={f.id} />
          </span>
          ★ {displayName(leaders[0], f.short)}
        </b>
      )}
      <span>{top >= WIN_VP ? 'Victory!' : `${leaders.length > 1 ? '' : 'leads · '}${WIN_VP - top} to win`}</span>
    </div>
  )
}

/** Highest first; a token steps sideways when another token in that column is within 3 points. */
function placeTokens(players: Player[], columns: number) {
  const placed: { col: number; vp: number }[] = []
  return [...players]
    .sort((a, b) => b.vp - a.vp)
    .map((p) => {
      let col = Array.from({ length: columns }, (_, c) => c).findIndex(
        (c) => !placed.some((q) => q.col === c && Math.abs(q.vp - p.vp) < 3),
      )
      if (col === -1) col = 0
      placed.push({ col, vp: p.vp })
      return { p, col }
    })
}

function Standings({ game, onClose }: { game: Game; onClose: () => void }) {
  const columns = ['44px', '54%']
  const marks = []
  for (let v = 0; v < WIN_VP; v++) {
    marks.push(<span key={'m' + v} className={'mk' + (v % 5 === 0 ? ' five' : '')} style={{ bottom: y(v) }} />)
    if (v % 5 === 0)
      marks.push(
        <span key={'l' + v} className="lb" style={{ bottom: y(v) }}>
          {v}
        </span>,
      )
  }
  return (
    <div className="standings" role="dialog" aria-label="Standings" onClick={onClose}>
      <header className="bar">
        <span>Standings</span>
        <small>
          Round {game.round} <GameClock since={game.startedAt} />
        </small>
        <button className="x" aria-label="Close standings" onClick={onClose}>
          ✕
        </button>
      </header>
      <LeadLine players={game.players} />
      <div className="bigr">
        {marks}
        <span className="flag" style={{ bottom: y(WIN_VP) }}>
          ⚑ {WIN_VP} wins
        </span>
        {placeTokens(game.players, columns.length).map(({ p, col }) => {
          const f = FACTION_BY_ID[p.faction]
          const suit = SUITS.find((x) => x.id === p.dominance)
          return (
            <span
              key={p.faction}
              className="pin"
              style={{ bottom: y(Math.min(p.vp, WIN_VP - 1)), left: columns[col], zIndex: p.vp >= WIN_VP ? 30 : 10 + col }}
            >
              <span className="tok" style={{ background: f.color, color: f.fg }}>
                <FactionIcon id={f.id} />
              </span>
              <span className="lab">
                <b>{suit ? suit.emoji : p.vp}</b>
                <small>{displayName(p, f.short)}</small>
              </span>
            </span>
          )
        })}
      </div>
      <p className="hint">Tap anywhere to go back</p>
    </div>
  )
}

function Ruler({ players, onOpen }: { players: Player[]; onOpen: () => void }) {
  const columns = [40, 72, 104]
  const tokens = placeTokens(players, columns.length)

  const marks = []
  for (let v = 0; v < WIN_VP; v++) {
    marks.push(<span key={'m' + v} className={'mk' + (v % 5 === 0 ? ' five' : '')} style={{ bottom: y(v) }} />)
    if (v % 5 === 0)
      marks.push(
        <span key={'l' + v} className="lb" style={{ bottom: y(v) }}>
          {v}
        </span>,
      )
  }

  return (
    <button className="ruler" aria-label="Score ruler, tap to see standings full screen" onClick={onOpen}>
      {marks}
      <span className="flag" style={{ bottom: y(WIN_VP) }}>
        ⚑ {WIN_VP}
      </span>
      {tokens.map(({ p, col }) => {
        const f = FACTION_BY_ID[p.faction]
        return (
          <span
            key={p.faction}
            className="tk2"
            title={`${f.name}: ${p.vp}`}
            style={{ bottom: y(Math.min(p.vp, WIN_VP - 0.6)), left: columns[col] - 14, background: f.color, color: f.fg, zIndex: p.vp >= WIN_VP ? 30 : 10 + col }}
          >
            <FactionIcon id={f.id} />
            <em>{p.vp}</em>
          </span>
        )
      })}
    </button>
  )
}

function Tile(props: {
  player: Player
  partner?: Player
  current: boolean
  rotated: boolean
  onAdd: () => void
  onRemove: () => void
  onHold: () => void
}) {
  const { player: p, partner, rotated } = props
  const f = FACTION_BY_ID[p.faction]
  const timer = useRef<number | undefined>(undefined)
  const held = useRef(false)
  const suit = SUITS.find((s) => s.id === p.dominance)

  const start = () => {
    held.current = false
    timer.current = window.setTimeout(() => {
      held.current = true
      props.onHold()
    }, HOLD_MS)
  }
  const cancel = () => window.clearTimeout(timer.current)

  return (
    <div className={'tile' + (rotated ? ' rot' : '') + (props.current ? ' current' : '')} style={{ background: f.color, color: f.fg }}>
      <span className="fill" style={{ height: `${(p.vp / WIN_VP) * 100}%` }} />
      <button
        className="hit"
        aria-label={`${f.name} ${p.vp} points. Tap to add one, hold for more`}
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onContextMenu={(e) => e.preventDefault()}
        onClick={() => {
          if (!held.current) props.onAdd()
          held.current = false
        }}
      >
        <span className="in">
          <FactionIcon id={f.id} className="ic" />
          {props.current && <span className="turn">▶ Turn</span>}
          <span className="fn">{displayName(p, f.short)}</span>
          {suit ? (
            <span className="vp dom" title={`${suit.name} dominance`}>
              {suit.emoji}
            </span>
          ) : (
            <span className="vp">{p.vp}</span>
          )}
          {partner && <span className="coal">🤝 {FACTION_BY_ID[partner.faction].short}</span>}
        </span>
      </button>
      {f.losesVp && (
        <button className="minus" aria-label={`Remove one point from ${f.name}`} onClick={props.onRemove}>
          −
        </button>
      )}
    </div>
  )
}

function Pad({ game, faction, dispatch, onClose }: { game: Game; faction: FactionId; dispatch: Dispatch<Action>; onClose: () => void }) {
  const p = game.players.find((x) => x.faction === faction)!
  const f = FACTION_BY_ID[faction]
  const isVagabond = faction === 'vagabond' || faction === 'vagabond2'
  const add = (delta: number) => {
    dispatch({ type: 'score', faction, delta })
    onClose()
  }
  return (
    <Sheet title={`${f.name} · ${p.vp}`} onClose={onClose}>
      <div className="pad">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} onClick={() => add(n)}>
            +{n}
          </button>
        ))}
        {[-1, -2, -3].map((n) => (
          <button key={n} className="neg" onClick={() => add(n)}>
            −{-n}
          </button>
        ))}
        {[6, 7].map((n) => (
          <button key={n} onClick={() => add(n)}>
            +{n}
          </button>
        ))}
      </div>
      <div className="sub flat">Dominance card</div>
      <div className="pad four">
        {SUITS.filter((s) => s.id !== 'frog' || game.players.some((x) => x.faction === 'lilypad')).map((s) => (
          <button
            key={s.id}
            className={p.dominance === s.id ? 'on' : ''}
            onClick={() => {
              dispatch({ type: 'dominance', faction, suit: p.dominance === s.id ? null : s.id })
              onClose()
            }}
          >
            {s.emoji} {s.name}
          </button>
        ))}
      </div>
      {isVagabond && (
        <>
          <div className="sub flat">Coalition with</div>
          <div className="pad four">
            {game.players
              .filter((x) => x.faction !== faction)
              .map((x) => {
                const xf = FACTION_BY_ID[x.faction]
                return (
                  <button
                    key={x.faction}
                    className={p.coalitionWith === x.faction ? 'on' : ''}
                    onClick={() => {
                      dispatch({ type: 'coalition', faction, with: p.coalitionWith === x.faction ? null : x.faction })
                      onClose()
                    }}
                  >
                    {xf.short}
                  </button>
                )
              })}
          </div>
        </>
      )}
    </Sheet>
  )
}

function Sheet({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="scrim" onClick={onClose}>
      <div className="sheet" role="dialog" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <div className="sheet-hd">
          <h4>{title}</h4>
          <button className="x" aria-label="Close" onClick={onClose}>
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Winner({ winner, players, round, startedAt, dispatch }: { winner: Player; players: Player[]; round: number; startedAt: number; dispatch: Dispatch<Action> }) {
  const f = FACTION_BY_ID[winner.faction]
  const partner = players.find((x) => x.coalitionWith === winner.faction)
  const [endedAt] = useState(Date.now)
  return (
    <div className="scrim center">
      <div className="win" style={{ borderColor: f.color }}>
        <span className="dot big" style={{ background: f.color, color: f.fg }}>
          <FactionIcon id={f.id} />
        </span>
        <b>
          {displayName(winner, f.name)}
          {partner ? ` and ${displayName(partner, FACTION_BY_ID[partner.faction].name)} win!` : ' wins!'}
        </b>
        <small>
          Reached {WIN_VP} victory points in round {round} · {formatDuration(endedAt - startedAt)}
        </small>
        <div className="actions inline">
          <button className="btn ghost" onClick={() => dispatch({ type: 'undo' })}>
            Oops, undo
          </button>
          <button className="btn" onClick={() => dispatch({ type: 'dismissWinner' })}>
            See the table
          </button>
        </div>
      </div>
    </div>
  )
}
