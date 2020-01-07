import ServerPlayer from './ServerPlayer'
import ServerGame from '../game/ServerGame'
import ServerCard from '../../models/game/ServerCard'
import PlayerInGame from '../../shared/models/PlayerInGame'
import ServerCardHand from '../../models/game/ServerCardHand'
import ServerCardDeck from '../../models/game/ServerCardDeck'
import OutgoingMessageHandlers from '../../handlers/OutgoingMessageHandlers'

export default class ServerPlayerInGame extends PlayerInGame {
	player: ServerPlayer
	cardHand: ServerCardHand
	cardDeck: ServerCardDeck
	rowsOwned: number

	constructor(player: ServerPlayer, cardDeck: ServerCardDeck) {
		super(player)
		this.player = player
		this.cardHand = new ServerCardHand(this.player, [])
		this.cardDeck = cardDeck
		this.rowsOwned = 0
	}

	public playCard(game: ServerGame, card: ServerCard): void {
		card.onPlay(game, this)
		this.cardHand.removeCard(card)

		OutgoingMessageHandlers.notifyAboutPlayerCardDestroyed(this.player, card)
		const opponent = game.players.find(playerInGame => playerInGame.player !== this.player)
		OutgoingMessageHandlers.notifyAboutOpponentCardDestroyed(opponent.player, card)
	}

	public drawCards(game: ServerGame, count: number): void {
		const cards: ServerCard[] = []
		for (let i = 0; i < count; i++) {
			const card = this.cardDeck.drawCard(game)
			if (!card) {
				// TODO: Fatigue damage?
				continue
			}

			this.cardHand.drawCard(card, game)
			cards.push(card)
		}

		OutgoingMessageHandlers.notifyAboutCardsDrawn(this.player, cards)
		const opponent = game.players.find(playerInGame => playerInGame.player !== this.player)
		if (opponent) {
			OutgoingMessageHandlers.notifyAboutOpponentCardsDrawn(opponent.player, cards)
		}
	}

	static newInstance(player: ServerPlayer, cardDeck: ServerCardDeck) {
		return new ServerPlayerInGame(player, cardDeck)
	}
}
