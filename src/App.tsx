import { useGame } from './game'
import { PickFactions } from './screens/PickFactions'
import { Score } from './screens/Score'
import { Setup } from './screens/Setup'
import { Woodland } from './screens/Woodland'

export default function App() {
  const [game, dispatch] = useGame()
  if (game.screen === 'score' && game.players.length) return <Score game={game} dispatch={dispatch} />
  if (game.screen === 'woodland' && game.players.length) return <Woodland game={game} dispatch={dispatch} />
  if (game.screen === 'setup' && game.players.length) return <Setup game={game} dispatch={dispatch} />
  return <PickFactions game={game} dispatch={dispatch} />
}
