import express, { Response } from 'express'
import RequirePlayerTokenMiddleware from '../middleware/RequirePlayerTokenMiddleware'
import SendErrorAsBadRequestMiddleware from '../middleware/SendErrorAsBadRequestMiddleware'
import ServerPlayer from '../game/players/ServerPlayer'
import ServerEditorDeck from '../game/models/ServerEditorDeck'
import CardLibrary from '../game/libraries/CardLibrary'
import CardMessage from '@shared/models/network/CardMessage'
import EditorDeck from '@shared/models/EditorDeck'
import EditorDeckDatabase from '../database/EditorDeckDatabase'
import AsyncHandler from '../utils/AsyncHandler'

const router = express.Router()

router.use(RequirePlayerTokenMiddleware)

router.get('/', AsyncHandler(async(req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const decks = await EditorDeckDatabase.selectEditorDecksForPlayer(player)

	const libraryCards = CardLibrary.cards.map(card => CardMessage.fromCard(card))
	const remappedDecks = decks.map(deck => ({
		...deck,
		cards: deck.cards.map(card => ({
			...libraryCards.find(libraryCard => libraryCard.class === card.class),
			...card
		}))
	}))

	res.json(remappedDecks)
}))

router.get('/:deckId', AsyncHandler(async(req, res: Response, next) => {
	const deckId = req.params.deckId
	const deck = await EditorDeckDatabase.selectEditorDeckById(deckId)
	if (!deck) {
		res.status(404).send()
		return
	}

	const libraryCards = CardLibrary.cards.map(card => CardMessage.fromCard(card))
	const remappedDeck = {
		...deck,
		cards: deck.cards.map(card => ({
			...libraryCards.find(libraryCard => libraryCard.class === card.class),
			...card
		}))
	}

	res.json(remappedDeck)
}))

router.post('/', AsyncHandler(async(req, res: Response, next) => {
	const player = req['player'] as ServerPlayer
	const deck = ServerEditorDeck.newDeck()
	const success = await EditorDeckDatabase.insertEditorDeck(player, deck.id, deck)

	res.status(success ? 200 : 400)
	res.json({
		deck: success ? deck : undefined
	})
}))

router.put('/:deckId', AsyncHandler(async(req, res: Response, next) => {
	const deckId = req.params.deckId
	const deckData = req.body as EditorDeck
	const player = req['player'] as ServerPlayer

	const success = await EditorDeckDatabase.insertEditorDeck(player, deckId, deckData)

	res.status(success ? 204 : 400)
	res.send()
}))

router.delete('/:deckId', AsyncHandler(async(req, res: Response, next) => {
	const deckId = req.params.deckId
	const player = req['player'] as ServerPlayer

	await EditorDeckDatabase.deleteEditorDeck(deckId, player)
	res.status(204)
	res.send()
}))

router.use((err, req, res, next) => {
	console.error(err)
})

router.use(SendErrorAsBadRequestMiddleware)

module.exports = router