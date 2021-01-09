import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import CardLibrary from '../../../libraries/CardLibrary'
import UnitTrainedHound from '../tokens/UnitTrainedHound'

export default class UnitElderHoundmaster extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.HUMAN,
			tribes: [CardTribe.PEASANT],
			features: [CardFeature.KEYWORD_DEPLOY],
			relatedCards: [UnitTrainedHound],
			stats: {
				power: 3,
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(({ triggeringUnit }) => {
			const unit = triggeringUnit
			const owner = unit.owner
			const makeHound = () => CardLibrary.instantiateByConstructor(this.game, UnitTrainedHound)
			this.game.animation.instantThread(() => {
				this.game.board.createUnit(makeHound(), unit.rowIndex, unit.unitIndex)
			})
			this.game.animation.instantThread(() => {
				this.game.board.createUnit(makeHound(), unit.rowIndex, unit.unitIndex + 1)
			})
		})
	}
}
