import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerTargetDefinition from '../../../models/targetDefinitions/ServerTargetDefinition'
import TargetMode from '../../../shared/enums/TargetMode'
import TargetType from '../../../shared/enums/TargetType'
import TargetDefinitionBuilder from '../../../models/targetDefinitions/TargetDefinitionBuilder'

export default class UnitSpinningBarbarian extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 21
		this.baseAttack = 4
	}

	defineValidOrderTargets(): TargetDefinitionBuilder {
		return ServerTargetDefinition.defaultUnitOrder(this.game)
			.disallowType(TargetMode.ORDER_ATTACK, TargetType.UNIT)
			.allow(TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW)
			.validate(TargetMode.ORDER_ATTACK, TargetType.BOARD_ROW, args => {
				const thisUnit = args.thisUnit
				const targetRow = args.targetRow!
				return targetRow.owner === this.game.getOpponent(thisUnit.owner) && targetRow.cards.length > 0 && Math.abs(thisUnit.rowIndex - targetRow.index) <= thisUnit.card.attackRange
			})
			.validate(TargetMode.ATTACK, TargetType.UNIT, args => {
				const thisUnit = args.thisUnit
				const targetRow = args.targetRow!
				const targetUnit = args.targetUnit!
				const targetsByDistance = targetRow.cards.slice().sort((a, b) => this.game.board.getHorizontalUnitDistance(a, thisUnit) - this.game.board.getHorizontalUnitDistance(b, thisUnit))
				const closestTargets = targetsByDistance.filter(target => this.game.board.getHorizontalUnitDistance(target, thisUnit) <= 1.5)
				return closestTargets.includes(targetUnit)
			})
	}
}
