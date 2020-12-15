import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import SpellSteelSpark from './SpellSteelSpark'
import SpellFireball from './SpellFireball'
import SpellReinforcements from '../../../00-human/leaders/Maximilian/SpellReinforcements'
import SpellAnEncouragement from './SpellAnEncouragement'
import ExpansionSet from '@shared/enums/ExpansionSet'
import SpellEternalServitude from './SpellEternalServitude'

export default class LeaderVelElleron extends ServerCard {
	manaPerRound = 10

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.LEADER,
			faction: CardFaction.ARCANE,
			sortPriority: 0,
			expansionSet: ExpansionSet.BASE,
			deckAddedCards: [SpellSteelSpark, SpellAnEncouragement, SpellFireball, SpellEternalServitude]
		})
		this.dynamicTextVariables = {
			manaPerRound: this.manaPerRound
		}
	}
}
