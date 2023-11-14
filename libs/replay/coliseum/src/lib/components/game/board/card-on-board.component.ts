import { animate, style, transition, trigger } from '@angular/animations';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CardClass, CardType, GameTag, ReferenceCard } from '@firestone-hs/reference-data';
import { AllCardsService, Entity } from '@firestone-hs/replay-parser';

@Component({
	selector: 'card-on-board',
	styleUrls: ['./card-on-board.component.scss'],
	template: `
		<div
			class="card-on-board"
			cardTooltip
			[tooltipEntity]="_entity"
			[tooltipEnchantments]="_enchantments"
			[attr.data-entity-id]="_entity.id"
		>
			<div
				class="main-card"
				[ngClass]="{ highlight: _option, 'in-recruit': isRecruitPhase, 'main-player': isMainPlayer }"
			>
				<cl-card-art [cardId]="cardId" [cardType]="cardType"></cl-card-art>
				<board-card-frame [taunt]="taunt" [hideStats]="hideStats" [premium]="premium" [cardType]="cardType">
				</board-card-frame>
				<board-card-stats
					*ngIf="!hideStats"
					[cardId]="cardId"
					[attack]="attack"
					[health]="health"
					[damage]="damage"
					[cardType]="cardType"
				>
				</board-card-stats>
			</div>
			<cl-damage *ngIf="shownDamage" [amount]="shownDamage"></cl-damage>
			<cl-sleeping *ngIf="sleeping"></cl-sleeping>
			<cl-power-indicator [entity]="_entity"></cl-power-indicator>
			<cl-card-on-board-overlays [entity]="_entity"></cl-card-on-board-overlays>
			<cl-tavern-level-icon
				*ngIf="!isMainPlayer && tavernTier > 0 && isRecruitPhase"
				[level]="tavernTier"
			></cl-tavern-level-icon>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
	animations: [
		trigger('fadeInOut', [
			transition(':enter', [style({ width: 0 }), animate(150, style({ width: '100%' }))]),
			transition(':leave', [style({ width: '100%' }), animate(150, style({ width: 0 }))]),
		]),
	],
	// eslint-disable-next-line @angular-eslint/no-host-metadata-property
	host: { '[@fadeInOut]': 'in' },
})
export class CardOnBoardComponent {
	_entity: Entity;
	_enchantments: readonly Entity[];
	_option: boolean;

	cardId: string;
	cardType: CardType;
	cardClass: CardClass;
	originalCard: ReferenceCard;
	premium: boolean;
	attack: number | undefined;
	health: number | undefined;
	damage: number | undefined;
	durability: number | undefined;
	armor: number | undefined;
	cost: number | undefined;
	taunt: boolean;
	shownDamage: number;
	hideStats: boolean;
	sleeping: boolean;
	tavernTier: number;

	constructor(private cards: AllCardsService) {}

	@Input() isMainPlayer: boolean;
	@Input() isRecruitPhase: boolean;

	@Input() set entity(entity: Entity) {
		// console.debug('[card-on-board] setting entity', entity.id, entity, entity.tags.toJS());

		this._entity = entity;

		this.cardId = entity.cardID;
		this.originalCard = this.cards.getCard(this.cardId);
		this.cardType =
			this.originalCard && this.originalCard.type
				? CardType[this.originalCard.type.toUpperCase() as string]
				: undefined;
		this.cardClass = this.originalCard?.classes?.length ? CardClass[this.originalCard.classes[0]] : undefined;

		this.premium = entity.getTag(GameTag.PREMIUM) === 1;
		this.attack = entity.getTag(GameTag.ATK);
		this.health = entity.getTag(GameTag.HEALTH);
		this.damage = entity.getTag(GameTag.DAMAGE);
		this.durability = entity.getTag(GameTag.DURABILITY);
		this.armor = entity.getTag(GameTag.ARMOR);
		this.cost = entity.getTag(GameTag.COST);

		this.taunt = entity.getTag(GameTag.TAUNT) === 1;

		this.shownDamage = entity.damageForThisAction;

		this.hideStats = entity.getTag(GameTag.HIDE_STATS) === 1;
		this.sleeping =
			entity.getTag(GameTag.EXHAUSTED) === 1 &&
			entity.getTag(GameTag.JUST_PLAYED) === 1 &&
			entity.getTag(GameTag.CHARGE) !== 1;
		this.tavernTier = entity.getTag(GameTag.TECH_LEVEL);
		// console.log('tavern tier', entity.id, this.tavernTier, entity.tags.toJS());
	}

	@Input() set option(value: boolean) {
		this._option = value;
	}

	@Input() set enchantments(value: readonly Entity[]) {
		// console.debug('[card-on-board] setting enchantments', value);
		this._enchantments = value;
	}
}
