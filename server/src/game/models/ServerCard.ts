import uuidv4 from 'uuid/v4'
import Card from '../shared/models/Card'
import CardType from '../shared/enums/CardType'
import ServerGame from './ServerGame'
import runCardEventHandler from '../utils/runCardEventHandler'
import ServerCardOnBoard from './ServerCardOnBoard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import GameTurnPhase from '../shared/enums/GameTurnPhase'
import ServerDamageInstance from './ServerDamageSource'
import ServerGameBoardRow from './ServerGameBoardRow'

export default class ServerCard extends Card {
	game: ServerGame
	isRevealed = false

	constructor(game: ServerGame, cardType: CardType) {
		super(uuidv4(), cardType, 'missingno')
		this.game = game
	}

	setPower(unit: ServerCardOnBoard, value: number): void {
		if (this.power === value) { return }

		this.onPowerChanged(unit, value, this.power)

		this.power = value
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardPowerChange(playerInGame.player, this)
		})
	}

	setAttack(unit: ServerCardOnBoard, value: number): void {
		if (this.attack === value) { return }

		this.onAttackChanged(unit, value, this.attack)

		this.attack = value
		this.game.players.forEach(playerInGame => {
			OutgoingMessageHandlers.notifyAboutCardAttackChange(playerInGame.player, this)
		})
	}

	reveal(owner: ServerPlayerInGame, opponent: ServerPlayerInGame): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		runCardEventHandler(() => this.onReveal(owner))
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(opponent.player, this)
	}

	onPlayUnit(thisUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow): void { return }
	onPlaySpell(owner: ServerPlayerInGame): void { return }
	onTurnPhaseChanged(thisUnit: ServerCardOnBoard, phase: GameTurnPhase): void { return }
	onPowerChanged(thisUnit: ServerCardOnBoard, newValue: number, oldValue: number): void { return }
	onAttackChanged(thisUnit: ServerCardOnBoard, newValue: number, oldValue: number): void { return }
	onBeforeDamageTaken(thisUnit: ServerCardOnBoard, damage: ServerDamageInstance): void { return }
	onAfterDamageTaken(thisUnit: ServerCardOnBoard, damage: ServerDamageInstance): void { return }
	onDamageSurvived(thisUnit: ServerCardOnBoard, damage: ServerDamageInstance): void { return }
	onBeforePerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void { return }
	onAfterPerformingAttack(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void { return }
	onBeforeBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void { return }
	onAfterBeingAttacked(thisUnit: ServerCardOnBoard, attacker: ServerCardOnBoard): void { return }
	onBeforePerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onAfterPerformingMove(thisUnit: ServerCardOnBoard, target: ServerGameBoardRow): void { return }
	onBeforeOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void { return }
	onAfterOtherUnitDestroyed(thisUnit: ServerCardOnBoard, destroyedUnit: ServerCardOnBoard): void { return }
	onReveal(owner: ServerPlayerInGame): void { return }
	onDestroyUnit(thisUnit: ServerCardOnBoard): void { return }
}
