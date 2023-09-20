import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter } from '@angular/core';
import { Preferences } from '@legacy-import/src/lib/js/models/preferences';
import { PreferencesService } from '@legacy-import/src/lib/js/services/preferences.service';
import { IOption } from 'ng-select';
import { Observable, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { MainWindowStoreEvent } from '../../../../services/mainwindow/store/events/main-window-store-event';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

@Component({
	selector: 'constructed-sample-size-filter-dropdown',
	styleUrls: [],
	template: `
		<filter-dropdown
			*ngIf="filter$ | async as value"
			[options]="options"
			[filter]="value.filter"
			[placeholder]="value.placeholder"
			[visible]="value.visible"
			(onOptionSelected)="onSelected($event)"
		></filter-dropdown>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConstructedSampleSizeFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit
{
	filter$: Observable<{ filter: string; placeholder: string; visible: boolean }>;
	options: IOption[] = [50, 100, 200, 500, 1000, 2000, 4000].map((value) => ({
		value: '' + value,
		label: this.i18n.translateString('app.decktracker.filters.sample-size-filter', { value: value }),
	}));

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly i18n: LocalizationFacadeService,
		private readonly prefs: PreferencesService,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.filter$ = combineLatest([
			this.listenForBasicPref$((prefs) => prefs.constructedMetaDecksSampleSizeFilter),
			this.store.listen$(([main, nav]) => nav.navigationDecktracker.currentView),
		]).pipe(
			filter(([filter, [currentView]]) => !!filter && !!currentView),
			this.mapData(([filter, [currentView]]) => {
				return {
					filter: '' + filter,
					options: this.options,
					placeholder: this.options.find((option) => +option.value === filter)?.label,
					visible: ['constructed-meta-decks'].includes(currentView),
				};
			}),
		);
	}

	async onSelected(option: IOption) {
		const prefs = await this.prefs.getPreferences();
		const newPrefs: Preferences = { ...prefs, constructedMetaDecksSampleSizeFilter: +option.value };
		await this.prefs.savePreferences(newPrefs);
	}
}