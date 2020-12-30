import ServerGame from './ServerGame'
import SimpleTargetDefinitionBuilder from './targetDefinitions/SimpleTargetDefinitionBuilder'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import ServerCardTarget, { ServerCardTargetCard, ServerCardTargetRow, ServerCardTargetUnit } from './ServerCardTarget'
import TargetDefinition from './targetDefinitions/TargetDefinition'
import TargetMode from '@shared/enums/TargetMode'
import TargetType, { CardTargetTypes } from '@shared/enums/TargetType'
import Utils from '../../utils/Utils'
import CardFeature from '@shared/enums/CardFeature'
import GameLibrary from '../libraries/CardLibrary'
import ServerCard from './ServerCard'

export class ServerCardTargeting {
	private readonly card: ServerCard
	private readonly game: ServerGame

	public cardPlayTargetDefinitions: SimpleTargetDefinitionBuilder[] = []
	public unitOrderTargetDefinitions: SimpleTargetDefinitionBuilder[] = []
	public deployEffectTargetDefinitions: SimpleTargetDefinitionBuilder[] = []

	constructor(card: ServerCard) {
		this.card = card
		this.game = card.game
	}

	public getValidCardPlayTargets(cardOwner: ServerPlayerInGame | null): ServerCardTargetRow[] {
		if (!cardOwner || cardOwner.unitMana < this.card.stats.unitCost || cardOwner.spellMana < this.card.stats.spellCost) {
			return []
		}

		let targetDefinitions = this.getCardPlayTargetDefinitions()
		if (targetDefinitions.length === 0) {
			targetDefinitions = [TargetDefinition.defaultCardPlayTarget(this.game).build()]
		}
		return targetDefinitions
			.map((targetDefinition) => {
				return this.getValidTargetsForRows(TargetMode.CARD_PLAY, targetDefinition)
			})
			.flat()
	}

	public getDeployEffectTargets(
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] {
		const targetDefinitions = this.getDeployEffectTargetDefinitions()
		return targetDefinitions
			.map((targetDefinition) => this.getDeployEffectTargetsForTargetDefinition(targetDefinition, previousTargets))
			.flat()
	}

	private getDeployEffectTargetsForTargetDefinition(
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] {
		if (targetDefinition.getTargetCount(this.card) === 0) {
			return []
		}

		let validTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []

		Utils.forEachInNumericEnum(TargetType, (targetType: TargetType) => {
			if (targetType === TargetType.BOARD_ROW) {
				validTargets = validTargets.concat(this.getValidTargetsForRows(TargetMode.DEPLOY_EFFECT, targetDefinition, previousTargets))
			} else if (targetType === TargetType.UNIT) {
				validTargets = validTargets.concat(this.getValidTargetsForUnits(TargetMode.DEPLOY_EFFECT, targetDefinition, previousTargets))
			} else {
				validTargets = validTargets.concat(
					this.getValidTargetsForCards(TargetMode.DEPLOY_EFFECT, targetType, targetDefinition, previousTargets)
				)
			}
		})
		return validTargets
	}

