import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardFaction from '@shared/enums/CardFaction'
import ExpansionSet from '@shared/enums/ExpansionSet'
import BuffProtector from '../../../buffs/BuffProtector'

export default class UnitLabyrinthLostShieldbearer extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			stats: {
				power: 7,
				armor: 3,
			},
			expansionSet: ExpansionSet.LABYRINTH,
		})

		this.buffs.add(BuffProtector, this)
	}
}
