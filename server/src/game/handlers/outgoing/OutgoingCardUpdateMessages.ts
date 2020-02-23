import ServerCard from '../../models/ServerCard'
import ServerPlayer from '../../players/ServerPlayer'
import CardMessage from '../../shared/models/network/CardMessage'
import HiddenCardMessage from '../../shared/models/network/HiddenCardMessage'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import ServerCardTarget from '../../models/ServerCardTarget'
import CardTargetMessage from '../../shared/models/network/CardTargetMessage'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import ServerGame from '../../models/ServerGame'
import CardVariablesMessage from '../../shared/models/network/CardVariablesMessage'

export default {
	notifyAboutCardPlayDeclined(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/self/hand/playDeclined',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutUnitCardsDrawn(playerInGame: ServerPlayerInGame, cards: ServerCard[]) {
		const cardMessages = cards.map((card: ServerCard) => CardMessage.fromCard(card))
		playerInGame.player.sendMessage({
			type: 'update/player/self/hand/unit/cardDrawn',
			data: cardMessages
		})

		const hiddenCardMessages = cards.map((card: ServerCard) => HiddenCardMessage.fromCard(card))
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/hand/unit/cardDrawn',
			data: hiddenCardMessages
		})
	},

	notifyAboutSpellCardsDrawn(playerInGame: ServerPlayerInGame, cards: ServerCard[]) {
		const cardMessages = cards.map((card: ServerCard) => CardMessage.fromCard(card))
		playerInGame.player.sendMessage({
			type: 'update/player/self/hand/spell/cardDrawn',
			data: cardMessages
		})

		const hiddenCardMessages = cards.map((card: ServerCard) => HiddenCardMessage.fromCard(card))
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/hand/spell/cardDrawn',
			data: hiddenCardMessages
		})
	},

	notifyAboutUnitCardAdded(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/hand/unit/cardAdded',
			data: new CardMessage(card)
		})

		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/hand/unit/cardAdded',
			data: new HiddenCardMessage(card)
		})
	},

	notifyAboutSpellCardAdded(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/hand/spell/cardAdded',
			data: new CardMessage(card)
		})

		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/hand/spell/cardAdded',
			data: new HiddenCardMessage(card)
		})
	},

	notifyAboutOpponentCardRevealed(player: ServerPlayer, card: ServerCard) {
		player.sendMessage({
			type: 'update/player/opponent/hand/cardRevealed',
			data: CardMessage.fromCardWithVariables(card, card.evaluateVariables())
		})
	},

	notifyAboutCardInHandDestroyed(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player

		owner.sendMessage({
			type: 'update/player/self/hand/cardDestroyed',
			data: CardMessage.fromCard(ownedCard.card)
		})
		opponent.sendMessage({
			type: 'update/player/opponent/hand/cardDestroyed',
			data: HiddenCardMessage.fromCard(ownedCard.card)
		})
	},

	notifyAboutCardInDeckDestroyed(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player

		owner.sendMessage({
			type: 'update/player/self/deck/cardDestroyed',
			data: CardMessage.fromCard(ownedCard.card)
		})
		opponent.sendMessage({
			type: 'update/player/opponent/deck/cardDestroyed',
			data: HiddenCardMessage.fromCard(ownedCard.card)
		})
	},

	notifyAboutCardResolving(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player
		const data = CardMessage.fromCard(ownedCard.card)

		owner.sendMessage({
			type: 'update/stack/cardResolving',
			data: data,
			highPriority: true
		})
		opponent.sendMessage({
			type: 'update/stack/cardResolving',
			data: data
		})
	},

	notifyAboutResolvingCardTargets(player: ServerPlayer, validTargets: ServerCardTarget[]) {
		const messages = validTargets.map(target => new CardTargetMessage(target))
		player.sendMessage({
			type: 'update/stack/cardTargets',
			data: messages,
			highPriority: true
		})
	},

	notifyAboutCardResolved(ownedCard: ServerOwnedCard) {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent.player
		const data = CardMessage.fromCard(ownedCard.card)

		owner.sendMessage({
			type: 'update/stack/cardResolved',
			data: data,
			highPriority: true
		})
		opponent.sendMessage({
			type: 'update/stack/cardResolved',
			data: data
		})
	},

	notifyAboutUnitCardInGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/graveyard/unit/cardAdded',
			data: CardMessage.fromCard(card)
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/graveyard/unit/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutSpellCardInGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard) {
		playerInGame.player.sendMessage({
			type: 'update/player/self/graveyard/spell/cardAdded',
			data: CardMessage.fromCard(card)
		})
		playerInGame.opponent.player.sendMessage({
			type: 'update/player/opponent/graveyard/spell/cardAdded',
			data: CardMessage.fromCard(card)
		})
	},

	notifyAboutCardVariablesUpdated(game: ServerGame) {
		game.players.forEach(playerInGame => {
			const cardsToNotify = game.board.getUnitsOwnedByPlayer(playerInGame).map(unit => unit.card).concat(playerInGame.cardHand.allCards)
			const messages = cardsToNotify.map(card => new CardVariablesMessage(card, card.evaluateVariables()))
			playerInGame.player.sendMessage({
				type: 'update/card/variables',
				data: messages
			})
		})
	}
}