	public getValidTargetsForCards(
		targetMode: TargetMode,
		targetType: CardTargetTypes,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetCard[] {
		let targets: ServerCardTargetCard[] = []
		if (targetType === TargetType.CARD_IN_LIBRARY) {
			targets = this.getValidCardLibraryTargets(targetMode, targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_HAND) {
			targets = this.getValidUnitHandTargets(targetMode, targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_HAND) {
			targets = this.getValidSpellHandTargets(targetMode, targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_UNIT_DECK) {
			targets = this.getValidUnitDeckTargets(targetMode, targetDefinition, previousTargets)
		} else if (targetType === TargetType.CARD_IN_SPELL_DECK) {
			targets = this.getValidSpellDeckTargets(targetMode, targetDefinition, previousTargets)
		}

		return targets
	}

	public getValidTargetsForUnits(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetUnit[] {
		return this.getValidUnitTargets(targetMode, targetDefinition, previousTargets)
	}

	public getValidTargetsForRows(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetRow[] {
		return this.getValidRowTargets(targetMode, targetDefinition, previousTargets)
	}

	private isTargetLimitExceeded(
		targetMode: TargetMode,
		targetType: TargetType,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[]
	): boolean {
		if (previousTargets.length >= targetDefinition.getTargetCount(this.card)) {
			return true
		}

		const previousTargetsOfType = previousTargets.filter((target) => target.targetMode === targetMode && target.targetType === targetType)
		return previousTargetsOfType.length >= targetDefinition.getTargetOfTypeCount(this.card, targetMode, targetType)
	}

	private getValidUnitTargets(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetUnit[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.UNIT, targetDefinition, previousTargets)) {
			return []
		}

		const unitTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.UNIT)
		const args = {
			sourceCard: this.card,
			previousTargets: previousTargets,
		}

		return this.game.board
			.getAllUnits()
			.filter((unit) => !unit.card.features.includes(CardFeature.UNTARGETABLE))
			.filter((unit) => targetDefinition.require(targetMode, TargetType.UNIT, { ...args, targetCard: unit.card, targetUnit: unit }))
			.map((unit) => ({
				unit: unit,
				expectedValue: targetDefinition.evaluate(targetMode, TargetType.UNIT, { ...args, targetCard: unit.card, targetUnit: unit }),
			}))
			.map((tuple) => ({
				unit: tuple.unit,
				expectedValue: Math.max(
					tuple.expectedValue * tuple.unit.card.botEvaluation.threatMultiplier,
					tuple.unit.card.botEvaluation.baseThreat
				),
			}))
			.map((tuple) => ServerCardTarget.cardTargetUnit(targetMode, this.card, tuple.unit, tuple.expectedValue, unitTargetLabel))
	}

	private getValidRowTargets(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetRow[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.BOARD_ROW, targetDefinition, previousTargets)) {
			return []
		}

		const rowTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.BOARD_ROW)
		const args = {
			sourceCard: this.card,
			previousTargets: [],
		}

		return this.game.board.rows
			.filter((row) => targetDefinition.require(targetMode, TargetType.BOARD_ROW, { ...args, targetRow: row }))
			.map((targetRow) => ServerCardTarget.cardTargetRow(targetMode, this.card, targetRow, rowTargetLabel))
	}

	private getValidCardLibraryTargets(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetCard[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_LIBRARY, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_LIBRARY)

		return Utils.sortCards(
			GameLibrary.cards.filter((card) =>
				targetDefinition.require(targetMode, TargetType.CARD_IN_LIBRARY, {
					sourceCard: this.card,
					targetCard: card,
					previousTargets: previousTargets,
				})
			)
		).map((targetCard) => ServerCardTarget.cardTargetCardInLibrary(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidUnitHandTargets(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetCard[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_UNIT_HAND, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_UNIT_HAND)
		return Utils.sortCards(
			this.game.players
				.map((player) => player.cardHand.unitCards)
				.reduce((accumulator, cards) => accumulator.concat(cards))
				.filter((unit) => !unit.features.includes(CardFeature.UNTARGETABLE))
				.filter((card) =>
					targetDefinition.require(targetMode, TargetType.CARD_IN_UNIT_HAND, {
						sourceCard: this.card,
						targetCard: card,
						previousTargets: previousTargets,
					})
				)
		).map((targetCard) => ServerCardTarget.cardTargetCardInUnitHand(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidSpellHandTargets(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetCard[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_SPELL_HAND, targetDefinition, previousTargets)) {
			return []
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_SPELL_HAND)
		return Utils.sortCards(
			this.game.players
				.map((player) => player.cardHand.spellCards)
				.reduce((accumulator, cards) => accumulator.concat(cards))
				.filter((unit) => !unit.features.includes(CardFeature.UNTARGETABLE))
				.filter((card) =>
					targetDefinition.require(targetMode, TargetType.CARD_IN_SPELL_HAND, {
						sourceCard: this.card,
						targetCard: card,
						previousTargets: previousTargets,
					})
				)
		).map((targetCard) => ServerCardTarget.cardTargetCardInSpellHand(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidUnitDeckTargets(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetCard[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_UNIT_DECK, targetDefinition, previousTargets)) {
			return []
		}

		let targetedCards = this.game.players
			.map((player) => player.cardDeck.unitCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter((card) =>
				targetDefinition.require(targetMode, TargetType.CARD_IN_UNIT_DECK, {
					sourceCard: this.card,
					targetCard: card,
					previousTargets: previousTargets,
				})
			)

		if (!targetDefinition.shouldPreventSorting()) {
			targetedCards = Utils.sortCards(targetedCards)
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_UNIT_DECK)
		return targetedCards.map((targetCard) => ServerCardTarget.cardTargetCardInUnitDeck(targetMode, this.card, targetCard, cardTargetLabel))
	}

	private getValidSpellDeckTargets(
		targetMode: TargetMode,
		targetDefinition: TargetDefinition,
		previousTargets: (ServerCardTargetCard | ServerCardTargetUnit | ServerCardTargetRow)[] = []
	): ServerCardTargetCard[] {
		if (this.isTargetLimitExceeded(targetMode, TargetType.CARD_IN_SPELL_DECK, targetDefinition, previousTargets)) {
			return []
		}

		let targetedCards = this.game.players
			.map((player) => player.cardDeck.spellCards)
			.reduce((accumulator, cards) => accumulator.concat(cards))
			.filter((card) =>
				targetDefinition.require(targetMode, TargetType.CARD_IN_SPELL_DECK, {
					sourceCard: this.card,
					targetCard: card,
					previousTargets: previousTargets,
				})
			)

		if (!targetDefinition.shouldPreventSorting()) {
			targetedCards = Utils.sortCards(targetedCards)
		}

		const cardTargetLabel = targetDefinition.getOrderLabel(targetMode, TargetType.CARD_IN_SPELL_DECK)
		return targetedCards.map((targetCard) => ServerCardTarget.cardTargetCardInSpellDeck(targetMode, this.card, targetCard, cardTargetLabel))
	}

	public getCardPlayTargetDefinitions(): TargetDefinition[] {
		return this.cardPlayTargetDefinitions.map((targetDefinition) => {
			let clone = targetDefinition.commit().clone()
			this.card.buffs.buffs.forEach((buff) => {
				clone = clone.merge(buff.definePlayValidTargetsMod())
				clone = buff.definePlayValidTargetsOverride(clone)
			})
			return clone.build()
		})
	}

	public getUnitOrderTargetDefinitions(): TargetDefinition[] {
		return this.unitOrderTargetDefinitions.map((targetDefinition) => {
			let clone = targetDefinition.commit().clone()
			this.card.buffs.buffs.forEach((buff) => {
				clone = clone.merge(buff.defineValidOrderTargetsMod())
				clone = buff.defineValidOrderTargetsOverride(clone)
			})
			return clone.build()
		})
	}

	public getDeployEffectTargetDefinitions(): TargetDefinition[] {
		return this.deployEffectTargetDefinitions.map((targetDefinition) => {
			let clone = targetDefinition.commit().clone()
			this.card.buffs.buffs.forEach((buff) => {
				clone = clone.merge(buff.definePostPlayRequiredTargetsMod())
				clone = buff.definePostPlayRequiredTargetsOverride(clone)
			})
			return clone.build()
		})
	}
}
