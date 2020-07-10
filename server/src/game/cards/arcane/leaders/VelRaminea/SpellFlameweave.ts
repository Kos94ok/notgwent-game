import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerPlayerInGame from '../../../../players/ServerPlayerInGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import BuffVelRamineaWeave from '../../../../buffs/BuffVelRamineaWeave'
import BuffDuration from '@shared/enums/BuffDuration'
import CardLocation from '@shared/enums/CardLocation'
import GameEvent from '../../../../models/GameEvent'

export default class SpellFlameweave extends ServerCard {
	constructor(game: ServerGame) {
		super(game, CardType.SPELL, CardColor.GOLDEN, CardFaction.ARCANE)

		this.basePower = 1
		this.baseFeatures = [CardFeature.HERO_POWER]
		this.dynamicTextVariables = {
			currentStacks: () => this.currentStacks
		}

		this.createCallback(GameEvent.EFFECT_SPELL_PLAY)
			.perform(() => {
				this.owner.leader.buffs.add(BuffVelRamineaWeave, this, BuffDuration.INFINITY)
			})
	}

	get currentStacks(): number {
		return this.game.getTotalBuffIntensityForPlayer(BuffVelRamineaWeave, this.owner, [CardLocation.LEADER])
	}
}
