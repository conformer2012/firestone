import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewRef } from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { BnetRegion } from '@firestone-hs/reference-data';
import { Observable, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { Preferences } from '../../../models/preferences';
import { LocalizationFacadeService } from '../../../services/localization-facade.service';
import { PreferencesService } from '../../../services/preferences.service';
import { GameStatsLoaderService } from '../../../services/stats/game/game-stats-loader.service';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../abstract-subscription-store.component';

@Component({
	selector: 'region-filter-dropdown',
	styleUrls: [],
	template: `
		<filter-dropdown
			class="filter"
			*ngIf="filter$ | async as value"
			[options]="value.options"
			[filter]="value.filter"
			[placeholder]="value.placeholder"
			[visible]="value.visible"
			(onOptionSelected)="onSelected($event)"
		></filter-dropdown>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegionFilterDropdownComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	filter$: Observable<{
		filter: string;
		placeholder: string;
		options: IOption[];
		visible: boolean;
	}>;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly i18n: LocalizationFacadeService,
		private readonly gamesLoader: GameStatsLoaderService,
		private readonly prefs: PreferencesService,
	) {
		super(store, cdr);
	}

	async ngAfterContentInit() {
		await this.gamesLoader.isReady();
		await this.prefs.isReady();

		this.filter$ = combineLatest([
			this.store.listen$(([main, nav]) => nav.navigationDecktracker.currentView),
			this.gamesLoader.gameStats$$,
			this.store.listenPrefs$((prefs) => prefs.regionFilter),
		]).pipe(
			filter(([[currentView], stats, [filter]]) => !!currentView),
			this.mapData(([[currentView], stats, [filter]]) => {
				const allOptions = ['all'];
				const allRegions = new Set(stats?.stats?.map((stat) => stat.region).filter((region) => !!region));
				// Don't show the filter when only one region
				if (allRegions.size === 1) {
					return null;
				}
				for (const region of allRegions) {
					allOptions.push(BnetRegion[region].toLowerCase());
				}
				const options: FilterOption[] = allOptions.map(
					(option) =>
						({
							value: option,
							label: this.i18n.translateString(`global.region.${option}`) || option,
						} as FilterOption),
				);
				return {
					filter: filter == 'all' ? 'all' : BnetRegion[filter].toLowerCase(),
					options: options,
					placeholder: options.find((option) =>
						option.value === 'all' ? filter === 'all' : option.value === BnetRegion[filter].toLowerCase(),
					)?.label,
					// visible: ['constructed-meta-decks'].includes(currentView),
					// TODO: only show it if there are multiple regions. And if only one region, make sure it is set to
					// 'all' (in case it is set to another region)
					visible: true,
				};
			}),
		);

		// Because we await
		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async onSelected(option: FilterOption) {
		const prefs = await this.prefs.getPreferences();
		const newPrefs: Preferences = {
			...prefs,
			regionFilter: !option?.value || option.value === 'all' ? 'all' : BnetRegion[option.value.toUpperCase()],
		};
		await this.prefs.savePreferences(newPrefs);
	}
}

interface FilterOption extends IOption {
	value: string;
}
