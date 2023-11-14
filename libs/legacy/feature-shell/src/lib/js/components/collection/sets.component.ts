import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { StatGameFormatType } from '@firestone/stats/data-access';
import { Observable, combineLatest } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Preferences } from '../../models/preferences';
import { Set } from '../../models/set';
import { LocalizationFacadeService } from '../../services/localization-facade.service';
import { GenericPreferencesUpdateEvent } from '../../services/mainwindow/store/events/generic-preferences-update-event';
import { MainWindowStoreEvent } from '../../services/mainwindow/store/events/main-window-store-event';
import { AppUiStoreFacadeService } from '../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../abstract-subscription-store.component';

@Component({
	selector: 'sets',
	styleUrls: [`../../../css/component/collection/sets.component.scss`],
	template: `
		<div class="sets">
			<div class="filters">
				<filter
					[filterOptions]="filterOptions"
					[activeFilter]="activeFilter$ | async"
					[filterChangeFunction]="filterChangeFunction"
				></filter>
				<card-search></card-search>
			</div>
			<sets-container [sets]="sets$ | async"></sets-container>
		</div>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SetsComponent extends AbstractSubscriptionStoreComponent implements AfterContentInit {
	activeFilter$: Observable<string>;
	sets$: Observable<readonly Set[]>;

	filterOptions: IOption[] = [
		{
			value: 'standard',
			label: this.i18n.translateString('app.collection.filters.format.standard'),
		} as IOption,
		{
			value: 'twist',
			label: this.i18n.translateString('app.collection.filters.format.twist'),
		} as IOption,
		{
			value: 'wild',
			label: this.i18n.translateString('app.collection.filters.format.wild'),
		} as IOption,
		{
			value: 'all',
			label: this.i18n.translateString('app.collection.filters.format.all'),
		} as IOption,
	];
	filterChangeFunction: (option: IOption) => MainWindowStoreEvent = (option: IOption) =>
		new GenericPreferencesUpdateEvent((prefs: Preferences) => ({
			...prefs,
			collectionSelectedFormat: option.value as StatGameFormatType,
		}));

	private allSets$: Observable<readonly Set[]>;

	constructor(
		private readonly i18n: LocalizationFacadeService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(store, cdr);
	}

	ngAfterContentInit(): void {
		this.activeFilter$ = this.store
			.listen$(([main, nav, prefs]) => prefs.collectionSelectedFormat)
			.pipe(this.mapData(([pref]) => pref));
		this.allSets$ = this.store.sets$().pipe(
			debounceTime(1000),
			this.mapData((sets) => sets),
		);
		this.sets$ = combineLatest([this.activeFilter$, this.allSets$]).pipe(
			this.mapData(([activeFilter, allSets]) => {
				const sets =
					activeFilter === 'all'
						? allSets
						: activeFilter === 'standard'
						? allSets.filter((set) => set.standard)
						: activeFilter === 'twist'
						? allSets.filter((set) => set.twist)
						: allSets.filter((set) => !set.standard);
				return [...sets].sort(this.sortSets());
			}),
		);
	}

	private sortSets(): (a: Set, b: Set) => number {
		return (a: Set, b: Set) => {
			if (a.id === 'core' || a.id === 'legacy') {
				return 1;
			}
			if (b.id === 'core' || a.id === 'legacy') {
				return -1;
			}
			if (!a.launchDate) {
				return -1;
			}
			if (!b.launchDate) {
				return 1;
			}
			return b.launchDate.getTime() - a.launchDate.getTime();
		};
	}
}
