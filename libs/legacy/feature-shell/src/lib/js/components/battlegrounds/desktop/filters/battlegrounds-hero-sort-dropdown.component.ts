import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
} from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { BgsHeroSortFilterType } from '@firestone/battlegrounds/view';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { BgsHeroSortFilterSelectedEvent } from '../../../../services/mainwindow/store/events/battlegrounds/bgs-hero-sort-filter-selected-event';
import { MainWindowStoreEvent } from '../../../../services/mainwindow/store/events/main-window-store-event';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

@Component({
	selector: 'battlegrounds-hero-sort-dropdown',
	styleUrls: [],
	template: `
		<filter-dropdown
			*ngIf="filter$ | async as value"
			class="battlegrounds-hero-sort-dropdown"
			[attr.aria-label]="'Sort by'"
			[options]="options"
			[filter]="value.filter"
			[placeholder]="value.placeholder"
			[visible]="value.visible"
			(onOptionSelected)="onSelected($event)"
		></filter-dropdown>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsHeroSortDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit, AfterViewInit
{
	options: HeroSortFilterOption[];

	filter$: Observable<{ filter: string; placeholder: string; visible: boolean }>;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		private readonly ow: OverwolfService,
		private readonly i18n: LocalizationFacadeService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly windowManager: WindowManagerService,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.options = [
			{
				value: 'tier',
				label: this.i18n.translateString('app.battlegrounds.filters.hero-sort.tier'),
			} as HeroSortFilterOption,
			{
				value: 'average-position',
				label: this.i18n.translateString('app.battlegrounds.filters.hero-sort.average-position'),
			} as HeroSortFilterOption,
			{
				value: 'mmr',
				label: this.i18n.translateString('app.battlegrounds.filters.hero-sort.mmr'),
			} as HeroSortFilterOption,
			{
				value: 'games-played',
				label: this.i18n.translateString('app.battlegrounds.filters.hero-sort.games-played'),
			} as HeroSortFilterOption,
			{
				value: 'last-played',
				label: this.i18n.translateString('app.battlegrounds.filters.hero-sort.last-played'),
			} as HeroSortFilterOption,
		];
		this.filter$ = this.store
			.listen$(
				([main, nav, prefs]) => prefs.bgsActiveHeroSortFilter,
				([main, nav]) => nav.navigationBattlegrounds.selectedCategoryId,
				([main, nav]) => nav.navigationBattlegrounds.currentView,
			)
			.pipe(
				filter(([filter, categoryId, currentView]) => !!filter && !!categoryId && !!currentView),
				this.mapData(([filter, categoryId, currentView]) => ({
					filter: filter,
					placeholder: this.options.find((option) => option.value === filter)?.label,
					visible:
						(categoryId === 'bgs-category-personal-heroes' ||
							categoryId === 'bgs-category-meta-heroes' ||
							categoryId === 'bgs-category-personal-quests') &&
						!['categories', 'category'].includes(currentView),
				})),
			);
	}

	async ngAfterViewInit() {
		const mainWindow = await this.windowManager.getMainWindow();
		this.stateUpdater = mainWindow.mainWindowStoreUpdater;
	}

	onSelected(option: IOption) {
		this.stateUpdater.next(new BgsHeroSortFilterSelectedEvent((option as HeroSortFilterOption).value));
	}
}

interface HeroSortFilterOption extends IOption {
	value: BgsHeroSortFilterType;
}
