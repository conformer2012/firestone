import { AfterContentInit, ChangeDetectionStrategy, Component } from '@angular/core';
import { DuelsHeroSortFilterType, DuelsMetaStats } from '@firestone/duels/view';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { initDuelsMetaSignatureTreasureStats } from './+state/website/duels.actions';
import { WebsiteDuelsState } from './+state/website/duels.models';
import { getAllMetaSignatureTreasureStats } from './+state/website/duels.selectors';

@Component({
	selector: 'website-duels-signature-treasures',
	styleUrls: ['./meta-info.scss'],
	template: `
		<section class="section">
			<div class="filters">
				<website-duels-rank-filter-dropdown class="filter"></website-duels-rank-filter-dropdown>
				<website-duels-time-filter-dropdown class="filter"></website-duels-time-filter-dropdown>
			</div>

			<duels-meta-stats-view
				[stats]="stats$ | async"
				[sort]="sort$ | async"
				[hideLowData]="hideLowData$ | async"
			></duels-meta-stats-view>
		</section>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WebsiteDuelsSignatureTreasuresComponent implements AfterContentInit {
	stats$: Observable<readonly DuelsMetaStats[]>;
	sort$: Observable<DuelsHeroSortFilterType>;
	hideLowData$: Observable<boolean>;

	constructor(private readonly store: Store<WebsiteDuelsState>) {}

	ngAfterContentInit(): void {
		this.stats$ = this.store.select(getAllMetaSignatureTreasureStats);
		// console.debug('dispatching creation');
		const action = initDuelsMetaSignatureTreasureStats();
		// console.debug('after action creation', action);
		this.store.dispatch(action);
		return;
	}
}
