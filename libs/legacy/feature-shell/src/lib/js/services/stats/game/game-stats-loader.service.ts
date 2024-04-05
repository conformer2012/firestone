import { Injectable } from '@angular/core';
import { decode as decodeDeckstring } from '@firestone-hs/deckstrings';
import { BgsPostMatchStats } from '@firestone-hs/hs-replay-xml-parser/dist/public-api';
import { PatchInfo, PatchesConfigService, PreferencesService } from '@firestone/shared/common/service';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import {
	AbstractFacadeService,
	ApiRunner,
	AppInjector,
	CardsFacadeService,
	DiskCacheService,
	OverwolfService,
	WindowManagerService,
} from '@firestone/shared/framework/core';
import { GameStat, StatGameModeType } from '@firestone/stats/data-access';
import { filter } from 'rxjs';
import { GameStats } from '../../../models/mainwindow/stats/game-stats';
import { DeckHandlerService } from '../../decktracker/deck-handler.service';
import { getDefaultHeroDbfIdForClass } from '../../hs-utils';
import { isMercenaries } from '../../mercenaries/mercenaries-utils';
import { AppUiStoreService } from '../../ui-store/app-ui-store.service';
import { decode } from '../../utils';

const GAME_STATS_ENDPOINT = 'https://lq32rsf3wgmmjxihavjplf5jfq0ntetn.lambda-url.us-west-2.on.aws/';

@Injectable()
export class GameStatsLoaderService extends AbstractFacadeService<GameStatsLoaderService> {
	public gameStats$$: SubscriberAwareBehaviorSubject<GameStats>;

	private patchInfo: PatchInfo;

	private api: ApiRunner;
	private ow: OverwolfService;
	private prefs: PreferencesService;
	private handler: DeckHandlerService;
	private allCards: CardsFacadeService;
	private diskCache: DiskCacheService;
	private store: AppUiStoreService;
	private patchesConfig: PatchesConfigService;

	constructor(protected readonly windowManager: WindowManagerService) {
		super(windowManager, 'gameStatsLoader', () => !!this.gameStats$$);
	}

	protected override assignSubjects() {
		this.gameStats$$ = this.mainInstance.gameStats$$;
	}

	protected async init() {
		this.gameStats$$ = new SubscriberAwareBehaviorSubject<GameStats>(null);
		this.api = AppInjector.get(ApiRunner);
		this.ow = AppInjector.get(OverwolfService);
		this.prefs = AppInjector.get(PreferencesService);
		this.handler = AppInjector.get(DeckHandlerService);
		this.allCards = AppInjector.get(CardsFacadeService);
		this.diskCache = AppInjector.get(DiskCacheService);
		this.store = AppInjector.get(AppUiStoreService);
		this.patchesConfig = AppInjector.get(PatchesConfigService);

		await this.store.initComplete();
		await this.patchesConfig.isReady();

		this.gameStats$$.onFirstSubscribe(async () => {
			console.debug('[game-stats-loader] first subscriber, loading stats', new Error().stack);
			this.gameStats$$.pipe(filter((gameStats) => !!gameStats?.stats?.length)).subscribe((gameStats) => {
				console.debug('[game-stats-loader] updating local games');
				this.saveLocalStats(gameStats.stats);
			});

			await this.retrieveStats();
		});

		this.patchesConfig.config$$.pipe(filter((config) => !!config?.patches?.length)).subscribe((config) => {
			const lastPatch = config.patches[config.patches.length - 1];
			this.patchInfo = lastPatch;
		});
	}

	public async addGame(game: GameStat) {
		const currentStats: GameStats = await this.gameStats$$.getValueWithInit();
		const newStats = currentStats?.update({
			stats: [game, ...(currentStats?.stats ?? [])],
		});
		this.gameStats$$.next(newStats);
	}

	public async updateBgsPostMatchStats(reviewId: string, postMatchStats: BgsPostMatchStats) {
		const currentStats: GameStats = await this.gameStats$$.getValueWithInit();
		const newStats = currentStats.updateBgsPostMatchStats(reviewId, postMatchStats);
		this.gameStats$$.next(newStats);
	}

	private async retrieveStats() {
		const localStats = await this.loadLocalGameStats();
		if (!!localStats?.length) {
			console.log('[game-stats-loader] retrieved stats locally', localStats.length);
			const prefs = await this.prefs.getPreferences();
			this.gameStats$$.next(
				GameStats.create({
					stats: localStats
						.map((stat) => GameStat.create({ ...stat }))
						.filter((stat) => this.isCorrectPeriod(stat, prefs.replaysLoadPeriod))
						// Here we remove all the stats right at the source, so that we're sure that deleted decks don't
						// appear anywhere
						.filter(
							(stat) =>
								!prefs?.desktopDeckDeletes ||
								!prefs.desktopDeckDeletes[stat.playerDecklist]?.length ||
								prefs.desktopDeckDeletes[stat.playerDecklist][
									prefs.desktopDeckDeletes[stat.playerDecklist].length - 1
								] < stat.creationTimestamp,
						),
				}),
			);
		} else {
			console.log('[game-stats-loader] no stats locally, retrieving from server');
			const stats = await this.refreshGameStats(false);
			this.gameStats$$.next(stats);
		}
	}

	public async clearGames() {
		console.log('[game-stats-loader] clearing games');
		await this.saveLocalStats([]);
		const stats = await this.refreshGameStats(false);
		this.gameStats$$.next(stats);
	}

