export type Box = 'base' | 'riverfolk' | 'underworld' | 'marauder' | 'homeland'

export const BOXES: { id: Box; name: string }[] = [
  { id: 'base', name: 'Base' },
  { id: 'riverfolk', name: 'Riverfolk' },
  { id: 'underworld', name: 'Underworld' },
  { id: 'marauder', name: 'Marauder' },
  { id: 'homeland', name: 'Homeland' },
]

export type FactionId =
  | 'cat' | 'eyrie' | 'alliance' | 'vagabond'
  | 'lizard' | 'river' | 'vagabond2'
  | 'duchy' | 'corvid'
  | 'lord' | 'keepers'
  | 'lilypad' | 'twilight' | 'knaves'

export interface Faction {
  id: FactionId
  name: string
  short: string
  box: Box
  reach: number
  militant: boolean
  /** Can lose VP during play (Eyrie turmoil), so its tile gets a minus button. */
  losesVp?: boolean
  color: string
  fg: string
  /** Position in the setup order (A, B, C...). */
  setup: number
  setupNote: string
}

// Reach values from the Law of Root (5.2.2), therootdatabase.com/law/setup.
// Setup order and militant tags for the expansion factions still need checking
// against the printed faction boards.
export const FACTIONS: Faction[] = [
  { id: 'cat', name: 'Marquise de Cat', short: 'Cats', box: 'base', reach: 10, militant: true, color: '#e5762b', fg: '#2a1607', setup: 1, setupNote: 'Keep in a corner, a warrior in every other clearing, sawmill, workshop and recruiter' },
  { id: 'lord', name: 'Lord of the Hundreds', short: 'Hundreds', box: 'marauder', reach: 9, militant: true, color: '#c2352c', fg: '#fff', setup: 10, setupNote: 'Follow the setup on the back of the faction board' },
  { id: 'keepers', name: 'Keepers in Iron', short: 'Keepers', box: 'marauder', reach: 8, militant: false, color: '#4f6b3a', fg: '#fff', setup: 11, setupNote: 'Follow the setup on the back of the faction board' },
  { id: 'duchy', name: 'Underground Duchy', short: 'Duchy', box: 'underworld', reach: 8, militant: true, color: '#d2a06a', fg: '#2a1607', setup: 8, setupNote: 'Follow the setup on the back of the faction board' },
  { id: 'eyrie', name: 'Eyrie Dynasties', short: 'Eyrie', box: 'base', reach: 7, militant: true, losesVp: true, color: '#2f6fb4', fg: '#fff', setup: 2, setupNote: 'Roost and six warriors in the corner opposite the keep, choose a leader' },
  { id: 'lilypad', name: 'Lilypad Diaspora', short: 'Lilypad', box: 'homeland', reach: 7, militant: false, color: '#e0889b', fg: '#3a1018', setup: 12, setupNote: 'Follow the setup on the back of the faction board' },
  { id: 'vagabond', name: 'Vagabond', short: 'Vagabond', box: 'base', reach: 5, militant: false, color: '#7d7a72', fg: '#fff', setup: 4, setupNote: 'Choose a character, start in any forest, take starting items' },
  { id: 'river', name: 'Riverfolk Company', short: 'Otters', box: 'riverfolk', reach: 5, militant: false, color: '#3bb0c4', fg: '#0b2a30', setup: 6, setupNote: 'Follow the setup on the back of the faction board' },
  { id: 'twilight', name: 'Twilight Council', short: 'Council', box: 'homeland', reach: 4, militant: false, color: '#6a6cb8', fg: '#fff', setup: 13, setupNote: 'Follow the setup on the back of the faction board' },
  { id: 'knaves', name: 'Knaves of the Deepwood', short: 'Knaves', box: 'homeland', reach: 4, militant: false, color: '#a8506f', fg: '#fff', setup: 14, setupNote: 'Choose a Captain card, follow the setup on the back of the faction board' },
  { id: 'alliance', name: 'Woodland Alliance', short: 'Alliance', box: 'base', reach: 3, militant: false, color: '#5da23e', fg: '#14280b', setup: 3, setupNote: 'Supporters stack, draw three cards, no pieces on the map yet' },
  { id: 'corvid', name: 'Corvid Conspiracy', short: 'Corvids', box: 'underworld', reach: 3, militant: false, color: '#5e3f8f', fg: '#fff', setup: 9, setupNote: 'Follow the setup on the back of the faction board' },
  { id: 'lizard', name: 'Lizard Cult', short: 'Lizards', box: 'riverfolk', reach: 2, militant: false, color: '#efc534', fg: '#3a2a05', setup: 5, setupNote: 'Four warriors and a garden in an open corner clearing' },
  { id: 'vagabond2', name: 'Second Vagabond', short: 'Vagabond 2', box: 'riverfolk', reach: 2, militant: false, color: '#a39f95', fg: '#1d1b17', setup: 7, setupNote: 'Choose a different character, start in any forest' },
]

export const FACTION_BY_ID = Object.fromEntries(FACTIONS.map((f) => [f.id, f])) as Record<FactionId, Faction>

/** Minimum combined reach for a balanced game, by player count. */
export const MIN_REACH: Record<number, number> = { 2: 17, 3: 18, 4: 21, 5: 25, 6: 28 }

export const WIN_VP = 30

export type Suit = 'fox' | 'mouse' | 'rabbit' | 'bird'
export const SUITS: { id: Suit; name: string; emoji: string }[] = [
  { id: 'fox', name: 'Fox', emoji: '🦊' },
  { id: 'mouse', name: 'Mouse', emoji: '🐭' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰' },
  { id: 'bird', name: 'Bird', emoji: '🐦' },
]

export function setupLetter(index: number) {
  return String.fromCharCode(65 + index)
}

export function isLegalSet(ids: FactionId[]) {
  return !ids.includes('vagabond2') || ids.includes('vagabond')
}

/** Rolls random sets until one meets the reach minimum, has a militant faction and is legal. */
export function randomFairSet(count: number, pool: Faction[]): FactionId[] | null {
  for (let attempt = 0; attempt < 5000; attempt++) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5).slice(0, count)
    const ids = shuffled.map((f) => f.id)
    if (shuffled.length < count) return null
    if (!isLegalSet(ids)) continue
    if (!shuffled.some((f) => f.militant)) continue
    if (shuffled.reduce((s, f) => s + f.reach, 0) < MIN_REACH[count]) continue
    return ids
  }
  return null
}
