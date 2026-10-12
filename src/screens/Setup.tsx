import type { Dispatch } from 'react'
import { FactionIcon } from '../components/FactionIcon'
import { FACTION_BY_ID, setupLetter } from '../data/factions'
import { CLEARING_SUITS, DECKS, MAPS, MAP_BY_ID, pickRandom } from '../data/maps'
import type { Action, Game } from '../game'

export function Setup({ game, dispatch }: { game: Game; dispatch: Dispatch<Action> }) {
  const maps = MAPS.filter((m) => game.boxes[m.box])
  const map = MAP_BY_ID[game.map]
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
          Map
          <button className="chip dark" onClick={() => dispatch({ type: 'setMap', map: pickRandom(maps).id })}>
            🎲 Random map
          </button>
        </div>
        <div className="picks">
          {maps.map((m) => (
            <button key={m.id} className={game.map === m.id ? 'on' : ''} aria-pressed={game.map === m.id} onClick={() => dispatch({ type: 'setMap', map: m.id })}>
              {m.name}
            </button>
          ))}
        </div>
        <p className="note">{map.note}</p>

        <div className="sub">
          Clearing suits
          <span className="subactions">
            {map.printedSuits && game.clearings && (
              <button className="chip dark" onClick={() => dispatch({ type: 'usePrintedSuits' })}>
                Printed
              </button>
            )}
            <button className="chip dark" onClick={() => dispatch({ type: 'dealClearings' })}>
              🎲 {game.clearings ? 'Deal again' : 'Random suits'}
            </button>
          </span>
        </div>
        {game.clearings ? (
          <>
            <div className="clearings">
              {game.clearings.map((suit, i) => {
                const cs = CLEARING_SUITS.find((c) => c.id === suit)!
                return (
                  <div key={i} className="clearing" style={{ background: cs.color }} title={`Clearing ${i + 1}: ${cs.name}`}>
                    <b>{i + 1}</b>
                    <span>{cs.emoji}</span>
                  </div>
                )
              })}
            </div>
            <p className="note">Put a suit marker on each clearing by its priority number: four of each suit.</p>
          </>
        ) : (
          <p className="note">Using the suits printed on the Autumn map.</p>
        )}

        <div className="sub">
          Deck
          <button className="chip dark" onClick={() => dispatch({ type: 'setDeck', deck: pickRandom(DECKS).id })}>
            🎲 Random deck
          </button>
        </div>
        <div className="picks">
          {DECKS.map((d) => (
            <button key={d.id} className={game.deck === d.id ? 'on' : ''} aria-pressed={game.deck === d.id} onClick={() => dispatch({ type: 'setDeck', deck: d.id })}>
              {d.name}
            </button>
          ))}
        </div>
        <p className="note">{DECKS.find((d) => d.id === game.deck)!.note}</p>

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