	public async fullRefresh() {
		console.log('[game-stats-loader] triggering full refresh');
		const stats = await this.refreshGameStats(true);
		this.gameStats$$.next(stats);
	}

	private async refreshGameStats(fullRetrieve: boolean) {
		const user = await this.ow.getCurrentUser();
		const prefs = await this.prefs.getPreferences();
		const input = {
			userId: user.userId,
			userName: user.username,
			fullRetrieve: fullRetrieve,
		};
		// const input = {
		// 	userId: 'zerg',
		// };
		console.log('[game-stats-loader] retrieving stats from API', input);
		const data = await this.api.callPostApi(GAME_STATS_ENDPOINT, input);

		const endpointResult: readonly GameStat[] = (data as any)?.results ?? [];
		const stats: readonly GameStat[] = endpointResult
			.map((stat) => {
				const decoded = (stat as any).finalComp ? decode((stat as any).finalComp) : null;
				const postMatchStats: BgsPostMatchStats = decoded == null ? null : ({ boardHistory: [decoded] } as any);
				let playerInfoFromDeckstring = null;
				return {
					...stat,
					playerDecklist: isMercenaries(stat.gameMode)
						? stat.playerDecklist
						: this.handler.normalizeDeckstring(stat.playerDecklist),
					// Because old stats are corrupted
					runId: stat.creationTimestamp < new Date('2020-12-14').getTime() ? null : stat.runId,
					postMatchStats: postMatchStats,
					playerClass:
						stat.playerClass ??
						(playerInfoFromDeckstring =
							playerInfoFromDeckstring ??
							extractPlayerInfoFromDeckstring(stat.playerDecklist, this.allCards, stat.gameMode, stat))
							?.playerClass,
					playerCardId:
						stat.playerCardId ??
						(playerInfoFromDeckstring =
							playerInfoFromDeckstring ??
							extractPlayerInfoFromDeckstring(stat.playerDecklist, this.allCards, stat.gameMode, stat))
							?.playerCardId,
				};
			})
			.map((stat) => Object.assign(new GameStat(), stat))
			.filter((stat) => this.isCorrectPeriod(stat, prefs.replaysLoadPeriod));
		await this.saveLocalStats(stats);
		console.log('[game-stats-loader] Retrieved game stats for user', stats?.length);
		//console.debug('[game-stats-loader] Retrieved game stats for user', stats);
		return GameStats.create({
			stats: stats
				// Here we remove all the stats right at the source, so that we're sure that deleted decks don't
				// appear anywhere
				// TODO: this isn't good, because it means that the "stats" field isn't a reliable representation of
				// all the user stats. What if they un-delete a deck somehow?
				.filter(
					(stat) =>
						!prefs?.desktopDeckDeletes ||
						!prefs.desktopDeckDeletes[stat.playerDecklist]?.length ||
						prefs.desktopDeckDeletes[stat.playerDecklist][
							prefs.desktopDeckDeletes[stat.playerDecklist].length - 1
						] < stat.creationTimestamp,
				),
		});
	}

	private isCorrectPeriod(
		stat: GameStat,
		replaysLoadPeriod: 'all-time' | 'past-100' | 'last-patch' | 'past-7' | 'season-start',
	): boolean {
		switch (replaysLoadPeriod) {
			case 'season-start':
				const startOfMonthDate = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
				return stat.creationTimestamp >= startOfMonthDate.getTime();
			case 'last-patch':
				if (!this.patchInfo) {
					return false;
				}
				// See bgs-ui-helper
				return (
					stat.buildNumber >= this.patchInfo.number ||
					stat.creationTimestamp > new Date(this.patchInfo.date).getTime() + 24 * 60 * 60 * 1000
				);
			case 'past-7':
				const past7Date = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
				return stat.creationTimestamp >= past7Date.getTime();
			case 'past-100':
				const past100Date = new Date(Date.now() - 100 * 24 * 60 * 60 * 1000);
				return stat.creationTimestamp >= past100Date.getTime();
			case 'all-time':
			default:
				return true;
		}
	}

	private async saveLocalStats(gameStats: readonly GameStat[]) {
		await this.diskCache.storeItem(DiskCacheService.DISK_CACHE_KEYS.USER_MATCH_HISTORY, gameStats);
	}

	private async loadLocalGameStats(): Promise<readonly GameStat[]> {
		return await this.diskCache.getItem(DiskCacheService.DISK_CACHE_KEYS.USER_MATCH_HISTORY);
	}
}

export const extractPlayerInfoFromDeckstring = (
	deckstring: string,
	allCards: CardsFacadeService,
	gameMode: StatGameModeType,
	info = null,
): { playerClass: string; playerCardId: string } => {
	if (gameMode !== 'ranked') {
		return null;
	}

	try {
		const deckDefinition = !!deckstring ? decodeDeckstring(deckstring) : null;
		const playerClassFromDeckstring = allCards
			.getCardFromDbfId(deckDefinition?.heroes[0])
			?.playerClass?.toLowerCase();
		const mainPlayerClass =
			!!playerClassFromDeckstring && playerClassFromDeckstring !== 'neutral' ? playerClassFromDeckstring : null;
		const playerCardId = allCards.getCardFromDbfId(getDefaultHeroDbfIdForClass(mainPlayerClass)).id;
		return { playerClass: mainPlayerClass, playerCardId: playerCardId };
	} catch (e) {
		console.error('could not extract info from deckstring', deckstring, info, e);
		return null;
	}
};
