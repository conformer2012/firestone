import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewRef } from '@angular/core';
import { BattlegroundsNavigationService } from '@firestone/battlegrounds/common';
import { Preferences, PreferencesService } from '@firestone/shared/common/service';
import { waitForReady } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

@Component({
	selector: 'battlegrounds-filters',
	styleUrls: [
		`../../../../../css/component/app-section.component.scss`,
		`../../../../../css/component/battlegrounds/desktop/filters/_battlegrounds-filters.component.scss`,
	],
	template: `
		<div class="battlegrounds-filters" [attr.aria-label]="'Battlegrounds filters'" role="list">
			<region-filter-dropdown class="filter" *ngIf="showRegionFilter$ | async"></region-filter-dropdown>
			<battlegrounds-mode-filter-dropdown class="filter"></battlegrounds-mode-filter-dropdown>
			<battlegrounds-time-filter-dropdown class="time-filter"></battlegrounds-time-filter-dropdown>
			<battlegrounds-quest-type-filter-dropdown class="filter"></battlegrounds-quest-type-filter-dropdown>
			<battlegrounds-hero-filter-dropdown class="hero-filter"></battlegrounds-hero-filter-dropdown>
			<battlegrounds-rank-filter-dropdown class="rank-filter"></battlegrounds-rank-filter-dropdown>
			<battlegrounds-anomalies-filter-dropdown class="anomalies-filter"></battlegrounds-anomalies-filter-dropdown>
			<battlegrounds-tribes-filter-dropdown class="tribes-filter"></battlegrounds-tribes-filter-dropdown>
			<battlegrounds-rank-group-dropdown class="rank-group"></battlegrounds-rank-group-dropdown>
			<battlegrounds-hero-sort-dropdown class="hero-sort"></battlegrounds-hero-sort-dropdown>

			<battlegrounds-leaderboard-region-filter-dropdown
				class="leaderboard-region-filter"
			></battlegrounds-leaderboard-region-filter-dropdown>
			<fs-text-input
				class="leaderboard-player-search"
				*ngIf="showLeaderboardPlayerSearch$ | async"
				(fsModelUpdate)="onLeaderboardPlayerNameChanged($event)"
				[placeholder]="'app.battlegrounds.filters.leaderboard.search-placeholder' | fsTranslate"
			>
			</fs-text-input>

			<preference-toggle
				class="use-conservative-estimate-link"
				*ngIf="showConservativeEstimateLink$ | async"
				field="bgsHeroesUseConservativeEstimate"
				[label]="'app.decktracker.filters.use-conservative-estimate' | owTranslate"
				[tooltip]="'app.decktracker.filters.use-conservative-estimate-tooltip' | owTranslate"
			></preference-toggle>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsFiltersComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	showRegionFilter$: Observable<boolean>;
	showConservativeEstimateLink$: Observable<boolean>;
	showLeaderboardPlayerSearch$: Observable<boolean>;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly prefs: PreferencesService,
		private readonly nav: BattlegroundsNavigationService,
	) {
		super(store, cdr);
	}

	async ngAfterContentInit() {
		await waitForReady(this.nav);

		this.showRegionFilter$ = this.nav.selectedCategoryId$$.pipe(
			filter((currentView) => !!currentView),
			this.mapData(
				([currentView]) =>
					currentView !== 'bgs-category-personal-stats' &&
					currentView !== 'bgs-category-perfect-games' &&
					currentView !== 'bgs-category-meta-quests' &&
					currentView !== 'bgs-category-leaderboard' &&
					currentView !== 'bgs-category-simulator',
			),
		);
		this.showConservativeEstimateLink$ = this.nav.selectedCategoryId$$.pipe(
			filter((currentView) => !!currentView),
			this.mapData((currentView) => currentView === 'bgs-category-meta-heroes'),
		);
		this.showLeaderboardPlayerSearch$ = this.nav.selectedCategoryId$$.pipe(
			filter((currentView) => !!currentView),
			this.mapData((currentView) => currentView === 'bgs-category-leaderboard'),
		);

		if (!(this.cdr as ViewRef).destroyed) {
			this.cdr.detectChanges();
		}
	}

	async onLeaderboardPlayerNameChanged(value: string) {
		const prefs = await this.prefs.getPreferences();
		const newPrefs: Preferences = {
			...prefs,
			bgsLeaderboardPlayerSearch: value,
		};
		await this.prefs.savePreferences(newPrefs);
	}
}
