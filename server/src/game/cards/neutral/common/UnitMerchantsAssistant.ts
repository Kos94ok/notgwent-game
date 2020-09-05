import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import BuffNextSpellDiscount from '../../../buffs/BuffNextSpellDiscount'
import BuffDuration from '@shared/enums/BuffDuration'
import BuffNextSpellDiscountAura from '../../../buffs/BuffNextSpellDiscountAura'
import CardFeature from '@shared/enums/CardFeature'
import Utils from '../../../../utils/Utils'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class UnitMerchantsAssistant extends ServerCard {
	spellDiscount = 3

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			tribes: [CardTribe.HUMAN],
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 5,
			},
			expansionSet: ExpansionSet.BASE,
		})
		this.dynamicTextVariables = {
			spellDiscount: this.spellDiscount
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED)
			.perform(() => this.onDeploy())
	}

	private onDeploy() {
		const player = this.owner
		const alliedSpells = Utils.sortCards(player.cardHand.spellCards)
		this.owner.leader.buffs.addMultiple(BuffNextSpellDiscountAura, this.spellDiscount, this, BuffDuration.INFINITY)
		alliedSpells.forEach(spell => spell.buffs.addMultiple(BuffNextSpellDiscount, this.spellDiscount, this, BuffDuration.INFINITY))
	}
}
