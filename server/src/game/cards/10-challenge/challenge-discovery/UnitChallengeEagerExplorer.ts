import CardType from '@shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import TargetType from '@shared/enums/TargetType'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import Keywords from '../../../../utils/Keywords'
import CardLibrary from '../../../libraries/CardLibrary'
import Utils from '../../../../utils/Utils'

export default class UnitChallengeEagerExplorer extends ServerCard {
	exploredCards: ServerCard[] = []
	cardsToExplore = 4

	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.BRONZE,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY, CardFeature.KEYWORD_CREATE],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.BASE,
			hiddenFromLibrary: true,
		})
		this.dynamicTextVariables = {
			cardsToExplore: this.cardsToExplore,
		}

		this.createEffect(GameEventType.UNIT_DEPLOYED).perform(() => this.onDeploy())

		this.createDeployTargets(TargetType.CARD_IN_LIBRARY)
			.require((args) => args.targetCard.color === CardColor.BRONZE)
			.require(({ targetCard }) => this.exploredCards.includes(targetCard))

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD).perform(({ targetCard }) => this.onTargetSelected(targetCard))
	}

	private onDeploy(): void {
		const commonCards = CardLibrary.cards
			.filter((card) => card.color === CardColor.BRONZE)
			.filter((card) => card.isCollectible)
			.slice()
		this.exploredCards = Utils.shuffle(commonCards).slice(0, this.cardsToExplore)
	}

	private onTargetSelected(target: ServerCard): void {
		Keywords.createCard.for(this.ownerInGame).fromInstance(target)
		this.exploredCards = []
	}
}
