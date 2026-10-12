import { useRef, type Dispatch } from 'react'
import { MapDrawing } from '../components/MapDrawing'
import { BOXES } from '../data/factions'
import { DECKS, MAPS, MAP_BY_ID, pickRandom } from '../data/maps'
import type { Action, Game } from '../game'

export function Woodland({ game, dispatch }: { game: Game; dispatch: Dispatch<Action> }) {
  const maps = MAPS.filter((m) => game.boxes[m.box])
  const map = MAP_BY_ID[game.map]
  const index = Math.max(0, maps.findIndex((m) => m.id === map.id))
  const suits = game.clearings ?? map.printed!
  const deck = DECKS.find((d) => d.id === game.deck)!
  const swipeX = useRef<number | null>(null)

  const step = (dir: number) => dispatch({ type: 'setMap', map: maps[(index + dir + maps.length) % maps.length].id })

  return (
    <div className="screen">
      <header className="bar">
        <button className="chip" onClick={() => dispatch({ type: 'back' })}>
          ‹ Factions
        </button>
        <small>{game.players.length} players</small>
      </header>

      <div className="scroll">
        <div
          className="woodmap"
          onPointerDown={(e) => (swipeX.current = e.clientX)}
          onPointerUp={(e) => {
            const dx = swipeX.current === null ? 0 : e.clientX - swipeX.current
            swipeX.current = null
            if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1)
          }}
        >
          <MapDrawing map={map} suits={suits} />
          <span className="tag">{BOXES.find((b) => b.id === map.box)!.name}</span>
        </div>

        <div className="mapnav">
          <button aria-label="Previous map" onClick={() => step(-1)}>
            ‹
          </button>
          <div className="mapname">
            <b>{map.name}</b>
            <div className="dots">
              {maps.map((m) => (
                <button key={m.id} className={m.id === map.id ? 'on' : ''} aria-label={m.name} onClick={() => dispatch({ type: 'setMap', map: m.id })} />
              ))}
            </div>
          </div>
          <button aria-label="Next map" onClick={() => step(1)}>
            ›
          </button>
        </div>
        <p className="note center">{map.note}</p>

        <div className="pills">
          <button onClick={() => dispatch({ type: 'setDeck', deck: game.deck === 'standard' ? 'exiles' : 'standard' })}>
            <small>Deck · tap to switch</small>
            <b>{deck.name}</b>
          </button>
          <button
            onClick={() =>
              dispatch(map.printed && game.clearings ? { type: 'usePrintedSuits' } : { type: 'dealClearings' })
            }
          >
            <small>Suits · tap to {map.printed && game.clearings ? 'use printed' : 'deal again'}</small>
            <b>{game.clearings ? `Random · ${countLabel(suits.length)}` : 'Printed'}</b>
          </button>
        </div>
      </div>

      <div className="actions">
        <button className="btn ghost" onClick={() => dispatch({ type: 'rollWoodland', map: pickRandom(maps).id })}>
          🎲 Roll map and suits
        </button>
        <button className="btn" onClick={() => dispatch({ type: 'toTurnOrder' })}>
          Next: turn order
        </button>
      </div>
    </div>
  )
}

function countLabel(n: number) {
  const each = n / 3
  return `${each}/${each}/${each}`
}
