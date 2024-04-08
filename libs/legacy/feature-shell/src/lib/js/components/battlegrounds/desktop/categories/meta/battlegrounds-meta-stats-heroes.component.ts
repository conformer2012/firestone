import {
	AfterContentInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	ViewRef,
} from '@angular/core';
import { BgsMetaHeroStatsService, BgsPlayerHeroStatsService } from '@firestone/battlegrounds/common';
import { BgsMetaHeroStatTierItem } from '@firestone/battlegrounds/data-access';
import { BgsHeroSortFilterType } from '@firestone/battlegrounds/view';
import { PreferencesService } from '@firestone/shared/common/service';
import { AbstractSubscriptionComponent } from '@firestone/shared/framework/common';
import { OverwolfService, waitForReady } from '@firestone/shared/framework/core';
import { BgsPersonalStatsSelectHeroDetailsEvent } from '@legacy-import/src/lib/js/services/mainwindow/store/events/battlegrounds/bgs-personal-stats-select-hero-details-event';
import { MainWindowStoreEvent } from '@legacy-import/src/lib/js/services/mainwindow/store/events/main-window-store-event';
import { Observable, shareReplay, takeUntil } from 'rxjs';

@Component({
	selector: 'battlegrounds-meta-stats-heroes',
	styleUrls: [
		`../../../../../../css/component/battlegrounds/desktop/categories/meta/battlegrounds-meta-stats-heroes.component.scss`,
	],
	template: `
		<battlegrounds-meta-stats-heroes-view
			[stats]="stats$ | async"
			[heroSort]="heroSort$ | async"
			[totalGames]="totalGames$ | async"
			[lastUpdate]="lastUpdate$ | async"
			(heroStatClick)="onHeroStatsClick($event)"
		></battlegrounds-meta-stats-heroes-view>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsMetaStatsHeroesComponent extends AbstractSubscriptionComponent implements AfterContentInit {
	stats$: Observable<readonly BgsMetaHeroStatTierItem[]>;
	heroSort$: Observable<BgsHeroSortFilterType>;
	totalGames$: Observable<number>;
	lastUpdate$: Observable<Date>;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		protected readonly cdr: ChangeDetectorRef,
		private readonly playerHeroStats: BgsPlayerHeroStatsService,
		private readonly metaHeroStats: BgsMetaHeroStatsService,
		private readonly prefs: PreferencesService,
		private readonly ow: OverwolfService,
	) {
		super(cdr);
	}

	async ngAfterContentInit() {
		await waitForReady(this.metaHeroStats, this.playerHeroStats, this.prefs);

		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
		this.stats$ = this.playerHeroStats.tiersWithPlayerData$$.pipe(this.mapData((stats) => stats));
		this.heroSort$ = this.prefs.preferences$$.pipe(this.mapData((prefs) => prefs.bgsActiveHeroSortFilter));
		const metaData$ = this.metaHeroStats.metaHeroStats$$.pipe(
			this.mapData((stats) => ({
				totalGames: stats?.dataPoints,
				lastUpdate: stats?.lastUpdateDate,
			})),
			shareReplay(1),
			takeUntil(this.destroyed$),
		);
		this.totalGames$ = metaData$.pipe(this.mapData((data) => data?.totalGames));
		this.lastUpdate$ = metaData$.pipe(
			this.mapData((data) => (data?.lastUpdate ? new Date(data.lastUpdate) : null)),
		);

		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	onHeroStatsClick(heroCardId: string) {
		this.stateUpdater.next(new BgsPersonalStatsSelectHeroDetailsEvent(heroCardId));
	}
}
