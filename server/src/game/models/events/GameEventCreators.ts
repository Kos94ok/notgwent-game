import GameEventType from '@shared/enums/GameEventType'
import ServerPlayerInGame from '../../players/ServerPlayerInGame'
import ServerCard from '../ServerCard'
import ServerUnit from '../ServerUnit'
import ServerDamageInstance from '../ServerDamageSource'
import DamageSource from '@shared/enums/DamageSource'
import ServerBoardRow from '../ServerBoardRow'
import ServerBuff from '../ServerBuff'
import MoveDirection from '@shared/enums/MoveDirection'
import TargetType from '@shared/enums/TargetType'
import { ServerCardTargetCard, ServerCardTargetPosition, ServerCardTargetRow } from '../ServerCardTarget'
import TargetMode from '@shared/enums/TargetMode'

export default {
	gameStarted: (args: GameStartedEventArgs): GameEvent => ({
		type: GameEventType.GAME_STARTED,
		args: args,
		logVariables: {
			player: args.player.player.id,
		},
	}),

	roundStarted: (args: RoundStartedEventArgs): GameEvent => ({
		type: GameEventType.ROUND_STARTED,
		args: args,
		logVariables: {
			player: args.player.player.id,
		},
	}),
	turnStarted: (args: TurnStartedEventArgs): GameEvent => ({
		type: GameEventType.TURN_STARTED,
		args: args,
		logVariables: {
			player: args.player.player.id,
		},
	}),

	cardDrawn: (args: CardDrawnEventArgs): GameEvent => ({
		type: GameEventType.CARD_DRAWN,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardPlayed: (args: CardPlayedEventArgs): GameEvent => ({
		type: GameEventType.CARD_PLAYED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardPreResolved: (args: CardPreResolvedEventArgs): GameEvent => ({
		type: GameEventType.CARD_PRE_RESOLVED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardResolved: (args: CardResolvedEventArgs): GameEvent => ({
		type: GameEventType.CARD_RESOLVED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardTakesDamage: (args: CardTakesDamageEventArgs): GameEvent => ({
		type: GameEventType.CARD_TAKES_DAMAGE,
		args: args,
		effectSource: args.triggeringCard,
		logSubtype: args.damageInstance.source === DamageSource.CARD ? 'fromCard' : 'fromUniverse',
		logVariables: {
			damage: args.damageInstance.value,
			sourceCard: args.damageInstance.sourceCard ? args.damageInstance.sourceCard.id : '',
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardDiscarded: (args: CardDrawnEventArgs): GameEvent => ({
		type: GameEventType.CARD_DISCARDED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			owner: args.owner.player.id,
			triggeringCard: args.triggeringCard.id,
		},
	}),
	cardDestroyed: (args: CardDestroyedEventArgs): GameEvent => ({
		type: GameEventType.CARD_DESTROYED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
		},
	}),

	cardTargetCardSelected: (args: CardTargetSelectedCardEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_CARD,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetCard: args.targetCard.id,
		},
	}),
	cardTargetUnitSelected: (args: CardTargetSelectedUnitEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_UNIT,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetUnit: args.targetCard.id,
		},
	}),
	cardTargetRowSelected: (args: CardTargetSelectedRowEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_ROW,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetRow: args.targetRow.index,
		},
	}),
	cardTargetPositionSelected: (args: CardTargetSelectedPositionEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGET_SELECTED_POSITION,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			targetRow: args.targetRow.index,
			targetPosition: args.targetPosition,
		},
	}),
	cardTargetsConfirmed: (args: CardTargetsConfirmedEventArgs): GameEvent => ({
		type: GameEventType.CARD_TARGETS_CONFIRMED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringCard: args.triggeringCard?.id,
		},
	}),

	playerMulliganedCard: (args: PlayerTargetCardSelectedEventArgs): GameEvent => ({
		type: GameEventType.PLAYER_TARGET_SELECTED_CARD,
		args: args,
		logSubtype: 'mulligan',
		logVariables: {
			triggeringPlayer: args.triggeringPlayer.player.id,
			targetCard: args.targetCard.id,
		},
	}),

	unitCreated: (args: UnitCreatedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_CREATED,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
		},
	}),
	unitMoved: (args: UnitMovedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_MOVED,
		args: args,
		logSubtype: args.direction === MoveDirection.FORWARD ? 'forward' : args.direction === MoveDirection.BACK ? 'backward' : 'sameRow',
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			distance: args.distance,
			direction: args.direction,
		},
	}),
	unitIssuedOrderTargetingCard: (args: UnitOrderedCardEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_CARD,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetCard: args.targetArguments.targetCard.id,
		},
	}),
	unitIssuedOrderTargetingUnit: (args: UnitOrderedUnitEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_UNIT,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetCard: args.targetArguments.targetCard.id,
		},
	}),
	unitIssuedOrderTargetingRow: (args: UnitOrderedRowEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_ROW,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetRow: args.targetArguments.targetRow.index,
		},
	}),
	unitIssuedOrderTargetingPosition: (args: UnitOrderedPositionEventArgs): GameEvent => ({
		type: GameEventType.UNIT_ORDERED_POSITION,
		args: args,
		effectSource: args.triggeringUnit.card,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			targetRow: args.targetArguments.targetRow.index,
			targetPosition: args.targetArguments.targetPosition,
		},
	}),
	unitDestroyed: (args: UnitDestroyedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_DESTROYED,
		args: args,
		effectSource: args.triggeringCard,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
		},
	}),

	unitDeployed: (args: UnitDeployedEventArgs): GameEvent => ({
		type: GameEventType.UNIT_DEPLOYED,
		effectSource: args.triggeringUnit.card,
		args: args,
		logVariables: {
			triggeringUnit: args.triggeringUnit.card.id,
			owner: args.triggeringUnit.owner.player.id,
		},
	}),
	spellDeployed: (args: SpellDeployedEventArgs): GameEvent => ({
		type: GameEventType.SPELL_DEPLOYED,
		effectSource: args.triggeringCard,
		args: args,
		logVariables: {
			triggeringCard: args.triggeringCard.id,
			owner: args.triggeringCard.ownerInGame.player.id,
		},
	}),

	buffCreated: (args: BuffCreatedEventArgs): GameEvent => ({
		type: GameEventType.BUFF_CREATED,
		args: args,
		effectSource: args.triggeringBuff,
		logSubtype: args.triggeringBuff.source ? 'fromCard' : 'fromUniverse',
		logVariables: {
			triggeringBuff: args.triggeringBuff.id,
			ownerCard: args.triggeringBuff.card.id,
			sourceCard: args.triggeringBuff.source ? args.triggeringBuff.source.id : undefined,
		},
	}),
	buffRemoved: (args: BuffRemovedEventArgs): GameEvent => ({
		type: GameEventType.BUFF_REMOVED,
		args: args,
		effectSource: args.triggeringBuff,
		logVariables: {
			triggeringBuff: args.triggeringBuff.id,
			ownerCard: args.triggeringBuff.card.id,
		},
	}),

	turnEnded: (args: TurnEndedEventArgs): GameEvent => ({
		type: GameEventType.TURN_ENDED,
		args: args,
		logVariables: {
			player: args.player.player.id,
		},
	}),
	roundEnded: (args: RoundEndedEventArgs): GameEvent => ({
		type: GameEventType.ROUND_ENDED,
		args: args,
		logVariables: {
			player: args.player.player.id,
		},
	}),

	gameFinished: (args: GameFinishedEventArgs): GameEvent => ({
		type: GameEventType.GAME_FINISHED,
		args: args,
		logSubtype: args.victoriousPlayer ? 'victory' : 'draw',
		logVariables: {
			victoriousPlayer: args.victoriousPlayer?.player.id,
		},
	}),
}

