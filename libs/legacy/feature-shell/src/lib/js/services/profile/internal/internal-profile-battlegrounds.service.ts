import { Injectable } from '@angular/core';
import { Profile, ProfileBgHeroStat } from '@firestone-hs/api-user-profile';
import { normalizeHeroCardId } from '@firestone-hs/reference-data';
import { AchievementsRefLoaderService, HsRefAchievement } from '@firestone/achievements/data-access';
import { groupByFunction } from '@firestone/shared/framework/common';
import { ApiRunner, CardsFacadeService } from '@firestone/shared/framework/core';
import { combineLatest, debounceTime, distinctUntilChanged, filter, from, map } from 'rxjs';
import { AchievementsMemoryMonitor } from '../../achievement/achievements-memory-monitor.service';
import { getAchievementSectionIdFromHeroCardId } from '../../battlegrounds/bgs-utils';
import { AppUiStoreFacadeService } from '../../ui-store/app-ui-store-facade.service';
import { deepEqual } from '../../utils';
import { PROFILE_UPDATE_URL } from '../profile-uploader.service';

@Injectable()
export class InternalProfileBattlegroundsService {
	constructor(
		private readonly store: AppUiStoreFacadeService,
		private readonly api: ApiRunner,
		private readonly achievementsMonitor: AchievementsMemoryMonitor,
		private readonly achievementsRefLoader: AchievementsRefLoaderService,
		private readonly allCards: CardsFacadeService,
	) {
		this.init();
	}

	private async init() {
		await this.store.initComplete();
		this.initBattlegrounds();
	}

	private initBattlegrounds() {
		const uniqueBgHeroes = [
			...new Set(
				this.allCards
					.getCards()
					.filter((c) => c.battlegroundsHero)
					.map((c) => normalizeHeroCardId(c.id, this.allCards)),
			),
		];
		const achievementsData$ = from(this.achievementsRefLoader.getLatestRefData()).pipe(
			filter((refData) => !!refData?.achievements?.length),
			map((refData) => {
				return uniqueBgHeroes
					.map((heroCardId) => {
						const sectionId = getAchievementSectionIdFromHeroCardId(heroCardId);
						const achievementsForSection = refData.achievements
							.filter((ach) => ach.sectionId === sectionId)
							.filter((ach) => ach.quota === 1);
						if (!achievementsForSection?.length) {
							return null;
						}
						const groupedBySortOrder = groupByFunction((ach: HsRefAchievement) => ach.sortOrder)(
							achievementsForSection,
						);
						// They "should" be sorted by default. Sorting them manually is definitely possible, but
						// bothersome enough that we can skip it for now
						const placementAchievements: readonly HsRefAchievement[] = Object.values(
							groupedBySortOrder,
						).find((achs) => achs.length === 3);
						return {
							sectionId: sectionId,
							heroCardId: heroCardId,
							heroName: this.allCards.getCard(heroCardId).name,
							steps: placementAchievements.map((a) => a.id),
						};
					})
					.filter((data) => !!data);
			}),
		);
		const bgFullTimeStatsByHero$ = combineLatest([
			achievementsData$,
			this.store.isPremiumUser$(),
			this.achievementsMonitor.nativeAchievements$$,
		]).pipe(
			filter(
				([achievementsData, premium, nativeAchievements]) =>
					premium && !!achievementsData?.length && !!nativeAchievements?.length,
			),
			debounceTime(10000),
			map(([achievementsData, premium, nativeAchievements]) => {
				return achievementsData.map((data) => {
					return {
						heroCardId: data.heroCardId,
						// heroName: data.heroName,
						gamesPlayed: nativeAchievements.find((a) => a.id === data.steps[0])?.progress ?? 0,
						top4: nativeAchievements.find((a) => a.id === data.steps[1])?.progress ?? 0,
						top1: nativeAchievements.find((a) => a.id === data.steps[2])?.progress ?? 0,
					} as ProfileBgHeroStat;
				});
			}),
		);
		bgFullTimeStatsByHero$
			.pipe(distinctUntilChanged((a, b) => deepEqual(a, b)))
			.subscribe(async (bgFullTimeStatsByHero) => {
				console.debug('[profile] will upload bgFullTimeStatsByHero', bgFullTimeStatsByHero);
				const payload: Profile = {
					bgFullTimeStatsByHero: bgFullTimeStatsByHero,
				};
				console.debug('[profile] updating profile with payload', payload);
				this.api.callPostApiSecure(PROFILE_UPDATE_URL, payload);
			});
	}
}