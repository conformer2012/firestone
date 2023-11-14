import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { MmrPercentile } from '@firestone-hs/duels-global-stats/dist/stat';
import { IOption } from '@firestone-hs/ng-select';
import { OverwolfService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { DuelsMmrFilterSelectedEvent } from '../../../../services/mainwindow/store/events/duels/duels-mmr-filter-selected-event';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

@Component({
	selector: 'duels-mmr-filter-dropdown',
	styleUrls: [],
	template: `
		<duels-rank-filter-dropdown-view
			class="duels-rank-filter-dropdown"
			[mmrPercentiles]="mmrPercentiles$ | async"
			[currentFilter]="currentFilter$ | async"
			[visible]="visible$ | async"
			(valueSelected)="onSelected($event)"
		></duels-rank-filter-dropdown-view>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuelsMmrFilterDropdownComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	mmrPercentiles$: Observable<readonly MmrPercentile[]>;
	currentFilter$: Observable<number>;
	visible$: Observable<boolean>;

	constructor(
		private readonly ow: OverwolfService,
		private readonly i18n: LocalizationFacadeService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.mmrPercentiles$ = this.store
			.duelsMetaStats$()
			.pipe(this.mapData((metaStats) => metaStats?.mmrPercentiles));
		this.currentFilter$ = this.listenForBasicPref$((prefs) => prefs.duelsActiveMmrFilter);
		this.visible$ = this.store
			.listen$(([main, nav]) => nav.navigationDuels.selectedCategoryId)
			.pipe(
				filter(([categoryId]) => !!categoryId),
				this.mapData(([categoryId]) =>
					[
						'duels-runs',
						'duels-stats',
						'duels-treasures',
						'duels-personal-decks',
						'duels-personal-deck-details',
						'duels-top-decks',
						// 'duels-leaderboard',
						// 'duels-deckbuilder',
						// 'duels-buckets',
						// 'duels-deck-details',
					].includes(categoryId),
				),
			);
	}

	onSelected(option: IOption) {
		this.store.send(new DuelsMmrFilterSelectedEvent(+option.value as 100 | 50 | 25 | 10 | 1));
	}
}
