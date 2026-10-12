import type { Dispatch } from 'react'
import { FactionIcon } from '../components/FactionIcon'
import { FACTION_BY_ID, setupLetter } from '../data/factions'
import type { Action, Game } from '../game'

export function Setup({ game, dispatch }: { game: Game; dispatch: Dispatch<Action> }) {
  const bySetup = [...game.players].sort((a, b) => FACTION_BY_ID[a.faction].setup - FACTION_BY_ID[b.faction].setup)

  return (
    <div className="screen">
      <header className="bar">
        <button className="chip" onClick={() => dispatch({ type: 'back' })}>
          ‹ Factions
        </button>
        <small>{game.players.length} players</small>
      </header>

      <div className="scroll">
        <div className="sub">
          Turn order · clockwise
          <button className="chip dark" onClick={() => dispatch({ type: 'rollFirst' })}>
            🎲 Random first player
          </button>
        </div>
        <div className="steps">
          {game.players.map((p, i) => {
            const f = FACTION_BY_ID[p.faction]
            return (
              <div className="step" key={p.faction}>
                <span className="num">{i + 1}</span>
                <span className="dot" style={{ background: f.color, color: f.fg }}>
                  <FactionIcon id={f.id} />
                </span>
                <span className="n">
                  <input
                    value={p.name}
                    placeholder="Player name (optional)"
                    aria-label={`Player name for ${f.name}`}
                    onChange={(e) => dispatch({ type: 'setName', index: i, name: e.target.value })}
                  />
                  <small>
                    {f.name}
                    {i === 0 && ' · goes first'}
                  </small>
                </span>
              </div>
            )
          })}
        </div>

        <div className="sub">Setup order</div>
        <div className="steps">
          {bySetup.map((p, i) => {
            const f = FACTION_BY_ID[p.faction]
            return (
              <div className="step" key={p.faction}>
                <span className="tag">{setupLetter(i)}</span>
                <span className="n">
                  {f.name}
                  <small>{f.setupNote}</small>
                </span>
              </div>
            )
          })}
        </div>
      </div>

      <div className="actions">
        <button className="btn" onClick={() => dispatch({ type: 'start' })}>
          Start game
        </button>
      </div>
    </div>
  )
}
