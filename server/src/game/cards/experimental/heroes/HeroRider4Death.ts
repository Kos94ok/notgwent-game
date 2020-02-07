import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerOwnedCard from '../../../models/ServerOwnedCard'

export default class heroRider4Death extends ServerCard {
	powerThreshold = 10

	constructor(game: ServerGame) {
		super(game, CardType.UNIT)
		this.basePower = 25
		this.baseAttack = 4
		this.cardTextVariables = {
			powerThreshold: this.powerThreshold
		}
	}

	onPlayUnit(thisUnit: ServerCardOnBoard): void {
		const deck = thisUnit.owner.cardDeck
		const rider = deck.findCardByClass('heroRider3War')
		if (rider) {
			this.game.cardPlay.forcedPlayCardFromDeck(new ServerOwnedCard(rider, thisUnit.owner), thisUnit.rowIndex, thisUnit.unitIndex)
		}

		const allUnits = this.game.board.getAllUnits()
		const unitsToDestroy = allUnits.filter(unit => unit.card.power <= this.powerThreshold)
		unitsToDestroy.forEach(unit => unit.destroy())
	}
}
