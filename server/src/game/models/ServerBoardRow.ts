import ServerGame from './ServerGame'
import BoardRow from '@shared/models/BoardRow'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import Constants from '@shared/Constants'
import ServerCard from './ServerCard'
import ServerAnimation from './ServerAnimation'
import ServerGameEventCreators from './events/GameEventCreators'

export default class ServerBoardRow implements BoardRow {
	index: number
	game: ServerGame
	owner: ServerPlayerInGame | null
	cards: ServerUnit[]

	constructor(game: ServerGame, index: number) {
		this.index = index
		this.game = game
		this.owner = null
		this.cards = []
	}

	public isFull(): boolean {
		return this.cards.length === Constants.MAX_CARDS_PER_ROW
	}

	public createUnit(card: ServerCard, owner: ServerPlayerInGame, unitIndex: number): ServerUnit | null {
		if (this.cards.length >= Constants.MAX_CARDS_PER_ROW) {
			return null
		}

		const unit = new ServerUnit(this.game, card, owner)
		this.insertUnit(unit, unitIndex)

		/* Play deploy animation */
		this.game.animation.play(ServerAnimation.unitDeploy(card))

		this.game.events.postEvent(ServerGameEventCreators.unitCreated({
			triggeringUnit: unit
		}))

		return unit
	}

	public insertUnitLocally(unit: ServerUnit, ordinal: number): void {
		this.cards.splice(ordinal, 0, unit)
	}

	private insertUnit(unit: ServerUnit, ordinal: number): void {
		this.insertUnitLocally(unit, ordinal)
		OutgoingMessageHandlers.notifyAboutUnitCreated(unit)
	}

	public removeUnitLocally(targetCard: ServerUnit): void {
		this.cards = this.cards.filter(cardOnBoard => cardOnBoard !== targetCard)
	}

	public removeUnit(unit: ServerUnit): void {
		this.removeUnitLocally(unit)
		OutgoingMessageHandlers.notifyAboutUnitDestroyed(unit)
	}

	public setOwner(player: ServerPlayerInGame | null): void {
		if (this.owner === player) {
			return
		}

		this.owner = player
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutRowOwnershipChanged(playerInGame.player, this)
		})
	}
}
