/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { BgsCompAdvice } from '@firestone-hs/content-craetor-input';
import { Race, ReferenceCard } from '@firestone-hs/reference-data';
import { CardsFacadeService, ILocalizationService } from '@firestone/shared/framework/core';
import { ExtendedBgsCompAdvice } from './model';

export const buildCompositions = (
	availableTribes: readonly Race[],
	compositions: readonly BgsCompAdvice[],
	allCards: CardsFacadeService,
	i18n: ILocalizationService,
): readonly ExtendedBgsCompAdvice[] => {
	const result =
		compositions
			?.map((s) => enhanceComp(s, allCards))
			.filter((s) => isAvailable(s, availableTribes, allCards))
			.map((s) => trimComp(s, availableTribes, allCards))
			.sort((a, b) => {
				if (!a.tribes?.length) {
					return 1;
				}
				if (!b.tribes?.length) {
					return -1;
				}
				return (
					i18n
						.translateString(`global.tribe.${Race[a.tribes[0]].toLocaleLowerCase()}`)
						.localeCompare(i18n.translateString(`global.tribe.${Race[b.tribes[0]].toLocaleLowerCase()}`)) ||
					(a.name ?? '').localeCompare(b.name ?? '')
				);
			}) ?? [];
	return result;
};

const enhanceComp = (comp: BgsCompAdvice, allCards: CardsFacadeService): ExtendedBgsCompAdvice => {
	const allTribes: readonly Race[] = comp.cards
		.filter((c) => c.status === 'CORE')
		.filter((c) => allCards.getCard(c.cardId).races?.length)
		.flatMap((c) => allCards.getCard(c.cardId).races!)
		.map((r) => Race[r]);
	const result: ExtendedBgsCompAdvice = {
		...comp,
		minionIcon: comp.cards.filter((c) => c.status === 'CORE')[0]?.cardId,
		cards: [...comp.cards]
			.sort((a, b) => {
				const cardA = allCards.getCard(a.cardId);
				const cardB = allCards.getCard(b.cardId);
				return cardA.name.localeCompare(cardB.name);
			})
			.sort((a, b) => {
				const cardA = allCards.getCard(a.cardId);
				const cardB = allCards.getCard(b.cardId);
				if (!cardA.techLevel) {
					return 1;
				}
				if (!cardB.techLevel) {
					return -1;
				}
				return cardA.techLevel - cardB.techLevel;
			}),
		tribes: allTribes.filter((tribe, index) => allTribes.indexOf(tribe) === index).sort(),
	};
	return result;
};

const trimComp = (
	comp: ExtendedBgsCompAdvice,
	availableTribes: readonly Race[],
	allCards: CardsFacadeService,
): ExtendedBgsCompAdvice => {
	const result: ExtendedBgsCompAdvice = {
		...comp,
		cards: comp.cards.filter((c) => isCardAvailable(allCards.getCard(c.cardId), availableTribes)),
	};
	return result;
};

const isAvailable = (comp: BgsCompAdvice, availableTribes: readonly Race[], allCards: CardsFacadeService): boolean => {
	return comp.cards
		.filter((c) => c.status === 'CORE')
		.map((c) => allCards.getCard(c.cardId))
		.every((c) => isCardAvailable(c, availableTribes));
};

const isCardAvailable = (card: ReferenceCard, availableTribes: readonly Race[]): boolean => {
	const result =
		!card.races?.length ||
		!availableTribes?.length ||
		card.races.some((r) => availableTribes.includes(Race[r]) || card.races!.includes(Race[Race.ALL]));
	return result;
};
