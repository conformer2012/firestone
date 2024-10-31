import { CardClass, CardIds } from '@firestone-hs/reference-data';
import { ILocalizationService } from '@firestone/shared/framework/core';
import { GameState } from '../../models/game-state';
import { CounterDefinitionV2 } from '../_counter-definition-v2';
import { CounterType } from '../_exports';

export class DragonsSummonedCounterDefinitionV2 extends CounterDefinitionV2<number> {
	public override id: CounterType = 'dragonsSummoned';
	public override image = CardIds.TimewinderZarimi_TOY_385;
	protected override cards: readonly CardIds[] = [CardIds.FyeTheSettingSun_WW_825, CardIds.TimewinderZarimi_TOY_385];

	readonly player = {
		pref: 'playerDragonsSummonedCounter' as const,
		display: (state: GameState): boolean => true,
		value: (state: GameState): number => state.playerDeck?.dragonsSummoned,
		setting: {
			label: (i18n: ILocalizationService): string =>
				i18n.translateString('settings.decktracker.your-deck.counters.dragons-summoned-label'),
			tooltip: (i18n: ILocalizationService): string =>
				i18n.translateString('settings.decktracker.your-deck.counters.dragons-summoned-tooltip'),
		},
	};

	readonly opponent = {
		pref: 'opponentDragonsSummonedCounter' as const,
		display: (state: GameState): boolean =>
			!!state.opponentDeck?.hero?.classes?.some((playerClass) =>
				[CardClass.PRIEST, CardClass.DRUID].includes(playerClass),
			),
		value: (state: GameState): number => state.opponentDeck?.dragonsSummoned,
		setting: {
			label: (i18n: ILocalizationService): string =>
				i18n.translateString('settings.decktracker.your-deck.counters.dragons-summoned-label'),
			tooltip: (i18n: ILocalizationService): string =>
				i18n.translateString('settings.decktracker.opponent-deck.counters.dragons-summoned-tooltip'),
		},
	};

	constructor(private readonly i18n: ILocalizationService) {
		super();
	}

	protected override tooltip(side: 'player' | 'opponent', gameState: GameState): string {
		return this.i18n.translateString(`counters.specific-summons.${side}`, {
			value: side === 'player' ? this.player.value(gameState) : this.opponent.value(gameState),
			cardName: this.i18n.translateString('global.tribe.dragon'),
		});
	}
}