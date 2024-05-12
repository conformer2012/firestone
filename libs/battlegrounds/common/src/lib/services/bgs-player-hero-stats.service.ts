/* eslint-disable no-mixed-spaces-and-tabs */
import { Injectable } from '@angular/core';
import { ALL_BG_RACES } from '@firestone-hs/reference-data';
import { BgsMetaHeroStatTierItem, enhanceHeroStat } from '@firestone/battlegrounds/data-access';
import { PatchesConfigService, PreferencesService } from '@firestone/shared/common/service';
import { SubscriberAwareBehaviorSubject, deepEqual } from '@firestone/shared/framework/common';
import {
	AbstractFacadeService,
	AppInjector,
	CardsFacadeService,
	WindowManagerService,
	waitForReady,
} from '@firestone/shared/framework/core';
import { GAME_STATS_PROVIDER_SERVICE_TOKEN, IGameStatsProviderService } from '@firestone/stats/common';
import { combineLatest, distinctUntilChanged, map, shareReplay } from 'rxjs';
import { Config } from '../model/_barrel';
import { BgsMetaHeroStatsDuoService } from './bgs-meta-hero-stats-duo.service';
import { BG_USE_ANOMALIES, BgsMetaHeroStatsService } from './bgs-meta-hero-stats.service';
import { filterBgsMatchStats } from './hero-stats-helper';

@Injectable()
export class BgsPlayerHeroStatsService extends AbstractFacadeService<BgsPlayerHeroStatsService> {
	public tiersWithPlayerData$$: SubscriberAwareBehaviorSubject<readonly BgsMetaHeroStatTierItem[] | null | undefined>;

	private metaStats: BgsMetaHeroStatsService;
	private metaStatsDuo: BgsMetaHeroStatsDuoService;
	private prefs: PreferencesService;
	private allCards: CardsFacadeService;
	private gameStats: IGameStatsProviderService;
	private patchesConfig: PatchesConfigService;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'BgsPlayerHeroStatsService', () => !!this.tiersWithPlayerData$$);
	}

	protected override assignSubjects() {
		this.tiersWithPlayerData$$ = this.mainInstance.tiersWithPlayerData$$;
	}

	protected async init() {
		this.tiersWithPlayerData$$ = new SubscriberAwareBehaviorSubject<
			readonly BgsMetaHeroStatTierItem[] | null | undefined
		>(null);
		this.metaStats = AppInjector.get(BgsMetaHeroStatsService);
		this.metaStatsDuo = AppInjector.get(BgsMetaHeroStatsDuoService);
		this.prefs = AppInjector.get(PreferencesService);
		this.allCards = AppInjector.get(CardsFacadeService);
		this.gameStats = AppInjector.get(GAME_STATS_PROVIDER_SERVICE_TOKEN);
		this.patchesConfig = AppInjector.get(PatchesConfigService);

		await waitForReady(this.patchesConfig, this.metaStats, this.prefs);

		this.tiersWithPlayerData$$.onFirstSubscribe(() => {
			const gameMode$ = this.prefs.preferences$$.pipe(map((prefs) => prefs.bgsActiveGameMode));
			// Can probably avoid marking the data as null when changing things like the tribes
			const config$ = combineLatest([
				gameMode$,
				this.prefs.preferences$$.pipe(
					map((prefs) => {
						const config: Config = {
							rankFilter: prefs.bgsActiveRankFilter,
							tribesFilter: prefs.bgsActiveTribesFilter,
							anomaliesFilter: prefs.bgsActiveAnomaliesFilter,
							timeFilter: prefs.bgsActiveTimeFilter,
						} as Config;
						return config;
					}),
					distinctUntilChanged((a, b) => deepEqual(a, b)),
				),
			]).pipe(
				distinctUntilChanged((a, b) => deepEqual(a, b)),
				map(([gameMode, config]) => ({
					...config,
					gameMode: gameMode,
				})),
				shareReplay(1),
			);

			// Make sure we refresh when game stats are updated
			combineLatest([config$, this.gameStats.gameStats$$]).subscribe(async ([config]) => {
				console.debug('[bgs-2] refreshing meta hero stats', config);
				this.tiersWithPlayerData$$.next(null);
				const finalStats = await this.buildFinalStats(config);
				this.tiersWithPlayerData$$.next(finalStats);
			});
		});
	}

	// Not super fan of moving everything to an "await" pattern
	public async buildFinalStats(
		config: Config,
		mmrFilter?: number,
	): Promise<readonly BgsMetaHeroStatTierItem[] | undefined> {
		return this.mainInstance.buildFinalStatsInternal(config, mmrFilter);
	}

	private async buildFinalStatsInternal(
		config: Config,
		mmrFilter?: number,
	): Promise<readonly BgsMetaHeroStatTierItem[] | undefined> {
		console.debug('[bgs-2] rebuilding meta hero stats', config, mmrFilter);
		const heroStats =
			config.gameMode === 'battlegrounds-duo'
				? await this.metaStatsDuo.getStats(config)
				: await this.metaStats.getStats(config);
		const tiers =
			config.gameMode === 'battlegrounds-duo'
				? await this.metaStatsDuo.getTiers(config, heroStats)
				: await this.metaStats.getTiers(config, heroStats);
		const games = await this.gameStats.gameStats$$.getValueWithInit();
		const patchInfo = await this.patchesConfig.currentBattlegroundsMetaPatch$$.getValueWithInit();
		const mmrPercentiles = heroStats?.mmrPercentiles ?? [];

		const bgGames = (games ?? [])
			.filter((g) =>
				config.gameMode === 'battlegrounds'
					? ['battlegrounds', 'battlegrounds-friendly'].includes(g.gameMode)
					: ['battlegrounds-duo'].includes(g.gameMode),
			)
			.filter(
				(g) =>
					!config.tribesFilter?.length ||
					config.tribesFilter.length === ALL_BG_RACES.length ||
					config.tribesFilter.some((t) => g.bgsAvailableTribes?.includes(t)),
			)
			.filter((g) =>
				BG_USE_ANOMALIES
					? !config.anomaliesFilter?.length || config.anomaliesFilter.some((a) => g.bgsAnomalies?.includes(a))
					: true,
			);

		const targetRank: number = !mmrPercentiles?.length
			? 0
			: !!config.rankFilter
			? mmrPercentiles.find((m) => m.percentile === config.rankFilter)?.mmr ?? 0
			: !!mmrFilter
			? mmrPercentiles.filter((m) => m.mmr >= mmrFilter).sort((a, b) => a.mmr - b.mmr)[0]?.mmr ?? 0
			: 0;
		const afterFilter = filterBgsMatchStats(bgGames, config.timeFilter, targetRank, patchInfo);
		console.debug('[bgs-2] rebuilt meta hero stats 2', config, bgGames, afterFilter);

		const finalStats = tiers?.map((stat) => enhanceHeroStat(stat, afterFilter, this.allCards));
		return finalStats;
	}
}
