import express, { Request, Response } from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import ServerGame from '../game/models/ServerGame'
import ServerBotPlayer from '../game/AI/ServerBotPlayer'
import ServerTemplateCardDeck from '../game/models/ServerTemplateCardDeck'
import GameLibrary from '../game/libraries/GameLibrary'
import GameMessage from '@shared/models/network/GameMessage'
import { getPlayerFromAuthenticatedRequest } from '../utils/Utils'
import GameMode from '@shared/enums/GameMode'
import ChallengeAIDifficulty from '@shared/enums/ChallengeAIDifficulty'
import ChallengeLevel from '@shared/enums/ChallengeLevel'
import RulesetLibrary from '@src/game/libraries/RulesetLibrary'
import { ServerRulesetTemplate } from '@src/game/models/rulesets/ServerRuleset'
import CardLibrary from '@src/game/libraries/CardLibrary'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', (req: Request, res: Response) => {
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	const reconnect = req.query['reconnect'] || ('' as string)

	let filteredGames: ServerGame[] = GameLibrary.games.filter((game) => !game.isFinished)
	if (reconnect) {
		filteredGames = filteredGames.filter((game) => game.players.find((playerInGame) => playerInGame.player.id === currentPlayer.id))
	}

	const gameMessages = filteredGames.map((game) => new GameMessage(game))
	res.json({ data: gameMessages })
})

router.post('/', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	const gameName = req.body['name'] || ''
	const rulesetClass = req.body['ruleset'] as string

	if (!rulesetClass) {
		throw { status: 400, error: '"ruleset" param not provided' }
	}

	const connectedGames = GameLibrary.games.filter((game) => game.players.find((playerInGame) => playerInGame.player === player))
	connectedGames.forEach((game) => {
		const playerInGame = game.players.find((playerInGame) => playerInGame.player === player)
		game.finish(playerInGame?.opponent || null, 'Player surrendered (Started new game)')
	})

	let ruleset: ServerRulesetTemplate
	try {
		ruleset = RulesetLibrary.findPrototypeByClass(rulesetClass)
	} catch (err) {
		throw { status: 400, error: 'Invalid ruleset class' }
	}
	const game = GameLibrary.createOwnedGame(player, gameName.trim(), ruleset, {})

	if (ruleset.ai) {
		const deck = ruleset.ai.deck
		game.addPlayer(new ServerBotPlayer(), ServerTemplateCardDeck.fromEditorDeck(game, deck))
	}

	res.json({ data: new GameMessage(game) })
})

router.post('/disconnect', (req: Request, res: Response) => {
	const currentPlayer = getPlayerFromAuthenticatedRequest(req)
	currentPlayer.disconnect()

	res.status(204)
	res.send()
})

router.delete('/:gameId', (req: Request, res: Response) => {
	const player = getPlayerFromAuthenticatedRequest(req)
	GameLibrary.destroyOwnedGame(req.params.gameId, player, 'Owner command')

	res.json({ success: true })
})

module.exports = router
