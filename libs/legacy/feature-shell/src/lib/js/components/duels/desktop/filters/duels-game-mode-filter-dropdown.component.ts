import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
} from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { DuelsGameModeFilterType } from '@firestone/duels/data-access';
import { OverwolfService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { DuelsGameModeFilterSelectedEvent } from '../../../../services/mainwindow/store/events/duels/duels-game-mode-filter-selected-event';
import { MainWindowStoreEvent } from '../../../../services/mainwindow/store/events/main-window-store-event';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

@Component({
	selector: 'duels-game-mode-filter-dropdown',
	styleUrls: [],
	template: `
		<filter-dropdown
			*ngIf="filter$ | async as value"
			class="duels-game-mode-filter-dropdown"
			[options]="options"
			[filter]="value.filter"
			[placeholder]="value.placeholder"
			[visible]="value.visible"
			(onOptionSelected)="onSelected($event)"
		></filter-dropdown>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DuelsGameModeFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit, AfterViewInit
{
	options: GameModeFilterOption[];

	filter$: Observable<{ filter: string; placeholder: string; visible: boolean }>;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		private readonly ow: OverwolfService,
		private readonly i18n: LocalizationFacadeService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(store, cdr);
	}

	ngAfterContentInit() {
		this.options = [
			{
				value: 'all',
				label: this.i18n.translateString('app.duels.filters.game-mode.all'),
				tooltip: this.i18n.translateString('app.duels.filters.game-mode.all-tooltip'),
			} as GameModeFilterOption,
			{
				value: 'duels',
				label: this.i18n.translateString('app.duels.filters.game-mode.casual'),
				tooltip: this.i18n.translateString('app.duels.filters.game-mode.casual-tooltip'),
			} as GameModeFilterOption,
			{
				value: 'paid-duels',
				label: this.i18n.translateString('app.duels.filters.game-mode.heroic'),
			} as GameModeFilterOption,
		];
		this.filter$ = this.store
			.listen$(
				([main, nav, prefs]) => prefs.duelsActiveGameModeFilter,
				([main, nav]) => nav.navigationDuels.selectedCategoryId,
			)
			.pipe(
				filter(([filter, selectedCategoryId]) => !!filter && !!selectedCategoryId),
				this.mapData(([filter, selectedCategoryId]) => ({
					filter: filter,
					placeholder: this.options.find((option) => option.value === filter)?.label,
					visible: [
						'duels-stats',
						'duels-runs',
						'duels-treasures',
						'duels-personal-decks',
						'duels-personal-deck-details',
					].includes(selectedCategoryId),
				})),
			);
	}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}

	onSelected(option: IOption) {
		this.stateUpdater.next(new DuelsGameModeFilterSelectedEvent((option as GameModeFilterOption).value));
	}
}
interface GameModeFilterOption extends IOption {
	value: DuelsGameModeFilterType;
	tooltip?: string;
}
