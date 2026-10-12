import type { FactionId } from '../data/factions'

// Simple stand-in icons (24x24, single color). Swap for the official faction symbols later.
const PATHS: Record<FactionId, string> = {
  cat: '<path fill-rule="evenodd" d="M4 3l5 5h6l5-5v10a8 8 0 0 1-16 0zM8 13.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0zM13 13.5a1.5 1.5 0 1 0 3 0a1.5 1.5 0 1 0-3 0z"/>',
  eyrie: '<path fill-rule="evenodd" d="M4 21c0-8 3-14 9-14 2 0 3 .8 4 2l5 2.5-5 1.2c0 5-3 8.3-7 8.3zM7 7l-1.5-4 4.5 3.2zM12.5 10.5a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0z"/>',
  alliance: '<path d="M4 20C4 10 10 4 21 3c-1 11-7 17-17 17z"/><path d="M4 20l9-9" stroke="currentColor" stroke-width="1.6" fill="none" opacity=".45"/>',
  vagabond: '<path fill-rule="evenodd" d="M3 5l4.5 3a9 7 0 0 1 9 0L21 5l-1 7a8 7 0 0 1-16 0zM6.5 12.5a2.3 1.6 0 1 0 4.6 0a2.3 1.6 0 1 0-4.6 0zM12.9 12.5a2.3 1.6 0 1 0 4.6 0a2.3 1.6 0 1 0-4.6 0z"/>',
  vagabond2: '<path fill-rule="evenodd" d="M3 5l4.5 3a9 7 0 0 1 9 0L21 5l-1 7a8 7 0 0 1-16 0zM6.5 12.5a2.3 1.6 0 1 0 4.6 0a2.3 1.6 0 1 0-4.6 0zM12.9 12.5a2.3 1.6 0 1 0 4.6 0a2.3 1.6 0 1 0-4.6 0z"/>',
  duchy: '<path d="M3 13a9 7 0 0 1 18 0c0 3.5-4 5.5-9 5.5S3 16.5 3 13z"/><circle cx="12" cy="19" r="2.4"/><path d="M4 17l-2 3M6 18l-1 3M20 17l2 3M18 18l1 3" stroke="currentColor" stroke-width="1.4"/>',
  corvid: '<path fill-rule="evenodd" d="M2 11l8-2c1-3 4-5 7-5 3 0 5 3 5 7 0 5-3 9-8 9-2.2 0-4-1-5-3zM15 9a1.2 1.2 0 1 0 2.4 0a1.2 1.2 0 1 0-2.4 0z"/>',
  river: '<path d="M2 9c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1v3c-1.5-.5-2.5 0-5 1.5s-5 2-7.5 0-5-2-7.5 0z"/><path d="M2 16c2.5-2 5-2 7.5 0s5 2 7.5 0 3.5-1.5 5-1v3c-1.5-.5-2.5 0-5 1.5s-5 2-7.5 0-5-2-7.5 0z"/>',
  lizard: '<path fill-rule="evenodd" d="M12 2c4 4 7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 3-8 7-12zM9.5 14a2.5 2.5 0 1 0 5 0a2.5 2.5 0 1 0-5 0z"/>',
  lord: '<path d="M3 18l1.5-11 4.5 4.5L12 4l3 7.5L19.5 7 21 18z"/><rect x="3" y="19" width="18" height="2.5" rx="1"/>',
  keepers: '<path fill-rule="evenodd" d="M12 2l8 3v6c0 5.5-3.5 9.5-8 11-4.5-1.5-8-5.5-8-11V5zM11 7v4H7v2h4v4h2v-4h4v-2h-4V7z"/>',
  lilypad: '<path d="M12 3a9 9 0 1 0 9 9h-9z"/><circle cx="17.5" cy="6.5" r="2.5"/>',
  twilight: '<path d="M14 2a9 9 0 1 0 8 13A8 8 0 0 1 14 2z"/><circle cx="18" cy="5" r="1.4"/>',
  knaves: '<path d="M14.5 2l1.5 1.5L8.5 15 7 13.5zM5 14l5 5-1.5 1.5-1.5-1.5-3 3L2.5 20.5l3-3L4 16z"/><path d="M15 3l6-1-1 6z"/>',
}

export function FactionIcon({ id, className }: { id: FactionId; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: PATHS[id] }}
    />
  )
}
