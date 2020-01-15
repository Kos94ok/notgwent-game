import Core from '@/Pixi/Core'
import Card from '@/shared/models/Card'
import CardOnBoard from '@/shared/models/CardOnBoard'
import RenderedCard from '@/Pixi/models/RenderedCard'
import ClientPlayerInGame from '@/Pixi/models/ClientPlayerInGame'
import CardOnBoardMessage from '@/shared/models/CardOnBoardMessage'

export default class RenderedCardOnBoard extends CardOnBoard {
	card: RenderedCard
	owner: ClientPlayerInGame
	preferredAttackTarget: CardOnBoard | null

	constructor(card: RenderedCard, owner: ClientPlayerInGame) {
		super(card, owner)
		this.card = card
		this.owner = owner
		this.preferredAttackTarget = null
	}

	public setPower(value: number): void {
		this.card.setPower(value)
	}

	public setAttack(value: number): void {
		this.card.setAttack(value)
	}

	public static fromMessage(message: CardOnBoardMessage): RenderedCardOnBoard {
		const card = Card.fromMessage(message.card)
		const renderedCard = RenderedCard.fromCard(card)
		const owner = Core.getPlayer(message.owner.id)
		return new RenderedCardOnBoard(renderedCard, owner)
	}
}
