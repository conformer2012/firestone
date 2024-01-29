import { Injectable } from '@angular/core';
import {
	ArchetypeStat,
	ArchetypeStats,
	DeckStat,
	DeckStats,
	GameFormat,
	RankBracket,
	TimePeriod,
} from '@firestone-hs/constructed-deck-stats';
import { ConstructedNavigationService } from '@firestone/constructed/common';
import { PreferencesService } from '@firestone/shared/common/service';
import { SubscriberAwareBehaviorSubject } from '@firestone/shared/framework/common';
import { AbstractFacadeService, ApiRunner, AppInjector, WindowManagerService } from '@firestone/shared/framework/core';
import { BehaviorSubject, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';

const CONSTRUCTED_META_DECKS_BASE_URL = 'https://static.zerotoheroes.com/api/constructed/stats/decks';
const CONSTRUCTED_META_DECK_DETAILS_URL = 'https://xcwdxyfpo2hfj2inn25rh5gd3y0rdwyw.lambda-url.us-west-2.on.aws';
const CONSTRUCTED_META_ARCHETYPES_BASE_URL = 'https://static.zerotoheroes.com/api/constructed/stats/archetypes';

@Injectable()
export class ConstructedMetaDecksStateService extends AbstractFacadeService<ConstructedMetaDecksStateService> {
	public constructedMetaDecks$$: SubscriberAwareBehaviorSubject<ExtendedDeckStats>;
	public currentConstructedMetaDeck$$: BehaviorSubject<DeckStat>;
	public constructedMetaArchetypes$$: SubscriberAwareBehaviorSubject<ArchetypeStats>;
	public currentConstructedMetaArchetype$$: BehaviorSubject<ArchetypeStat>;
	public allCardsInDeck$$: SubscriberAwareBehaviorSubject<readonly string[]>;
	public cardSearch$$: BehaviorSubject<readonly string[]>;

	private triggerLoadDecks$$ = new BehaviorSubject<boolean>(false);
	private triggerLoadArchetypes$$ = new BehaviorSubject<boolean>(false);

	private api: ApiRunner;
	// private store: AppUiStoreFacadeService;
	private prefs: PreferencesService;
	private navigation: ConstructedNavigationService;

	constructor(protected override readonly windowManager: WindowManagerService) {
		super(windowManager, 'constructedMetaDecks', () => !!this.constructedMetaDecks$$);
	}

	protected override assignSubjects() {
		this.constructedMetaDecks$$ = this.mainInstance.constructedMetaDecks$$;
		this.currentConstructedMetaDeck$$ = this.mainInstance.currentConstructedMetaDeck$$;
		this.constructedMetaArchetypes$$ = this.mainInstance.constructedMetaArchetypes$$;
		this.currentConstructedMetaArchetype$$ = this.mainInstance.currentConstructedMetaArchetype$$;
		this.allCardsInDeck$$ = this.mainInstance.allCardsInDeck$$;
		this.cardSearch$$ = this.mainInstance.cardSearch$$;
	}

	protected async init() {
		this.constructedMetaDecks$$ = new SubscriberAwareBehaviorSubject<ExtendedDeckStats | null>(null);
		this.currentConstructedMetaDeck$$ = new SubscriberAwareBehaviorSubject<DeckStat | null>(null);
		this.constructedMetaArchetypes$$ = new SubscriberAwareBehaviorSubject<ArchetypeStats | null>(null);
		this.currentConstructedMetaArchetype$$ = new SubscriberAwareBehaviorSubject<ArchetypeStat | null>(null);
		this.allCardsInDeck$$ = new SubscriberAwareBehaviorSubject<readonly string[] | null>(null);
		this.cardSearch$$ = new BehaviorSubject<readonly string[] | null>(null);
		this.api = AppInjector.get(ApiRunner);
		this.prefs = AppInjector.get(PreferencesService);
		this.navigation = AppInjector.get(ConstructedNavigationService);

		await this.navigation.isReady();
		await this.prefs.isReady();

		this.constructedMetaDecks$$.onFirstSubscribe(async () => {
			this.triggerLoadDecks$$.next(true);
			this.constructedMetaDecks$$.subscribe((decks) => this.buildAllCardsInDecks(decks));
		});
		this.constructedMetaArchetypes$$.onFirstSubscribe(async () => {
			this.triggerLoadArchetypes$$.next(true);
		});
		this.allCardsInDeck$$.onFirstSubscribe(async () => {
			this.triggerLoadDecks$$.next(true);
		});

		combineLatest([
			this.triggerLoadDecks$$,
			this.prefs.preferences$(
				(prefs) => prefs.constructedMetaDecksRankFilter2,
				(prefs) => prefs.constructedMetaDecksTimeFilter,
				(prefs) => prefs.constructedMetaDecksFormatFilter,
			),
		])
			.pipe(
				filter(
					([triggerLoad, [rankFilter, timeFilter, formatFilter]]) =>
						triggerLoad && !!timeFilter && !!formatFilter && !!rankFilter,
				),
			)
			.subscribe(async ([_, [rankFilter, timeFilter, formatFilter]]) => {
				this.constructedMetaDecks$$.next(null);
				const stats = await this.loadNewDecks(formatFilter, timeFilter, rankFilter);
				this.constructedMetaDecks$$.next(stats);
			});
		combineLatest([
			this.navigation.selectedConstructedMetaDeck$$,
			this.prefs.preferences$(
				(prefs) => prefs.constructedMetaDecksRankFilter2,
				(prefs) => prefs.constructedMetaDecksTimeFilter,
				(prefs) => prefs.constructedMetaDecksFormatFilter,
			),
		])
			.pipe(
				filter(
					([deckstring, [rankFilter, timeFilter, formatFilter]]) =>
						!!timeFilter && !!formatFilter && !!rankFilter,
				),
			)
			.subscribe(async ([deckstring, [rankFilter, timeFilter, formatFilter]]) => {
				this.currentConstructedMetaDeck$$.next(undefined);
				if (deckstring?.length) {
					const deck = await this.loadNewDeckDetails(deckstring, formatFilter, timeFilter, rankFilter);
					this.currentConstructedMetaDeck$$.next(deck);
				}
			});

		combineLatest([
			this.triggerLoadArchetypes$$,
			this.prefs.preferences$(
				(prefs) => prefs.constructedMetaDecksRankFilter2,
				(prefs) => prefs.constructedMetaDecksTimeFilter,
				(prefs) => prefs.constructedMetaDecksFormatFilter,
			),
		])
			.pipe(
				filter(
					([triggerLoad, [rankFilter, timeFilter, formatFilter]]) =>
						triggerLoad && !!timeFilter && !!formatFilter && !!rankFilter,
				),
			)
			.subscribe(async ([_, [rankFilter, timeFilter, formatFilter]]) => {
				this.constructedMetaArchetypes$$.next(null);
				const stats = await this.loadNewArchetypes(formatFilter, timeFilter, rankFilter);
				this.constructedMetaArchetypes$$.next(stats);
			});
		combineLatest([
			this.navigation.selectedConstructedMetaArchetype$$,
			this.prefs.preferences$(
				(prefs) => prefs.constructedMetaDecksRankFilter2,
				(prefs) => prefs.constructedMetaDecksTimeFilter,
				(prefs) => prefs.constructedMetaDecksFormatFilter,
			),
		])
			.pipe(
				filter(
					([archetypeId, [rankFilter, timeFilter, formatFilter]]) =>
						!!timeFilter && !!formatFilter && !!rankFilter,
				),
			)
			.subscribe(async ([archetypeId, [rankFilter, timeFilter, formatFilter]]) => {
				this.currentConstructedMetaArchetype$$.next(undefined);
				if (archetypeId > 0) {
					const deck = await this.loadNewArchetypeDetails(archetypeId, formatFilter, timeFilter, rankFilter);
					this.currentConstructedMetaArchetype$$.next(deck);
				}
			});
	}

	public newCardSearch(search: readonly string[]) {
		this.mainInstance.newCardSearchInternal(search);
	}

	private newCardSearchInternal(search: readonly string[]) {
		this.cardSearch$$.next(search);
	}

	private buildAllCardsInDecks(decks: ExtendedDeckStats) {
		const allCards = decks?.deckStats.flatMap((d) => d.allCardsInDeck);
		const uniqueCards = [...new Set(allCards)];
		this.allCardsInDeck$$.next(uniqueCards);
	}

	private async loadNewDecks(format: GameFormat, time: TimePeriod, rank: RankBracket): Promise<ExtendedDeckStats> {
		time = (time as string) === 'all-time' ? 'past-20' : time;
		const fileName = `${format}/${rank}/${time}/overview-from-hourly.gz.json`;
		const url = `${CONSTRUCTED_META_DECKS_BASE_URL}/${fileName}`;
		console.log('[constructed-meta-decks] will load deck stats', url, format, time, rank);
		const resultStr = await this.api.get(url);
		if (!resultStr?.length) {
			console.error('could not load meta decks', format, time, rank, url);
			return null;
		}

		const stats: DeckStats = JSON.parse(resultStr);
		console.log('[constructed-meta-decks] loaded meta decks', format, time, rank, stats?.dataPoints);
		if (!stats) {
			return stats as ExtendedDeckStats;
		}

		console.debug('[constructed-meta-decks] will load all cards in decks');
		const result: ExtendedDeckStats = {
			...stats,
			deckStats: stats.deckStats.map((deck) => ({
				...deck,
				allCardsInDeck: [...(deck.cardVariations?.added ?? []), ...(deck.archetypeCoreCards ?? [])],
			})),
		};
		console.debug('[constructed-meta-decks] done loading all cards in decks');
		return result;
	}

	private async loadNewDeckDetails(
		deckstring: string,
		format: GameFormat,
		time: TimePeriod,
		rank: RankBracket,
	): Promise<DeckStat | null> {
		time = (time as string) === 'all-time' ? 'past-20' : time;
		const deckId = encodeURIComponent(deckstring.replace('/', '-'));
		const fileName = `${format}/${rank}/${time}/${deckId}`;
		const url = `${CONSTRUCTED_META_DECK_DETAILS_URL}/${fileName}`;
		console.log('[constructed-meta-decks] will load stat for deck', url, format, time, rank, deckstring);
		const resultStr = await this.api.get(url);
		if (!resultStr?.length) {
			console.error('could not load meta deck', format, time, rank, url);
			return null;
		}

		const deck: DeckStat = JSON.parse(resultStr);
		console.debug('[constructed-meta-decks] loaded deck', format, time, rank, deck?.totalGames);
		return deck;
	}

	private async loadNewArchetypes(format: GameFormat, time: TimePeriod, rank: RankBracket): Promise<ArchetypeStats> {
		time = (time as string) === 'all-time' ? 'past-20' : time;
		const fileName = `${format}/${rank}/${time}/overview-from-hourly.gz.json`;
		const url = `${CONSTRUCTED_META_ARCHETYPES_BASE_URL}/${fileName}`;
		console.log('[constructed-meta-decks] will load archetype stats', url, format, time, rank);
		const resultStr = await this.api.get(url);
		if (!resultStr?.length) {
			console.error('could not load meta decks', format, time, rank, url);
			return null;
		}

		const stats: ArchetypeStats = JSON.parse(resultStr);
		console.log('[constructed-meta-decks] loaded meta archetypes', format, time, rank, stats?.dataPoints);
		return stats;
	}

	private async loadNewArchetypeDetails(
		archetypeId: number,
		format: GameFormat,
		time: TimePeriod,
		rank: RankBracket,
	): Promise<ArchetypeStat> {
		time = (time as string) === 'all-time' ? 'past-20' : time;
		const fileName = `${format}/${rank}/${time}/archetype/${archetypeId}.gz.json`;
		const url = `${CONSTRUCTED_META_ARCHETYPES_BASE_URL}/${fileName}`;
		console.log('[constructed-meta-decks] will load stat for archetype', url, format, time, rank, archetypeId);
		const resultStr = await this.api.get(url);
		if (!resultStr?.length) {
			console.error('could not load meta archetypes', format, time, rank, url);
			return null;
		}

		const deck: ArchetypeStat = JSON.parse(resultStr);
		console.debug('[constructed-meta-decks] loaded archetype', format, time, rank, deck?.totalGames);
		return deck;
	}
}

export interface ExtendedDeckStats extends DeckStats {
	deckStats: readonly ExtendedDeckStat[];
}

export interface ExtendedDeckStat extends DeckStat {
	allCardsInDeck: readonly string[];
}
