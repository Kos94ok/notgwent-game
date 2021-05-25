import ServerPlayer from '../../players/ServerPlayer'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import ServerGame from '../../models/ServerGame'
import ServerCard from '../../models/ServerCard'
import ServerOwnedCard from '../../models/ServerOwnedCard'
import OpenCardMessage from '@shared/models/network/card/OpenCardMessage'
import CardRefMessage from '@shared/models/network/card/CardRefMessage'
import { isCardPublic } from '../../../utils/Utils'
import { PlayerUpdateMessageType } from '@shared/models/network/messageHandlers/ServerToClientMessageTypes'
import OwnedCardRefMessage from '@shared/models/network/ownedCard/OwnedCardRefMessage'
import OpenOwnedCardMessage from '@shared/models/network/ownedCard/OpenOwnedCardMessage'
import HiddenOwnedCardMessage from '@shared/models/network/ownedCard/HiddenOwnedCardMessage'
import CardTargetMessage from '@shared/models/network/CardTargetMessage'
import ServerPlayerSpectator from '../../players/ServerPlayerSpectator'
import MulliganCountMessage from '@shared/models/network/MulliganCountMessage'
import PlayerInGameRefMessage from '@shared/models/network/playerInGame/PlayerInGameRefMessage'
import PlayerInGameManaMessage from '@shared/models/network/playerInGame/PlayerInGameManaMessage'

