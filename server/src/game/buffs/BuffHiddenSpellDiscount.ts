import ServerBuff from '../models/ServerBuff'
import BuffStackType from '@shared/enums/BuffStackType'
import ServerGame from '../models/ServerGame'
import BuffAlignment from '@shared/enums/BuffAlignment'
import BuffFeature from '@shared/enums/BuffFeature'

export default class BuffHiddenSpellDiscount extends ServerBuff {
	constructor(game: ServerGame) {
		super(game, BuffStackType.ADD_INTENSITY)
		this.alignment = BuffAlignment.POSITIVE
		this.buffFeatures = [BuffFeature.SKIP_ANIMATION]
	}

	getSpellCostOverride(baseCost: number): number {
		return baseCost - this.intensity
	}
}
