import uuidv4 from 'uuid/v4'
import Card from '@shared/models/Card'
import CardType from '@shared/enums/CardType'
import ServerGame from './ServerGame'
import ServerUnit from './ServerUnit'
import ServerPlayerInGame from '../players/ServerPlayerInGame'
import OutgoingMessageHandlers from '../handlers/OutgoingMessageHandlers'
import ServerDamageInstance from './ServerDamageSource'
import TargetMode from '@shared/enums/TargetMode'
import CardColor from '@shared/enums/CardColor'
import ServerBuffContainer from './ServerBuffContainer'
import ServerRichTextVariables from './ServerRichTextVariables'
import RichTextVariables from '@shared/models/RichTextVariables'
import CardLibrary, {CardConstructor} from '../libraries/CardLibrary'
import CardFeature from '@shared/enums/CardFeature'
import CardTribe from '@shared/enums/CardTribe'
import CardFaction from '@shared/enums/CardFaction'
import CardLocation from '@shared/enums/CardLocation'
import GameHookType, {CardDestroyedHookArgs, CardDestroyedHookValues, CardTakesDamageHookArgs, CardTakesDamageHookValues} from './GameHookType'
import {EventCallback, EventHook} from './ServerGameEvents'
import GameEventType from '@shared/enums/GameEventType'
import GameEventCreators, {CardTakesDamageEventArgs} from './GameEventCreators'
import BotCardEvaluation from '../AI/BotCardEvaluation'
import Utils, {getClassFromConstructor} from '../../utils/Utils'
import ServerAnimation from './ServerAnimation'
import RelatedCardsDefinition from './RelatedCardsDefinition'
import ServerCardStats from './ServerCardStats'
import ExpansionSet from '@shared/enums/ExpansionSet'
import SimpleTargetDefinitionBuilder from './targetDefinitions/SimpleTargetDefinitionBuilder'
import {ServerCardTargeting} from './ServerCardTargeting'
import TargetType from '@shared/enums/TargetType'

interface ServerCardBaseProps {
	faction: CardFaction
	tribes?: CardTribe | CardTribe[]
	features?: CardFeature | CardFeature[]
	relatedCards?: CardConstructor | CardConstructor[]
	sortPriority?: number
	expansionSet: ExpansionSet
	isExperimental?: boolean
	generatedArtworkMagicString?: string
	deckAddedCards?: CardConstructor[]
}

interface ServerCardLeaderProps extends ServerCardBaseProps {
	color: CardColor.LEADER
	isCollectible?: boolean
}

interface ServerCardUnitProps extends ServerCardBaseProps{
	type: CardType.UNIT
	color: CardColor.GOLDEN | CardColor.SILVER | CardColor.BRONZE | CardColor.TOKEN
	stats: {
		power: number
		armor?: number
	}
	isCollectible?: boolean
}

interface ServerCardSpellProps extends ServerCardBaseProps {
	type: CardType.SPELL
	color: CardColor.GOLDEN | CardColor.SILVER | CardColor.BRONZE | CardColor.TOKEN
	stats: {
		cost: number
	}
}

export type ServerCardProps = ServerCardLeaderProps | ServerCardUnitProps | ServerCardSpellProps

export default class ServerCard implements Card {
	public readonly id: string = uuidv4()
	public readonly game: ServerGame
	public readonly targeting: ServerCardTargeting

	public readonly type: CardType
	public readonly class: string
	public readonly color: CardColor
	public readonly faction: CardFaction

	public readonly name: string
	public readonly title: string
	public readonly flavor: string
	public readonly description: string

	public readonly stats: ServerCardStats
	public readonly buffs: ServerBuffContainer = new ServerBuffContainer(this)
	public readonly baseTribes: CardTribe[]
	public readonly baseFeatures: CardFeature[]
	public readonly sortPriority: number
	public readonly expansionSet: ExpansionSet

	public readonly isCollectible: boolean
	public readonly isExperimental: boolean

	public dynamicTextVariables: ServerRichTextVariables = {}
	public botEvaluation: BotCardEvaluation = new BotCardEvaluation(this)
	public readonly generatedArtworkMagicString: string

	public readonly baseRelatedCards: CardConstructor[] = []
	public readonly customRelatedCards: RelatedCardsDefinition[] = []

	public isRevealed = false
	public isDead = false

	public readonly deckAddedCards: CardConstructor[] = []

