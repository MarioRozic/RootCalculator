import type { Box } from './factions'

export type MapId = 'autumn' | 'winter' | 'lake' | 'mountain' | 'gorge'
export type ClearingSuit = 'fox' | 'mouse' | 'rabbit'
export type DeckId = 'standard' | 'exiles'

type Pt = [number, number]

export interface RootMap {
  id: MapId
  name: string
  box: Box
  /** Map tint for the drawing. */
  ground: string
  path: string
  /** Clearing centers, in the drawing's own coordinates. */
  clearings: Pt[]
  /** Suits printed on the board (Autumn only). */
  printed?: ClearingSuit[]
  /** Pairs of clearing indexes joined by a path. */
  paths: Pt[]
  /** Mountain paths that start closed. */
  closed?: Pt[]
  rivers?: Pt[][]
  lake?: Pt[]
  tower?: number
  note: string
}

// Simplified layouts traced from the board images on therootdatabase.com.
// Positions are approximate; connections follow the printed paths.
export const MAPS: RootMap[] = [
  {
    id: 'autumn',
    name: 'Autumn',
    box: 'base',
    ground: '#e3c27f',
    path: '#7a5328',
    clearings: [[130, 85], [440, 60], [640, 140], [340, 180], [140, 240], [480, 290], [660, 315], [285, 340], [440, 450], [140, 495], [310, 525], [610, 505]],
    printed: ['fox', 'rabbit', 'mouse', 'rabbit', 'mouse', 'mouse', 'fox', 'fox', 'mouse', 'rabbit', 'fox', 'rabbit'],
    paths: [[0, 1], [0, 3], [0, 4], [1, 2], [2, 3], [2, 6], [3, 7], [4, 7], [4, 9], [7, 5], [7, 9], [7, 8], [5, 6], [5, 11], [6, 11], [9, 10], [10, 8], [8, 11]],
    rivers: [[[445, 0], [420, 60], [350, 150], [390, 200], [480, 240], [470, 320], [445, 400], [380, 450], [260, 450], [150, 490], [72, 520]]],
    note: 'The classic map. Suits are printed on the board.',
  },
  {
    id: 'winter',
    name: 'Winter',
    box: 'base',
    ground: '#e4ecef',
    path: '#5d6e78',
    clearings: [[155, 85], [320, 110], [460, 140], [640, 140], [160, 245], [310, 315], [480, 290], [670, 360], [160, 480], [320, 510], [460, 445], [620, 505]],
    paths: [[0, 1], [0, 4], [0, 5], [1, 2], [2, 3], [3, 6], [3, 7], [4, 8], [5, 8], [5, 9], [6, 10], [6, 11], [7, 11], [8, 9], [9, 10], [10, 11]],
    rivers: [[[72, 245], [160, 255], [300, 290], [420, 265], [480, 282], [560, 310], [640, 330], [728, 295]]],
    note: 'Back of the base board. A river crosses the middle.',
  },
  {
    id: 'lake',
    name: 'Lake',
    box: 'underworld',
    ground: '#b9d6bf',
    path: '#4d6646',
    clearings: [[170, 105], [360, 75], [520, 135], [660, 200], [280, 200], [145, 295], [495, 285], [640, 335], [300, 395], [150, 480], [360, 510], [615, 500]],
    paths: [[0, 1], [0, 4], [0, 5], [1, 4], [1, 2], [1, 6], [2, 3], [2, 6], [3, 7], [4, 5], [6, 7], [5, 9], [7, 11], [8, 9], [8, 10], [9, 10], [10, 11]],
    lake: [[250, 215], [330, 200], [390, 205], [400, 260], [460, 285], [520, 305], [540, 350], [560, 420], [600, 470], [570, 495], [500, 470], [420, 420], [360, 390], [260, 390], [205, 370], [230, 320], [245, 260]],
    note: 'Coastal clearings are linked by the ferry across the lake.',
  },
  {
    id: 'mountain',
    name: 'Mountain',
    box: 'underworld',
    ground: '#dcb08a',
    path: '#5b3f2a',
    clearings: [[140, 95], [420, 95], [610, 130], [260, 200], [390, 245], [130, 340], [660, 300], [490, 355], [295, 395], [155, 490], [450, 505], [630, 460]],
    paths: [[0, 3], [0, 5], [1, 4], [1, 7], [2, 7], [2, 6], [3, 8], [3, 4], [4, 7], [4, 8], [5, 9], [6, 11], [7, 11], [8, 9], [8, 10]],
    closed: [[1, 3], [1, 2], [3, 5], [8, 7], [7, 6], [10, 11]],
    rivers: [[[160, 560], [175, 470], [200, 370], [280, 300], [370, 250], [420, 255], [480, 230], [560, 150], [640, 90]]],
    tower: 4,
    note: 'Ridges block some paths until they are cleared. The tower is in the middle.',
  },
  {
    id: 'gorge',
    name: 'Gorge',
    box: 'homeland',
    ground: '#e6b46c',
    path: '#6b3d1e',
    clearings: [[155, 90], [475, 85], [635, 95], [390, 185], [200, 225], [590, 215], [155, 370], [410, 365], [630, 340], [170, 525], [385, 500], [545, 530]],
    paths: [[0, 1], [1, 2], [0, 3], [0, 4], [1, 3], [2, 5], [4, 6], [5, 8], [4, 5], [6, 8], [7, 10], [6, 9], [6, 10], [9, 10], [10, 11], [8, 11], [7, 11]],
    rivers: [
      [[72, 290], [130, 240], [210, 175], [280, 150], [360, 215], [420, 190], [480, 150], [560, 100], [640, 120], [728, 135]],
      [[380, 230], [330, 320], [320, 420], [350, 520], [355, 560]],
    ],
    note: 'Two rope bridges cross the gorge.',
  },
]

export const MAP_BY_ID = Object.fromEntries(MAPS.map((m) => [m.id, m])) as Record<MapId, RootMap>

export const DECKS: { id: DeckId; name: string }[] = [
  { id: 'standard', name: 'Standard' },
  { id: 'exiles', name: 'Exiles and Partisans' },
]

export const CLEARING_SUITS: Record<ClearingSuit, { name: string; emoji: string; color: string }> = {
  fox: { name: 'Fox', emoji: '🦊', color: '#d9653b' },
  mouse: { name: 'Mouse', emoji: '🐭', color: '#e0a13a' },
  rabbit: { name: 'Rabbit', emoji: '🐰', color: '#ecd27a' },
}

export function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

/** An even share of each suit, shuffled across the map's clearings. */
export function randomClearingSuits(count: number): ClearingSuit[] {
  const order: ClearingSuit[] = ['fox', 'mouse', 'rabbit']
  const suits = Array.from({ length: count }, (_, i) => order[i % 3])
  for (let i = suits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[suits[i], suits[j]] = [suits[j], suits[i]]
  }
  return suits
}
