import CardType from '@shared/enums/CardType'
import CardColor from '@shared/enums/CardColor'
import CardFaction from '@shared/enums/CardFaction'
import GameEventType from '@shared/enums/GameEventType'
import CardFeature from '@shared/enums/CardFeature'
import ExpansionSet from '@shared/enums/ExpansionSet'
import TargetType from '@shared/enums/TargetType'

import ServerPlayerInGame from '@src/game/players/ServerPlayerInGame'
import ServerAnimation from '@src/game/models/ServerAnimation'
import ServerCard from '@src/game/models/ServerCard'
import ServerGame from '@src/game/models/ServerGame'

export default class HeroJealous extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.UNIT,
			color: CardColor.GOLDEN,
			faction: CardFaction.NEUTRAL,
			features: [CardFeature.KEYWORD_DEPLOY],
			stats: {
				power: 1,
			},
			expansionSet: ExpansionSet.BASE,
			isExperimental: true,
		})

		this.createDeployEffectTargets()
			.totalTargets(1)
			.target(TargetType.CARD_IN_LIBRARY)
			.require(TargetType.CARD_IN_LIBRARY, ({ targetCard }) => targetCard.type === CardType.UNIT)

		this.createEffect(GameEventType.CARD_TARGET_SELECTED_CARD)
			.perform(({ targetCard }) => this.onTargetSelected(targetCard))
			
		// TODO On death: remove from game
	}

	private onTargetSelected(target: ServerCard): void {
		let affected: ServerCard[] = []
		this.game.players.forEach((player) => affected.concat(discardCopiesFromHand(target, player)))
		this.game.animation.play(ServerAnimation.cardAffectsCards(this, affected))
	}
}

function discardCopiesFromHand(target: ServerCard, player: ServerPlayerInGame): ServerCard[] {
	const toDiscardHand: ServerCard[] = player.cardHand.unitCards.filter((card) => card.class === target.class)
	toDiscardHand.forEach((card) => player.cardHand.discardCard(card))
	player.drawUnitCards(toDiscardHand.length)
	return toDiscardHand
}