	constructor(game: ServerGame, props: ServerCardProps) {
		this.game = game
		this.targeting = new ServerCardTargeting(this)
		this.class = getClassFromConstructor(this.constructor as CardConstructor)

		this.type = props.color === CardColor.LEADER ? CardType.UNIT : props.type
		this.color = props.color
		this.faction = props.faction

		this.stats = new ServerCardStats(this, {
			basePower: props.color !== CardColor.LEADER && props.type === CardType.UNIT ? props.stats.power || 0 : 0,
			baseArmor: props.color !== CardColor.LEADER && props.type === CardType.UNIT ? props.stats.armor || 0 : 0,
			baseSpellCost: props.color !== CardColor.LEADER && props.type === CardType.SPELL ? props.stats.cost || 0 : 0
		})

		this.name = `card.${this.class}.name`
		this.title = `card.${this.class}.title`
		this.flavor = `card.${this.class}.flavor`
		this.description = `card.${this.class}.description`

		if (props.tribes === undefined) {
			this.baseTribes = []
		} else if (typeof(props.tribes) === 'object') {
			this.baseTribes = props.tribes
		} else {
			this.baseTribes = [props.tribes]
		}

		if (props.features === undefined) {
			this.baseFeatures = []
		} else if (typeof(props.features) === 'object') {
			this.baseFeatures = props.features
		} else {
			this.baseFeatures = [props.features]
		}

		if (props.relatedCards === undefined) {
			this.baseRelatedCards = []
		} else if (typeof(props.relatedCards) === 'object') {
			this.baseRelatedCards = props.relatedCards
		} else {
			this.baseRelatedCards = [props.relatedCards]
		}
		this.sortPriority = props.sortPriority ? props.sortPriority : 0
		this.expansionSet = props.expansionSet

		this.isCollectible = props.color !== CardColor.LEADER && props.type === CardType.UNIT && props.isCollectible !== undefined ? props.isCollectible : false
		this.isExperimental = props.isExperimental !== undefined ? props.isExperimental : false

		this.generatedArtworkMagicString = props.generatedArtworkMagicString ? props.generatedArtworkMagicString : ''

		this.deckAddedCards = props.deckAddedCards || []

		if (!this.game) {
			return
		}

		const validLocations = [CardLocation.BOARD, CardLocation.HAND, CardLocation.GRAVEYARD, CardLocation.DECK]
		this.createCallback<CardTakesDamageEventArgs>(GameEventType.CARD_TAKES_DAMAGE, validLocations)
			.forceIgnoreControlEffects()
			.require(({ triggeringCard }) => triggeringCard === this)
			.require(({ triggeringCard }) => triggeringCard.stats.power <= 0)
			.require(({ triggeringCard, powerDamageInstance }) => (powerDamageInstance && powerDamageInstance.value > 0) || triggeringCard.stats.armor === 0)
			.perform(() => this.destroy())
	}

	public get tribes(): CardTribe[] {
		let tribes = this.baseTribes.slice()
		this.buffs.buffs.forEach(buff => {
			tribes = tribes.concat(buff.cardTribes.slice())
		})
		return tribes
	}

	public get features(): CardFeature[] {
		let features = this.baseFeatures.slice()
		this.buffs.buffs.forEach(buff => {
			features = features.concat(buff.cardFeatures.slice())
		})
		return features
	}

	public get variables(): RichTextVariables {
		const evaluatedVariables: RichTextVariables = {}
		Object.keys(this.dynamicTextVariables).forEach(key => {
			const value = this.dynamicTextVariables[key]
			if (typeof(value) === 'function') {
				evaluatedVariables[key] = value()
			} else {
				evaluatedVariables[key] = value
			}
		})
		return evaluatedVariables
	}

	public get unit(): ServerUnit | null {
		return this.game.board.findUnitById(this.id)
	}

	public get owner(): ServerPlayerInGame | null {
		const thisCardInGame = this.game.findOwnedCardById(this.id)
		return thisCardInGame ? thisCardInGame.owner : null
	}

	public get location(): CardLocation {
		const owner = this.owner
		if (!owner) {
			return CardLocation.UNKNOWN
		}

		if (owner.leader === this) {
			return CardLocation.LEADER
		}
		const cardInDeck = owner.cardDeck.findCardById(this.id)
		if (cardInDeck) {
			return CardLocation.DECK
		}
		const cardInHand = owner.cardHand.findCardById(this.id)
		if (cardInHand) {
			return CardLocation.HAND
		}
		const cardInStack = this.game.cardPlay.cardResolveStack.findCardById(this.id)
		if (cardInStack) {
			return CardLocation.STACK
		}
		const cardOnBoard = this.game.board.findUnitById(this.id)
		if (cardOnBoard) {
			return CardLocation.BOARD
		}
		const cardInGraveyard = owner.cardGraveyard.findCardById(this.id)
		if (cardInGraveyard) {
			return CardLocation.GRAVEYARD
		}
		return CardLocation.UNKNOWN
	}