export interface GameEvent {
	type: GameEventType
	args: Record<string, any>
	effectSource?: ServerCard | ServerBuff
	logSubtype?: string
	logVariables?: Record<string, string | number | undefined>
}

export interface GameStartedEventArgs {
	player: ServerPlayerInGame
}

export interface RoundStartedEventArgs {
	player: ServerPlayerInGame
}
export interface TurnStartedEventArgs {
	player: ServerPlayerInGame
}

export interface CardDrawnEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardPlayedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardPreResolvedEventArgs {
	triggeringCard: ServerCard
}
export interface CardResolvedEventArgs {
	triggeringCard: ServerCard
}
export interface CardTakesDamageEventArgs {
	triggeringCard: ServerCard
	damageInstance: ServerDamageInstance
	armorDamageInstance: ServerDamageInstance | null
	powerDamageInstance: ServerDamageInstance | null
}
export interface CardDiscardedEventArgs {
	owner: ServerPlayerInGame
	triggeringCard: ServerCard
}
export interface CardDestroyedEventArgs {
	triggeringCard: ServerCard
	formerOwner: ServerPlayerInGame
}

export interface CardTargetSelectedCardEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetCard: ServerCard
}
export interface CardTargetSelectedUnitEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetCard: ServerCard
	targetUnit: ServerUnit
}
export interface CardTargetSelectedRowEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetRow: ServerBoardRow
}
export interface CardTargetSelectedPositionEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
	targetRow: ServerBoardRow
	targetPosition: number
}
export interface CardTargetsConfirmedEventArgs {
	triggeringCard: ServerCard
	triggeringPlayer: ServerPlayerInGame
}

export interface PlayerTargetCardSelectedEventArgs {
	targetMode: TargetMode
	targetType: TargetType
	triggeringPlayer: ServerPlayerInGame
	targetCard: ServerCard
}

export interface UnitCreatedEventArgs {
	triggeringUnit: ServerUnit
}
export interface UnitMovedEventArgs {
	triggeringUnit: ServerUnit
	fromRow: ServerBoardRow
	fromIndex: number
	toRow: ServerBoardRow
	toIndex: number
	distance: number
	direction: MoveDirection
}
export interface UnitOrderedCardEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetCard: ServerCard
	targetArguments: ServerCardTargetCard
}
export interface UnitOrderedUnitEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetCard: ServerCard
	targetUnit: ServerUnit
	targetArguments: ServerCardTargetCard
}
export interface UnitOrderedRowEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetRow: ServerBoardRow
	targetArguments: ServerCardTargetRow
}
export interface UnitOrderedPositionEventArgs {
	triggeringUnit: ServerUnit
	targetType: TargetType
	targetRow: ServerBoardRow
	targetPosition: number
	targetArguments: ServerCardTargetPosition
}
export interface UnitDestroyedEventArgs {
	triggeringCard: ServerCard
	triggeringUnit: ServerUnit
}

export interface UnitDeployedEventArgs {
	triggeringUnit: ServerUnit
}
export interface SpellDeployedEventArgs {
	triggeringCard: ServerCard
}

export interface BuffCreatedEventArgs {
	triggeringBuff: ServerBuff
}
export interface BuffRemovedEventArgs {
	triggeringBuff: ServerBuff
}

export interface TurnEndedEventArgs {
	player: ServerPlayerInGame
}
export interface RoundEndedEventArgs {
	player: ServerPlayerInGame
}

export interface GameFinishedEventArgs {
	victoriousPlayer: ServerPlayerInGame | null
}
