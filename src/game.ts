import { useEffect, useReducer } from 'react'
import { MAP_BY_ID, randomClearingSuits, type ClearingSuit, type DeckId, type MapId } from './data/maps'
import { BOXES, FACTION_BY_ID, WIN_VP, isLegalSet, type Box, type FactionId, type Suit } from './data/factions'

export interface Player {
  faction: FactionId
  name: string
  vp: number
  dominance: Suit | null
  coalitionWith: FactionId | null
}

export interface LogEntry {
  faction: FactionId
  text: string
  round: number
}

export interface Game {
  screen: 'pick' | 'setup' | 'score'
  boxes: Record<Box, boolean>
  playerCount: number
  selected: FactionId[]
  /** In turn order, clockwise from the first player. */
  players: Player[]
  round: number
  /** Index into players of whose turn it is. */
  turn: number
  /** Epoch ms when the game started. */
  startedAt: number
  log: LogEntry[]
  undo: { players: Player[]; log: LogEntry[]; round: number; turn: number }[]
  rotate: boolean
  winnerSeen: boolean
  map: MapId
  /** Suit of clearings 1 to 12, or null to use the suits printed on the map. */
  clearings: ClearingSuit[] | null
  deck: DeckId
}

export type Action =
  | { type: 'toggleBox'; box: Box }
  | { type: 'setCount'; count: number }
  | { type: 'toggleFaction'; id: FactionId }
  | { type: 'setSelected'; ids: FactionId[] }
  | { type: 'toSetup' }
  | { type: 'setName'; index: number; name: string }
  | { type: 'rollFirst' }
  | { type: 'setMap'; map: MapId }
  | { type: 'dealClearings' }
  | { type: 'usePrintedSuits' }
  | { type: 'setDeck'; deck: DeckId }
  | { type: 'start' }
  | { type: 'back' }
  | { type: 'score'; faction: FactionId; delta: number }
  | { type: 'dominance'; faction: FactionId; suit: Suit | null }
  | { type: 'coalition'; faction: FactionId; with: FactionId | null }
  | { type: 'undo' }
  | { type: 'endTurn' }
  | { type: 'toggleRotate' }
  | { type: 'dismissWinner' }
  | { type: 'end' }

const STORAGE_KEY = 'rootcalc.game.v1'

function initial(): Game {
  return {
    screen: 'pick',
    boxes: Object.fromEntries(BOXES.map((b) => [b.id, true])) as Record<Box, boolean>,
    playerCount: 4,
    selected: [],
    players: [],
    round: 1,
    turn: 0,
    startedAt: 0,
    log: [],
    undo: [],
    rotate: false,
    winnerSeen: false,
    map: 'autumn',
    clearings: null,
    deck: 'standard',
  }
}

function load(): Game {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const g: Game = { ...initial(), ...JSON.parse(raw) }
      return g.screen === 'score' && !g.startedAt ? { ...g, startedAt: Date.now() } : g
    }
  } catch {
    // ignore unreadable storage
  }
  return initial()
}

function withUndo(g: Game): Game['undo'] {
  return [...g.undo, { players: g.players, log: g.log, round: g.round, turn: g.turn }].slice(-100)
}

function updatePlayer(g: Game, id: FactionId, fn: (p: Player) => Player) {
  return g.players.map((p) => (p.faction === id ? fn(p) : p))
}

