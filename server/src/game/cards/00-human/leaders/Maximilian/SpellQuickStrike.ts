import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import ServerUnit from '../../../../models/ServerUnit'
import ServerDamageInstance from '../../../../models/ServerDamageSource'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import { CardTargetValidatorArguments } from '../../../../../types/TargetValidatorArguments'
import ExpansionSet from '@shared/enums/ExpansionSet'
import { asDirectSpellDamage } from '../../../../../utils/LeaderStats'

export default class SpellQuickStrike extends ServerCard {
	baseDamage = asDirectSpellDamage(2)

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.HUMAN,
			features: [CardFeature.HERO_POWER],
			stats: {
				cost: 1,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			damage: this.baseDamage,
		}

		this.createDeployTargeting(TargetType.UNIT)
			.requireEnemy()
			.evaluate((args) => this.evaluateTarget(args))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_UNIT).perform(({ targetUnit }) => this.onTargetSelected(targetUnit))
	}

	private onTargetSelected(target: ServerUnit): void {
		target.dealDamage(ServerDamageInstance.fromCard(this.baseDamage, this))
	}

	private evaluateTarget(args: CardTargetValidatorArguments): number {
		const target = args.targetCard
		return Math.min(target.stats.power, this.baseDamage(this))
	}
}