export default {
	notifyAboutDeckLeader(playerInGame: ServerPlayerInGame | ServerPlayerSpectator, opponent: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.LEADER_SELF,
			data: new OpenCardMessage(card),
		})

		opponent.player.sendMessage({
			type: PlayerUpdateMessageType.LEADER_OPPONENT,
			data: new OpenCardMessage(card),
		})
	},

	notifyAboutMoraleChange: (player: ServerPlayer, playerInGame: ServerPlayerInGame): void => {
		player.sendMessage({
			type: PlayerUpdateMessageType.MORALE,
			data: new PlayerInGameManaMessage(playerInGame),
		})
	},

	notifyAboutManaChange: (playerInGame: ServerPlayerInGame, delta: number): void => {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.MANA,
			data: new PlayerInGameManaMessage(playerInGame),
			highPriority: delta < 0,
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.MANA,
			data: new PlayerInGameManaMessage(playerInGame),
		})
	},

	notifyAboutCardsMulliganed: (playerToNotify: ServerPlayer, playerInGame: ServerPlayerInGame): void => {
		playerToNotify.sendMessage({
			type: PlayerUpdateMessageType.MULLIGANS,
			data: new MulliganCountMessage(playerInGame.cardsMulliganed, playerInGame.game.maxMulligans),
			highPriority: true,
		})
	},

	notifyAboutCardAddedToUnitHand(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_HAND_UNIT,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_HAND_UNIT,
			data: isCardPublic(card)
				? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
				: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
	},

	notifyAboutCardAddedToSpellHand(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_HAND_SPELL,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})

		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_HAND_SPELL,
			data: isCardPublic(card)
				? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
				: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
	},

	notifyAboutCardAddedToUnitDeck(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_DECK_UNIT,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_DECK_UNIT,
			data: isCardPublic(card)
				? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
				: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
	},

	notifyAboutCardAddedToSpellDeck(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_DECK_SPELL,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_DECK_SPELL,
			data: isCardPublic(card)
				? new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame))
				: new HiddenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
	},

	notifyAboutCardAddedToUnitGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_GRAVE_UNIT,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_GRAVE_UNIT,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
	},

	notifyAboutCardAddedToSpellGraveyard(playerInGame: ServerPlayerInGame, card: ServerCard): void {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_GRAVE_SPELL,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_ADD_GRAVE_SPELL,
			data: new OpenOwnedCardMessage(new ServerOwnedCard(card, playerInGame)),
		})
	},

	notifyAboutCardInHandDestroyed(ownedCard: ServerOwnedCard): void {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent!.player

		owner.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_HAND,
			data: new OwnedCardRefMessage(ownedCard),
		})
		opponent.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_HAND,
			data: new OwnedCardRefMessage(ownedCard),
		})
	},

	notifyAboutCardInDeckDestroyed(ownedCard: ServerOwnedCard): void {
		const owner = ownedCard.owner.player
		const opponent = ownedCard.owner.opponent!.player

		owner.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_DECK,
			data: new OwnedCardRefMessage(ownedCard),
		})
		opponent.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_DECK,
			data: new OwnedCardRefMessage(ownedCard),
		})
	},

	notifyAboutCardInGraveyardDestroyed(ownedCard: ServerOwnedCard): void {
		ownedCard.owner.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_GRAVE,
			data: new OwnedCardRefMessage(ownedCard),
		})
		ownedCard.owner.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.CARD_DESTROY_IN_GRAVE,
			data: new OwnedCardRefMessage(ownedCard),
		})
	},

	notifyAboutValidActionsChanged(game: ServerGame, playerInGame: ServerPlayerInGame): void {
		const cardsInHand = playerInGame.cardHand.allCards
		const validPlayTargets = cardsInHand.flatMap((card) => card.targeting.getPlayTargets(playerInGame, { checkMana: true }))
		const playTargetMessages = validPlayTargets.map((order) => new CardTargetMessage(order.target))
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.PLAY_TARGETS,
			data: playTargetMessages,
		})

		const messages = game.board.orders.validOrders
			.filter((order) => order.target.sourceCard.owner === playerInGame)
			.map((order) => new CardTargetMessage(order.target))

		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.UNIT_ORDERS_SELF,
			data: messages,
			highPriority: true,
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.UNIT_ORDERS_OPPONENT,
			data: messages,
		})
	},

	notifyAboutOpponentCardRevealed(player: ServerPlayer, card: ServerCard): void {
		player.sendMessage({
			type: PlayerUpdateMessageType.CARD_REVEALED,
			data: new OpenCardMessage(card),
		})
	},

	notifyAboutVictory: (player: ServerPlayer): void => {
		player.sendMessage({
			type: PlayerUpdateMessageType.GAME_END_VICTORY,
			data: null,
		})
	},

	notifyAboutDefeat: (player: ServerPlayer): void => {
		player.sendMessage({
			type: PlayerUpdateMessageType.GAME_END_DEFEAT,
			data: null,
		})
	},

	notifyAboutDraw: (game: ServerGame): void => {
		game.players.forEach((playerInGame) => {
			playerInGame.player.sendMessage({
				type: PlayerUpdateMessageType.GAME_END_DRAW,
				data: null,
			})
		})
	},

	notifyAboutCardPlayDeclined(player: ServerPlayer, card: ServerCard): void {
		player.sendMessage({
			type: PlayerUpdateMessageType.PLAY_DECLINED,
			data: new CardRefMessage(card),
			highPriority: true,
		})
	},

	notifyAboutRoundStarted: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.ROUND_START,
			data: new PlayerInGameRefMessage(playerInGame),
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.ROUND_START,
			data: new PlayerInGameRefMessage(playerInGame),
		})
	},

	notifyAboutTurnStarted: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.TURN_START,
			data: new PlayerInGameRefMessage(playerInGame),
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.TURN_START,
			data: new PlayerInGameRefMessage(playerInGame),
		})
	},

	notifyAboutTurnEnded: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.TURN_END,
			data: new PlayerInGameRefMessage(playerInGame),
			highPriority: true,
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.TURN_END,
			data: new PlayerInGameRefMessage(playerInGame),
		})
	},

	notifyAboutRoundEnded: (playerInGame: ServerPlayerInGame): void => {
		playerInGame.player.sendMessage({
			type: PlayerUpdateMessageType.ROUND_END,
			data: new PlayerInGameRefMessage(playerInGame),
			highPriority: true,
		})
		playerInGame.opponent?.player.sendMessage({
			type: PlayerUpdateMessageType.ROUND_END,
			data: new PlayerInGameRefMessage(playerInGame),
		})
	},
}
