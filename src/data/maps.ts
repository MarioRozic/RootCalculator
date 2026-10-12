import type { Box } from './factions'

export type MapId = 'autumn' | 'winter' | 'lake' | 'mountain' | 'marsh' | 'gorge'
export type ClearingSuit = 'fox' | 'mouse' | 'rabbit'
export type DeckId = 'standard' | 'exiles'

export interface RootMap {
  id: MapId
  name: string
  box: Box
  /** Autumn is the only map with suits printed on its clearings. */
  printedSuits: boolean
  note: string
}

// The Homeland maps still need checking against the box contents.
export const MAPS: RootMap[] = [
  { id: 'autumn', name: 'Autumn', box: 'base', printedSuits: true, note: 'The classic map, suits printed on the board' },
  { id: 'winter', name: 'Winter', box: 'base', printedSuits: false, note: 'Back of the base board, rivers but no printed suits' },
  { id: 'lake', name: 'Lake', box: 'underworld', printedSuits: false, note: 'Ferry crosses the lake between coastal clearings' },
  { id: 'mountain', name: 'Mountain', box: 'underworld', printedSuits: false, note: 'Blocked paths you can clear, plus a tower' },
  { id: 'marsh', name: 'Marsh', box: 'homeland', printedSuits: false, note: 'Follow the map setup in the Homeland rules' },
  { id: 'gorge', name: 'Gorge', box: 'homeland', printedSuits: false, note: 'Follow the map setup in the Homeland rules' },
]

export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m])) as Record<MapId, RootMap>

export const DECKS: { id: DeckId; name: string; note: string }[] = [
  { id: 'standard', name: 'Standard', note: 'The deck from the base game' },
  { id: 'exiles', name: 'Exiles and Partisans', note: 'Alternate deck with new cards and partisans' },
]

export const CLEARING_SUITS: { id: ClearingSuit; name: string; emoji: string; color: string }[] = [
  { id: 'fox', name: 'Fox', emoji: '🦊', color: '#d9653b' },
  { id: 'mouse', name: 'Mouse', emoji: '🐭', color: '#e0a13a' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰', color: '#e6c86a' },
]

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** Four of each suit, shuffled across clearings 1 to 12. */
export function randomClearingSuits(): ClearingSuit[] {
  const suits: ClearingSuit[] = ['fox', 'mouse', 'rabbit'].flatMap((s) => Array(4).fill(s))
  for (let i = suits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[suits[i], suits[j]] = [suits[j], suits[i]]
  }
  return suits
}
