import { Injectable } from '@angular/core';
import { GameType } from '@firestone-hs/reference-data';
import { WindowManagerService } from '@firestone/shared/framework/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map } from 'rxjs/operators';
import { Preferences } from '../../models/preferences';
import { GameStatusService } from '../game-status.service';
import { AppUiStoreFacadeService } from '../ui-store/app-ui-store-facade.service';

@Injectable()
export class OverlayDisplayService {
	private decktrackerDisplayEventBus: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

	constructor(
		private readonly store: AppUiStoreFacadeService,
		private readonly gameStatus: GameStatusService,
		windowManager: WindowManagerService,
	) {
		windowManager.registerGlobalService('decktrackerDisplayEventBus', this.decktrackerDisplayEventBus);
		this.init();
	}

	private async init() {
		await this.store.initComplete();
		combineLatest([
			this.store.listenDeckState$((gameState) => gameState),
			this.store.listen$(([main, nav, prefs]) => prefs),
			this.gameStatus.inGame$$,
		])
			.pipe(
				debounceTime(200),
				filter(([gameState, prefs, inGame]) => inGame),
				map(([[gameState], [prefs]]) => ({
					gameType: gameState?.metadata?.gameType,
					hasPlayerDeck: true, // gameState?.playerDeck?.deckList?.length > 0,
					prefs: prefs,
				})),
				distinctUntilChanged((a, b) => {
					return (
						a.gameType === b.gameType &&
						a.hasPlayerDeck === b.hasPlayerDeck &&
						a.prefs.decktrackerShowArena === b.prefs.decktrackerShowArena &&
						a.prefs.decktrackerShowCasual === b.prefs.decktrackerShowCasual &&
						a.prefs.decktrackerShowRanked === b.prefs.decktrackerShowRanked &&
						a.prefs.decktrackerShowPractice === b.prefs.decktrackerShowPractice &&
						a.prefs.decktrackerShowFriendly === b.prefs.decktrackerShowFriendly &&
						a.prefs.decktrackerShowTavernBrawl === b.prefs.decktrackerShowTavernBrawl
					);
				}),
				map((info) => this.shouldDisplay(info.gameType, info.hasPlayerDeck, info.prefs)),
				distinctUntilChanged(),
			)
			.subscribe((shouldDisplay) => this.decktrackerDisplayEventBus.next(shouldDisplay));
	}

	private shouldDisplay(gameType: GameType, hasPlayerDeck: boolean, prefs: Preferences): boolean {
		console.debug('[overlay-display] should display?', gameType, hasPlayerDeck, prefs);
		if (!gameType || !hasPlayerDeck) {
			return false;
		}
		switch (gameType) {
			case GameType.GT_ARENA:
				return prefs.decktrackerShowArena;
			case GameType.GT_CASUAL:
				return prefs.decktrackerShowCasual;
			case GameType.GT_RANKED:
				return prefs.decktrackerShowRanked;
			case GameType.GT_VS_AI:
				return prefs.decktrackerShowPractice;
			case GameType.GT_VS_FRIEND:
				return prefs.decktrackerShowFriendly;
			case GameType.GT_FSG_BRAWL:
			case GameType.GT_FSG_BRAWL_1P_VS_AI:
			case GameType.GT_FSG_BRAWL_2P_COOP:
			case GameType.GT_FSG_BRAWL_VS_FRIEND:
			case GameType.GT_TB_1P_VS_AI:
			case GameType.GT_TB_2P_COOP:
			case GameType.GT_TAVERNBRAWL:
				return prefs.decktrackerShowTavernBrawl;
			case GameType.GT_BATTLEGROUNDS:
			case GameType.GT_BATTLEGROUNDS_FRIENDLY:
			case GameType.GT_BATTLEGROUNDS_AI_VS_AI:
			case GameType.GT_BATTLEGROUNDS_PLAYER_VS_AI:
				return false;
			case GameType.GT_PVPDR:
			case GameType.GT_PVPDR_PAID:
				return prefs.decktrackerShowDuels;
			case GameType.GT_MERCENARIES_AI_VS_AI:
			case GameType.GT_MERCENARIES_FRIENDLY:
			case GameType.GT_MERCENARIES_PVP:
			case GameType.GT_MERCENARIES_PVE:
			case GameType.GT_MERCENARIES_PVE_COOP:
				return false;
		}
		console.warn('[overlay-display] unknown game type', gameType as GameType);
		return hasPlayerDeck;
	}
}