function reducer(g: Game, a: Action): Game {
  switch (a.type) {
    case 'toggleBox': {
      const boxes = { ...g.boxes, [a.box]: !g.boxes[a.box] }
      const selected = g.selected.filter((id) => boxes[FACTION_BY_ID[id].box])
      const map = boxes[MAP_BY_ID[g.map].box] ? g.map : 'autumn'
      return { ...g, boxes, map, selected: isLegalSet(selected) ? selected : selected.filter((id) => id !== 'vagabond2') }
    }
    case 'setCount':
      return { ...g, playerCount: a.count, selected: g.selected.slice(0, a.count) }
    case 'toggleFaction': {
      if (g.selected.includes(a.id)) {
        // Dropping the first Vagabond also drops the second one.
        const drop = a.id === 'vagabond' ? ['vagabond', 'vagabond2'] : [a.id]
        return { ...g, selected: g.selected.filter((s) => !drop.includes(s)) }
      }
      if (g.selected.length >= g.playerCount) return g
      return { ...g, selected: [...g.selected, a.id] }
    }
    case 'setSelected':
      return { ...g, selected: a.ids }
    case 'toSetup': {
      const old = new Map(g.players.map((p) => [p.faction, p.name]))
      const players = g.selected.map((f) => ({ faction: f, name: old.get(f) ?? '', vp: 0, dominance: null, coalitionWith: null }))
      return { ...g, screen: 'setup', players }
    }
    case 'setName':
      return { ...g, players: g.players.map((p, i) => (i === a.index ? { ...p, name: a.name } : p)) }
    case 'rollFirst': {
      // Seating stays the same; a random player goes first and the rest follow clockwise.
      const first = Math.floor(Math.random() * g.players.length)
      return { ...g, players: [...g.players.slice(first), ...g.players.slice(0, first)] }
    }
    case 'setMap':
      // Maps without printed suits always need a random deal.
      return { ...g, map: a.map, clearings: a.map === 'autumn' ? g.clearings : (g.clearings ?? randomClearingSuits()) }
    case 'dealClearings':
      return { ...g, clearings: randomClearingSuits() }
    case 'usePrintedSuits':
      return { ...g, clearings: null }
    case 'setDeck':
      return { ...g, deck: a.deck }
    case 'start':
      return {
        ...g,
        screen: 'score',
        round: 1,
        turn: 0,
        startedAt: Date.now(),
        log: [],
        undo: [],
        winnerSeen: false,
        players: g.players.map((p) => ({ ...p, vp: 0, dominance: null, coalitionWith: null })),
      }
    case 'back':
      return { ...g, screen: g.screen === 'score' ? 'setup' : 'pick' }
    case 'score': {
      const p = g.players.find((x) => x.faction === a.faction)
      if (!p) return g
      const vp = Math.max(0, Math.min(WIN_VP, p.vp + a.delta))
      if (vp === p.vp) return g
      const change = vp - p.vp
      return {
        ...g,
        undo: withUndo(g),
        players: updatePlayer(g, a.faction, (x) => ({ ...x, vp })),
        log: [...g.log, { faction: a.faction, text: (change > 0 ? '+' : '−') + Math.abs(change), round: g.round }],
      }
    }
    case 'dominance':
      return {
        ...g,
        undo: withUndo(g),
        players: updatePlayer(g, a.faction, (x) => ({ ...x, dominance: a.suit })),
        log: [...g.log, { faction: a.faction, text: a.suit ? `played ${a.suit} dominance` : 'dropped dominance', round: g.round }],
      }
    case 'coalition':
      return {
        ...g,
        undo: withUndo(g),
        players: updatePlayer(g, a.faction, (x) => ({ ...x, coalitionWith: a.with })),
        log: [...g.log, { faction: a.faction, text: a.with ? `formed a coalition` : 'left the coalition', round: g.round }],
      }
    case 'undo': {
      const last = g.undo[g.undo.length - 1]
      if (!last) return g
      return { ...g, ...last, undo: g.undo.slice(0, -1), winnerSeen: false }
    }
    case 'endTurn': {
      // Passing the turn back to the first player starts a new round.
      const turn = (g.turn + 1) % g.players.length
      return { ...g, undo: withUndo(g), turn, round: turn === 0 ? g.round + 1 : g.round }
    }
    case 'toggleRotate':
      return { ...g, rotate: !g.rotate }
    case 'dismissWinner':
      return { ...g, winnerSeen: true }
    case 'end':
      return { ...initial(), boxes: g.boxes, playerCount: g.playerCount, selected: g.selected, map: g.map, clearings: g.clearings, deck: g.deck }
  }
}

export function useGame() {
  const [game, dispatch] = useReducer(reducer, undefined, load)
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(game))
    } catch {
      // storage full or blocked; the game still works for this session
    }
  }, [game])
  return [game, dispatch] as const
}

export function displayName(p: Player, short: string) {
  return p.name.trim() || short
}
