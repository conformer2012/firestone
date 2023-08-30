import { Injectable } from '@angular/core';
import { CardIds, Race } from '@firestone-hs/reference-data';
import { combineLatest, debounceTime, filter, map } from 'rxjs';
import { AppUiStoreFacadeService } from '../ui-store/app-ui-store-facade.service';
import { BattlegroundsStoreService } from './store/battlegrounds-store.service';
import { BgsToggleHighlightMinionOnBoardEvent } from './store/events/bgs-toggle-highlight-minion-on-board-event';
import { BgsToggleHighlightTribeOnBoardEvent } from './store/events/bgs-toggle-highlight-tribe-on-board-event';

@Injectable()
export class BgsPremiumHighlighterService {
	constructor(private readonly store: AppUiStoreFacadeService, private readonly bgsStore: BattlegroundsStoreService) {
		this.init();
	}

	private async init() {
		await this.store.initComplete();

		combineLatest([
			this.store.enablePremiumFeatures$(),
			this.store.listenPrefs$(
				(prefs) => prefs.bgsEnableMinionAutoHighlight,
				(prefs) => prefs.bgsEnableTribeAutoHighlight,
			),
			this.store.listenBattlegrounds$(
				([state]) => !!state.currentGame,
				([state]) => state.currentGame?.gameEnded,
				([state]) => state.currentGame?.getMainPlayer()?.cardId,
			),
		]).pipe(
			debounceTime(1000),
			filter(([premium, [minionAuto, tribeAuto], [state, gameEnded, cardId]]) => premium),
			map(([premium, [minionAuto, tribeAuto], [state, gameEnded, heroCardId]]) => {
				if (gameEnded) {
					return [];
				}

				const minionsToHighlight: readonly string[] = this.buildMinionToHighlight(heroCardId);
				if (!minionsToHighlight?.length && minionAuto) {
					this.bgsStore.battlegroundsUpdater.next(
						new BgsToggleHighlightMinionOnBoardEvent(minionsToHighlight),
					);
				}

				const tribeToHighlight: Race = this.buildTribeToHighlight(heroCardId);
				if (tribeToHighlight && tribeAuto) {
					this.bgsStore.battlegroundsUpdater.next(new BgsToggleHighlightTribeOnBoardEvent(tribeToHighlight));
				}
			}),
		);
	}

	private buildMinionToHighlight(heroCardId: string): readonly string[] {
		switch (heroCardId) {
			case CardIds.ThorimStormlord_BG27_HERO_801:
				return [CardIds.FreedealingGambler_BGS_049];
			case CardIds.PatchesThePirate_TB_BaconShop_HERO_18:
				return [CardIds.FreedealingGambler_BGS_049];
			case CardIds.CapnHoggarr_BG26_HERO_101:
				return [CardIds.FreedealingGambler_BGS_049];
			case CardIds.Cthun_TB_BaconShop_HERO_29:
				return [CardIds.DrakkariEnchanter_BG26_ICC_901];
			case CardIds.RagnarosTheFirelord_TB_BaconShop_HERO_11:
				return [CardIds.DrakkariEnchanter_BG26_ICC_901];
			case CardIds.RockMasterVoone_BG26_HERO_104:
				return [CardIds.DrakkariEnchanter_BG26_ICC_901];
			default:
				return [];
		}
	}

	private buildTribeToHighlight(heroCardId: string): Race {
		switch (heroCardId) {
			case CardIds.PatchesThePirate_TB_BaconShop_HERO_18:
				return Race.PIRATE;
			case CardIds.Chenvaala_TB_BaconShop_HERO_78:
				return Race.ELEMENTAL;
			default:
				return null;
		}
	}
}
