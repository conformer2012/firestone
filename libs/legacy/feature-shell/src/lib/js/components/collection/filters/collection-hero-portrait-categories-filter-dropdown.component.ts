import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../services/localization-facade.service';
import { GenericPreferencesUpdateEvent } from '../../../services/mainwindow/store/events/generic-preferences-update-event';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../abstract-subscription-store.component';

@Component({
	selector: 'collection-hero-portrait-categories-filter',
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
export class CollectionHeroPortraitCategoriesFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit
{
	options: IOption[];

	filter$: Observable<{ filter: string; placeholder: string; visible: boolean }>;

	constructor(
		private readonly i18n: LocalizationFacadeService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(store, cdr);
		this.options = [
			{
				value: 'collectible',
				label: this.i18n.translateString('app.collection.filters.hero-portrait.collectible'),
			} as IOption,
			{
				value: 'battlegrounds',
				label: this.i18n.translateString('app.collection.filters.hero-portrait.battlegrounds'),
			} as IOption,
			{
				value: 'mercenaries',
				label: this.i18n.translateString('app.collection.filters.hero-portrait.mercenaries'),
			} as IOption,
			{
				value: 'book-of-mercs',
				label: this.i18n.translateString('app.collection.filters.hero-portrait.book-of-mercs'),
			} as IOption,
		];
	}

	ngAfterContentInit() {
		this.filter$ = this.store
			.listen$(
				([main, nav, prefs]) => prefs.collectionActivePortraitCategoryFilter,
				([main, nav]) => nav.navigationCollection.currentView,
			)
			.pipe(
				filter(([filter, currentView]) => !!filter && !!currentView),
				this.mapData(([filter, currentView]) => ({
					filter: filter,
					placeholder: this.options.find((option) => option.value === filter)?.label,
					visible: currentView === 'hero-portraits',
				})),
			);
	}

	onSelected(option: IOption) {
		this.store.send(
			new GenericPreferencesUpdateEvent((prefs) => ({
				...prefs,
				collectionActivePortraitCategoryFilter: option.value as any,
			})),
		);
	}
}