	public get relatedCards(): string[] {
		const customRelatedCards = Utils.sortCards(
			this.customRelatedCards.map(relatedCardsDefinition =>
				CardLibrary.cards.filter(card => relatedCardsDefinition.conditions.every(condition => condition(card)))
			).flat())
			.map(obj => obj.class)

		return this.baseRelatedCards.map(obj => getClassFromConstructor(obj))
			.concat(this.deckAddedCards.map(obj => getClassFromConstructor(obj)))
			.concat(customRelatedCards)
	}

	public get deckPosition(): number {
		const owner = this.owner
		if (!owner) {
			return -1
		}
		return owner.cardDeck.getCardIndex(this)
	}

	public instanceOf(prototype: CardConstructor): boolean {
		const cardClass = prototype.name.substr(0, 1).toLowerCase() + prototype.name.substr(1)
		return this.class === cardClass
	}

	public dealDamage(originalDamageInstance: ServerDamageInstance): void {
		const hookValues = this.game.events.applyHooks<CardTakesDamageHookArgs, CardTakesDamageHookValues>(GameHookType.CARD_TAKES_DAMAGE, {
			targetCard: this,
			damageInstance: originalDamageInstance,
		})

		const { targetCard, damageInstance } = hookValues

		if (damageInstance.value <= 0) {
			return
		}

		if (damageInstance.sourceCard) {
			this.game.animation.play(ServerAnimation.cardAttacksCards(damageInstance.sourceCard, [this]))
			if (targetCard !== this) {
				this.game.animation.play(ServerAnimation.cardAttacksCards(this, [targetCard]))
			}
		} else {
			this.game.animation.play(ServerAnimation.universeAttacksCards([this]))
			if (targetCard !== this) {
				this.game.animation.play(ServerAnimation.cardAttacksCards(this, [targetCard]))
			}
		}

		let damageToDeal = damageInstance.value

		let armorDamageInstance: ServerDamageInstance | null = null
		if (targetCard.stats.armor > 0) {
			armorDamageInstance = damageInstance.clone()
			armorDamageInstance.value = Math.min(targetCard.stats.armor, damageToDeal)
			damageToDeal -= armorDamageInstance.value
		}

		let powerDamageInstance: ServerDamageInstance | null = null
		if (damageToDeal > 0) {
			powerDamageInstance = damageInstance.clone()
			powerDamageInstance.value = Math.min(targetCard.stats.power, damageToDeal)
		}

		if (armorDamageInstance) {
			targetCard.stats.armor = targetCard.stats.armor - armorDamageInstance.value
		}

		if (powerDamageInstance) {
			targetCard.stats.power = targetCard.stats.power - powerDamageInstance.value
		}

		this.game.events.postEvent(GameEventCreators.cardTakesDamage({
			triggeringCard: targetCard,
			damageInstance: damageInstance,
			armorDamageInstance: armorDamageInstance,
			powerDamageInstance: powerDamageInstance
		}))
	}

	heal(healingInstance: ServerDamageInstance): void {
		if (healingInstance.value <= 0) {
			return
		}

		if (healingInstance.sourceCard) {
			this.game.animation.play(ServerAnimation.cardHealsCards(healingInstance.sourceCard, [this]))
		} else {
			this.game.animation.play(ServerAnimation.universeHealsCards([this]))
		}
		this.stats.power = Math.min(this.stats.maxPower, this.stats.power + healingInstance.value)
	}

	/* Cleanse this card
	 * -------------------------
	 * Remove all active buffs from this card
	 */
	public cleanse(): void {
		this.buffs.removeAll()
	}

