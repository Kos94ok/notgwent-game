import CardType from '@shared/enums/CardType'
import ServerCard from '../../../../models/ServerCard'
import ServerGame from '../../../../models/ServerGame'
import CardColor from '@shared/enums/CardColor'
import CardFeature from '@shared/enums/CardFeature'
import CardFaction from '@shared/enums/CardFaction'
import TargetDefinitionBuilder from '../../../../models/targetDefinitions/TargetDefinitionBuilder'
import SimpleTargetDefinitionBuilder from '../../../../models/targetDefinitions/SimpleTargetDefinitionBuilder'
import TargetMode from '@shared/enums/TargetMode'
import TargetType from '@shared/enums/TargetType'
import ServerBoardRow from '../../../../models/ServerBoardRow'
import Constants from '@shared/Constants'
import CardLibrary from '../../../../libraries/CardLibrary'
import UnitVolatileCrystal from '../../tokens/UnitVolatileCrystal'
import {CardTargetSelectedEventArgs} from '../../../../models/GameEventCreators'
import GameEventType from '@shared/enums/GameEventType'
import ExpansionSet from '@shared/enums/ExpansionSet'

export default class SpellCrystalBarrage extends ServerCard {
	constructor(game: ServerGame) {
		super(game, {
			type: CardType.SPELL,
			color: CardColor.GOLDEN,
			faction: CardFaction.ARCANE,
			features: [CardFeature.HERO_POWER],
			relatedCards: [UnitVolatileCrystal],
			stats: {
				cost: 6
			},
			expansionSet: ExpansionSet.BASE,
		})

		this.createEffect<CardTargetSelectedEventArgs>(GameEventType.CARD_TARGET_SELECTED)
			.perform(({ targetRow }) => this.onTargetSelected(targetRow))
	}

	definePostPlayRequiredTargets(): TargetDefinitionBuilder {
		return SimpleTargetDefinitionBuilder.base(this.game, TargetMode.POST_PLAY_REQUIRED_TARGET)
			.singleTarget()
			.allow(TargetType.BOARD_ROW)
			.opponentsRow()
	}

	private onTargetSelected(target: ServerBoardRow): void {
		for (let i = 0; i <= target.cards.length; i += 2) {
			if (target.cards.length >= Constants.MAX_CARDS_PER_ROW) {
				break
			}

			const crystal = CardLibrary.instantiateByConstructor(this.game, UnitVolatileCrystal)
			this.game.board.createUnit(crystal, this.owner.opponent, target.index, i)
		}
	}
}
