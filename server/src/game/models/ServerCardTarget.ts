import ServerCardOnBoard from './ServerCardOnBoard'
import ServerGameBoardRow from './ServerGameBoardRow'
import CardTarget from '../shared/models/CardTarget'
import TargetMode from '../shared/enums/TargetMode'
import TargetType from '../shared/enums/TargetType'
import CardTargetMessage from '../shared/models/network/CardTargetMessage'
import ServerGame from './ServerGame'
import ServerCard from './ServerCard'
import ServerPlayerInGame from '../players/ServerPlayerInGame'

export default class ServerCardTarget implements CardTarget {
	targetMode: TargetMode
	targetType: TargetType
	sourceCard?: ServerCard
	sourceCardOwner?: ServerPlayerInGame
	sourceUnit?: ServerCardOnBoard
	targetCard?: ServerCard
	targetUnit?: ServerCardOnBoard
	targetRow?: ServerGameBoardRow
	targetLabel: string

	private constructor(targetMode: TargetMode, targetType: TargetType) {
		this.targetMode = targetMode
		this.targetType = targetType
	}

	public isEqual(other: ServerCardTarget): boolean {
		return this.targetMode === other.targetMode &&
			this.targetType === other.targetType &&
			(this.sourceCard === other.sourceCard || this.sourceUnit === other.sourceUnit) &&
			this.targetUnit === other.targetUnit &&
			this.targetRow === other.targetRow
	}

	public static cardTargetUnit(targetMode: TargetMode, orderedCard: ServerCard, targetUnit: ServerCardOnBoard, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.UNIT)
		order.sourceCard = orderedCard
		order.targetUnit = targetUnit
		order.targetLabel = targetLabel
		return order
	}

	public static cardTargetRow(targetMode: TargetMode, orderedCard: ServerCard, targetRow: ServerGameBoardRow, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.BOARD_ROW)
		order.sourceCard = orderedCard
		order.targetRow = targetRow
		order.targetLabel = targetLabel
		return order
	}

	public static unitTargetUnit(targetMode: TargetMode, orderedUnit: ServerCardOnBoard, targetUnit: ServerCardOnBoard, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.UNIT)
		order.sourceUnit = orderedUnit
		order.targetUnit = targetUnit
		order.targetLabel = targetLabel
		return order
	}

	public static unitTargetRow(targetMode: TargetMode, orderedUnit: ServerCardOnBoard, targetRow: ServerGameBoardRow, targetLabel = ''): ServerCardTarget {
		const order = new ServerCardTarget(targetMode, TargetType.BOARD_ROW)
		order.sourceUnit = orderedUnit
		order.targetRow = targetRow
		order.targetLabel = targetLabel
		return order
	}

	public static fromMessage(game: ServerGame, message: CardTargetMessage): ServerCardTarget {
		const target = new ServerCardTarget(message.targetMode, message.targetType)
		if (message.sourceCardId) {
			target.sourceCard = game.findCardById(message.sourceCardId) || game.board.findUnitById(message.sourceCardId).card
		}
		if (message.sourceCardOwnerId) {
			target.sourceCardOwner = game.players.find(playerInGame => playerInGame.player.id === message.sourceCardOwnerId)
		}
		if (message.sourceUnitId) {
			target.sourceUnit = game.board.findUnitById(message.sourceUnitId)
		}
		if (message.targetCardId) {
			target.targetCard = game.findCardById(message.sourceCardId)
		}
		if (message.targetUnitId) {
			target.targetUnit = game.board.findUnitById(message.targetUnitId)
		}
		if (message.targetRowIndex !== -1) {
			target.targetRow = game.board.rows[message.targetRowIndex]
		}
		target.targetLabel = message.targetLabel
		return target
	}
}
