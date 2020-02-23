import CardType from '../../../shared/enums/CardType'
import ServerCard from '../../../models/ServerCard'
import ServerGame from '../../../models/ServerGame'
import ServerCardOnBoard from '../../../models/ServerCardOnBoard'
import ServerDamageInstance from '../../../models/ServerDamageSource'
import ServerAnimation from '../../../models/ServerAnimation'
import CardColor from '../../../shared/enums/CardColor'

export default class HeroRider1Famine extends ServerCard {
	damage = 2

	constructor(game: ServerGame) {
		super(game, CardType.UNIT, CardColor.BRONZE)
		this.basePower = 10
		this.baseAttack = 4
		this.dynamicTextVariables = {
			damage: this.damage
		}
	}

	onPlayedAsUnit(thisUnit: ServerCardOnBoard): void {
		const allEnemyUnits = this.game.board.getUnitsOwnedByPlayer(thisUnit.owner.opponent)
		allEnemyUnits.forEach(unit => unit.dealDamage(ServerDamageInstance.fromUnit(this.damage, thisUnit)))
		this.game.animation.play(ServerAnimation.unitAttack(thisUnit, allEnemyUnits))
	}

	onUnitPlayTargetUnitSelected(thisUnit: ServerCardOnBoard, target: ServerCardOnBoard): void {
		target.dealDamage(ServerDamageInstance.fromUnit(1, thisUnit))
	}
}
