import { useState, type Dispatch } from 'react'
import { FactionIcon } from '../components/FactionIcon'
import { BOXES, FACTIONS, FACTION_BY_ID, MIN_REACH, randomFairSet } from '../data/factions'
import type { Action, Game } from '../game'

export function PickFactions({ game, dispatch }: { game: Game; dispatch: Dispatch<Action> }) {
  const [showBoxes, setShowBoxes] = useState(false)
  const [error, setError] = useState('')
  const pool = FACTIONS.filter((f) => game.boxes[f.box])
  const chosen = game.selected.map((id) => FACTION_BY_ID[id])
  const reach = chosen.reduce((s, f) => s + f.reach, 0)
  const need = MIN_REACH[game.playerCount]
  const full = chosen.length === game.playerCount
  const balanced = reach >= need
  const hasMilitant = chosen.some((f) => f.militant)

  function randomize() {
    const ids = randomFairSet(game.playerCount, pool)
    if (ids) {
      setError('')
      dispatch({ type: 'setSelected', ids })
    } else {
      setError('No fair set is possible with these expansions. Turn more on.')
    }
  }

  return (
    <div className="screen">
      <header className="bar">
        <span>New game</span>
        <button className="chip" onClick={() => setShowBoxes((v) => !v)} aria-expanded={showBoxes}>
          Expansions {showBoxes ? '▴' : '▾'}
        </button>
      </header>

      {showBoxes && (
        <div className="boxes">
          {BOXES.map((b) => (
            <label key={b.id} className={'toggle' + (game.boxes[b.id] ? ' on' : '')}>
              <input type="checkbox" checked={game.boxes[b.id]} onChange={() => dispatch({ type: 'toggleBox', box: b.id })} />
              {b.name}
            </label>
          ))}
        </div>
      )}

      <div className="seg" role="radiogroup" aria-label="Number of players">
        {[2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            role="radio"
            aria-checked={game.playerCount === n}
            className={game.playerCount === n ? 'on' : ''}
            onClick={() => dispatch({ type: 'setCount', count: n })}
          >
            {n}
          </button>
        ))}
      </div>

      <div className="reach">
        <div className="meter">
          {chosen.map((f) => (
            <i key={f.id} style={{ width: `${(f.reach / Math.max(need, reach)) * 100}%`, background: f.color }} />
          ))}
          <span className="need" style={{ left: `${(need / Math.max(need, reach)) * 100}%` }} />
        </div>
        <div className="lbl">
          <span>
            Reach {reach} of {need} needed · {chosen.length}/{game.playerCount} picked
          </span>
          {full && balanced && hasMilitant && <span className="ok">Balanced ✓</span>}
          {full && !balanced && <span className="warn">Too low</span>}
          {full && balanced && !hasMilitant && <span className="warn">No militant</span>}
        </div>
      </div>

      <div className="flist">
        {pool.map((f) => {
          const sel = game.selected.includes(f.id)
          const blocked = !sel && (full || (f.id === 'vagabond2' && !game.selected.includes('vagabond')))
          return (
            <button
              key={f.id}
              className={'frow' + (sel ? ' sel' : '') + (blocked ? ' dim' : '')}
              aria-pressed={sel}
              onClick={() => dispatch({ type: 'toggleFaction', id: f.id })}
              disabled={blocked}
            >
              <span className="dot" style={{ background: f.color, color: f.fg }}>
                <FactionIcon id={f.id} />
              </span>
              <span className="n">
                {f.name}
                <small>
                  {f.militant ? 'Militant' : 'Insurgent'} · {BOXES.find((b) => b.id === f.box)!.name}
                  {f.id === 'vagabond2' && ' · needs Vagabond'}
                </small>
              </span>
              <span className="r">{f.reach}</span>
            </button>
          )
        })}
      </div>

      {error && <p className="error">{error}</p>}
      <div className="actions">
        <button className="btn ghost" onClick={randomize}>
          Randomize a fair set
        </button>
        <button className="btn" disabled={!full} onClick={() => dispatch({ type: 'toSetup' })}>
          Next: setup
        </button>
      </div>
    </div>
  )
}