	/* Destroy this card / unit
	 * -------------------------
	 * If this card has associated unit on the board, the unit is destroyed instead and this method has no effect.
	 * Otherwise, the card is completely removed from the game (exiled).
	 */
	public destroy(): void {
		const unit = this.unit
		if (unit) {
			this.game.board.destroyUnit(unit)
			return
		}

		if (this.isDead) {
			return
		}

		this.isDead = true

		const hookValues = this.game.events.applyHooks<CardDestroyedHookValues, CardDestroyedHookArgs>(GameHookType.CARD_DESTROYED, {
			destructionPrevented: false
		}, {
			targetCard: this
		})

		if (hookValues.destructionPrevented) {
			this.stats.power = 0
			this.isDead = false
			return
		}

		this.game.events.postEvent(GameEventCreators.cardDestroyed({
			triggeringCard: this,
		}))

		const owner = this.owner
		const location = this.location
		if (location === CardLocation.HAND) {
			owner.cardHand.removeCard(this)
		} else if (location === CardLocation.DECK) {
			owner.cardDeck.removeCard(this)
		} else if (location === CardLocation.GRAVEYARD) {
			owner.cardGraveyard.removeCard(this)
		}
	}

	public reveal(): void {
		if (this.isRevealed) { return }

		this.isRevealed = true
		OutgoingMessageHandlers.notifyAboutOpponentCardRevealed(this.owner.opponent.player, this)
	}

	/* Create card play targets
	 * ------------------------
	 * Add a target definition specifying the available card play targets.
	 * Adding first target definition will override the default behaviour (units can be played to any allied row, spells can be played to any row).
	 *
	 * Multiple target definitions will be added as inclusive OR.
	 */
	protected createPlayTargets(): SimpleTargetDefinitionBuilder {
		const builder = SimpleTargetDefinitionBuilder.base(this.game, TargetMode.CARD_PLAY)
			.target(TargetType.BOARD_ROW)
			.require(TargetType.BOARD_ROW, ({ targetRow }) => !targetRow.isFull())
		this.targeting.cardPlayTargetDefinitions.push(builder)
		return builder
	}

	/* Create unit order targets
	 * -------------------------
	 * Add a target definition specifying the available unit order targets.
	 *
	 * Multiple target definitions will be added as inclusive OR.
	 */
	protected createUnitOrderTargets(): SimpleTargetDefinitionBuilder {
		const builder = SimpleTargetDefinitionBuilder.base(this.game, TargetMode.UNIT_ORDER)
		this.targeting.unitOrderTargetDefinitions.push(builder)
		return builder
	}

	/* Require deploy effect targets
	 * -----------------------------
	 * Add a target definition specifying the required deploy effect targets.
	 *
	 * Multiple target definitions will be added as inclusive OR.
	 */
	protected createDeployEffectTargets(): SimpleTargetDefinitionBuilder {
		const builder = SimpleTargetDefinitionBuilder.base(this.game, TargetMode.DEPLOY_EFFECT)
		this.targeting.deployEffectTargetDefinitions.push(builder)
		return builder
	}

	/* Subscribe to a game event
	 * -------------------------
	 * Create a callback for a global game event. By default, this callback will trigger regardless
	 * of which card has triggered the event or where the subscriber is located.
	 *
	 * Subscribers must **NOT** modify the event that triggered the callback. See `createHook` for
	 * event modifications.
	 *
	 * The callback will only trigger if the subscriber is located in one of the locations specified by `location` argument.
	 */
	protected createCallback<ArgsType>(eventType: GameEventType, location: CardLocation[]): EventCallback<ArgsType> {
		return this.game.events.createCallback<ArgsType>(this, eventType)
			.require(() => location.includes(this.location))
	}

	/* Subscribe to a game event triggered by this buff
	 * ------------------------------------------------
	 * `createEffect` is equivalent to `createCallback`, but it will only trigger when
	 * the `effectSource` is set to the subscriber.
	 */
	protected createEffect<ArgsType>(event: GameEventType): EventCallback<ArgsType> {
		return this.game.events.createCallback<ArgsType>(this, event)
			.require((args, rawEvent) => rawEvent.effectSource && rawEvent.effectSource === this)
	}

	/* Subscribe to a game hook
	 * ------------------------
	 * Game hooks are callbacks that allow the event to be modified. For example, using the
	 * `GameHookType.CARD_TAKES_DAMAGE` hook it is possible to increase or decrease the damage a card
	 * takes from any source.
	 *
	 * The hook will only trigger if the subscriber is located in one of the locations specified by `location` argument.
	 */
	protected createHook<HookValues, HookArgs>(hookType: GameHookType, location: CardLocation[]): EventHook<HookValues, HookArgs> {
		return this.game.events.createHook<HookValues, HookArgs>(this, hookType)
			.requireLocations(location)
	}

	protected addRelatedCards(): RelatedCardsDefinition {
		const relatedCardDefinition = new RelatedCardsDefinition()
		this.customRelatedCards.push(relatedCardDefinition)
		return relatedCardDefinition
	}
}
