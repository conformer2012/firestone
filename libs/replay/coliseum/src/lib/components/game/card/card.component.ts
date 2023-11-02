import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardClass, CardType, GameTag, ReferenceCard } from '@firestone-hs/reference-data';
import { AllCardsService, Entity } from '@firestone-hs/replay-parser';
import { GameConfService } from '../../../services/game-conf.service';

@Component({
	selector: 'card',
	styleUrls: ['./card.component.scss'],
	template: `
		<div
			class="card"
			[ngClass]="{ highlight: _option }"
			cardResize
			cardTooltip
			[tooltipEntity]="_entity"
			[tooltipControllerEntity]="_controller"
			[hasTooltip]="_showCard && _hasTooltip"
			[attr.data-entity-id]="!forbiddenTargetSource && _entity.id"
		>
			<cl-card-art [cardId]="cardId" [cardType]="cardType"></cl-card-art>
			<cl-card-frame [cardId]="cardId" [premium]="premium" *ngIf="cardId"></cl-card-frame>
			<cl-card-rarity [cardId]="cardId" *ngIf="cardId"></cl-card-rarity>
			<cl-card-name [cardId]="cardId" *ngIf="cardId"></cl-card-name>
			<cl-card-text *ngIf="cardId" [entity]="_entity" [controller]="_controller" [cardType]="cardType">
			</cl-card-text>
			<cl-card-race *ngIf="race" [race]="race"> </cl-card-race>
			<cl-card-cost *ngIf="cardId && !tavernTier" [cardType]="cardType" [cardId]="cardId" [cost]="cost">
			</cl-card-cost>
			<cl-tavern-level-icon *ngIf="tavernTier ?? 0 > 0" [level]="tavernTier"></cl-tavern-level-icon>
			<card-stats
				*ngIf="cardId"
				[cardId]="cardId"
				[attack]="attack"
				[health]="health"
				[damage]="damage"
				[durability]="durability"
				[armor]="armor"
			>
			</card-stats>
			<cl-overlay-crossed *ngIf="_crossed"></cl-overlay-crossed>
			<cl-overlay-burned *ngIf="_burned"></cl-overlay-burned>
			<cl-overlay-ticked *ngIf="_ticked"></cl-overlay-ticked>
			<cl-card-enchantments *ngIf="_enchantments && _enchantments.length > 0" [enchantments]="_enchantments">
			</cl-card-enchantments>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardComponent {
	_entity: Entity;
	_showCard = true;
	_controller: Entity | undefined;
	_option: boolean;
	_crossed: boolean;
	_burned: boolean;
	_ticked: boolean;
	_enchantments: readonly Entity[];

	cardId: string | undefined;
	cardType: CardType | undefined;
	cardClass: CardClass | undefined;
	originalCard: ReferenceCard | undefined;
	premium: boolean | undefined;
	attack: number | undefined;
	health: number | undefined;
	damage: number | undefined;
	durability: number | undefined;
	armor: number | undefined;
	cost: number | undefined;
	race: string | undefined;
	tavernTier: number | undefined;

	_forbiddenTargetSource = false;
	_hasTooltip = true;

	constructor(private cards: AllCardsService, private conf: GameConfService) {}

	@Input() set entity(entity: Entity) {
		// console.debug('[card] setting entity', entity);
		this._entity = entity;
		this.updateEntityGroups();
	}

	@Input() set showCard(value: boolean) {
		this._showCard = value;
		this.updateEntityGroups();
	}

	@Input() set controller(value: Entity | undefined) {
		// console.debug('[card] setting controller', value);
		this._controller = value;
	}

	@Input() set hasTooltip(hasTooltip: boolean) {
		this._hasTooltip = hasTooltip;
	}

	@Input() set forbiddenTargetSource(value: boolean) {
		this._forbiddenTargetSource = value;
	}

	@Input() set option(value: boolean) {
		this._option = value;
	}

	@Input() set crossed(value: boolean) {
		this._crossed = value;
		if (value) {
			// console.debug('[card] marking card as crossed', this._entity);
		}
	}

	@Input() set burned(value: boolean) {
		this._burned = value;
		if (value) {
			// console.debug('[card] marking card as burned', this._entity);
		}
	}

	@Input() set ticked(value: boolean) {
		this._ticked = value;
		if (value) {
			// console.debug('[card] marking card as ticked', this._entity);
		}
	}

	@Input() set enchantments(value: readonly Entity[]) {
		this._enchantments = value;
	}

	private updateEntityGroups() {
		if (!this._showCard) {
			this.cardId = undefined;
			this.premium = undefined;
			this.attack = undefined;
			this.health = undefined;
			this.damage = undefined;
			this.durability = undefined;
			this.armor = undefined;
			this.cost = undefined;
			this.originalCard = undefined;
			this.race = undefined;
			this.cardType = undefined;
			this.cardClass = undefined;
			return;
		}
		this.cardId = this._entity.cardID;
		if (this.cardId) {
			this.premium = this._entity.getTag(GameTag.PREMIUM) === 1;
			this.attack = this._entity.getTag(GameTag.ATK);
			this.health = this._entity.getTag(GameTag.HEALTH);
			this.damage = this._entity.getTag(GameTag.DAMAGE);
			this.durability = this._entity.getTag(GameTag.DURABILITY);
			this.armor = this._entity.getTag(GameTag.ARMOR);
			this.cost = this._entity.getTag(GameTag.COST);
			this.originalCard = this.cards.getCard(this.cardId);
			this.race = this.originalCard?.race?.toLowerCase();
			this.cardType =
				this.originalCard && this.originalCard.type
					? CardType[this.originalCard.type.toUpperCase() as string]
					: undefined;
			this.cardClass = this.originalCard?.classes?.length ? CardClass[this.originalCard.classes[0]] : undefined;
			this.tavernTier = this.conf.isBattlegrounds() ? this._entity.getTag(GameTag.TECH_LEVEL) : 0;
		}
	}
}
