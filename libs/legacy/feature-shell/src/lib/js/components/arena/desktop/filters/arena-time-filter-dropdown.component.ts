import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
	ViewRef,
} from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { PatchesConfigService } from '@legacy-import/src/lib/js/services/patches-config.service';
import { Observable, combineLatest } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ArenaTimeFilterType } from '../../../../models/arena/arena-time-filter.type';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { ArenaTimeFilterSelectedEvent } from '../../../../services/mainwindow/store/events/arena/arena-time-filter-selected-event';
import { MainWindowStoreEvent } from '../../../../services/mainwindow/store/events/main-window-store-event';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { formatPatch } from '../../../../services/utils';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

/** This approach seems to be the cleanest way to properly narrow down the values needed from
 * the state. The other approaches are cool and data-driven, but as of now they seem more
 * difficult to implement with a store approach. The other filters might have to be refactored
 * to this approach
 */
@Component({
	selector: 'arena-time-filter-dropdown',
	styleUrls: [],
	template: `
		<filter-dropdown
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
export class ArenaTimeFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit, AfterViewInit
{
	filter$: Observable<{ filter: string; placeholder: string; options: IOption[]; visible: boolean }>;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly ow: OverwolfService,
		private readonly i18n: LocalizationFacadeService,
		private readonly patchesConfig: PatchesConfigService,
		private readonly windowManager: WindowManagerService,
	) {
		super(store, cdr);
	}

	async ngAfterContentInit() {
		await this.patchesConfig.isReady();

		this.filter$ = combineLatest([
			this.patchesConfig.currentArenaMetaPatch$$,
			this.store.listen$(
				([main, nav]) => main.arena.activeTimeFilter,
				([main, nav]) => nav.navigationArena.selectedCategoryId,
			),
		]).pipe(
			filter(([patch, [filter, selectedCategoryId]]) => !!filter && !!patch && !!selectedCategoryId),
			this.mapData(([patch, [filter, selectedCategoryId]]) => {
				const options: TimeFilterOption[] = [
					{
						value: 'all-time',
						label: this.i18n.translateString('app.arena.filters.time.past-100'),
					} as TimeFilterOption,
					{
						value: 'last-patch',
						label: this.i18n.translateString('app.arena.filters.time.last-patch'),
						tooltip: formatPatch(patch, this.i18n),
					} as TimeFilterOption,
					{
						value: 'past-seven',
						label: this.i18n.translateString('app.arena.filters.time.past-seven'),
					} as TimeFilterOption,
					{
						value: 'past-three',
						label: this.i18n.translateString('app.arena.filters.time.past-three'),
					} as TimeFilterOption,
				];
				return {
					filter: filter,
					options: options,
					placeholder:
						options.find((option) => option.value === filter)?.label ??
						this.i18n.translateString('app.arena.filters.time.past-100'),
					visible: true,
				};
			}),
		);

		if (!(this.cdr as ViewRef)?.destroyed) {
			this.cdr.detectChanges();
		}
	}

	async ngAfterViewInit() {
		this.stateUpdater = await this.windowManager.getGlobalService('mainWindowStoreUpdater');
	}

	onSelected(option: IOption) {
		this.stateUpdater.next(new ArenaTimeFilterSelectedEvent((option as TimeFilterOption).value));
	}
}

interface TimeFilterOption extends IOption {
	value: ArenaTimeFilterType;
}
