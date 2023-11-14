import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
} from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { OverwolfService, WindowManagerService } from '@firestone/shared/framework/core';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { ArenaClassFilterType } from '../../../../models/arena/arena-class-filter.type';
import { classes, formatClass } from '../../../../services/hs-utils';
import { LocalizationFacadeService } from '../../../../services/localization-facade.service';
import { ArenaClassFilterSelectedEvent } from '../../../../services/mainwindow/store/events/arena/arena-class-filter-selected-event';
import { MainWindowStoreEvent } from '../../../../services/mainwindow/store/events/main-window-store-event';
import { AppUiStoreFacadeService } from '../../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../../abstract-subscription-store.component';

/** This approach seems to be the cleanest way to properly narrow down the values needed from
 * the state. The other approaches are cool and data-driven, but as of now they seem more
 * difficult to implement with a store approach. The other filters might have to be refactored
 * to this approach
 */
@Component({
	selector: 'arena-class-filter-dropdown',
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
export class ArenaClassFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit, AfterViewInit
{
	filter$: Observable<{ filter: string; placeholder: string; options: IOption[]; visible: boolean }>;

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
		this.filter$ = this.store
			.listen$(([main, nav]) => main.arena.activeHeroFilter)
			.pipe(
				filter(([filter]) => !!filter),
				this.mapData(([filter]) => {
					const options = ['all', ...(classes as ArenaClassFilterType[])].map(
						(option) =>
							({
								value: option,
								label: formatClass(option, this.i18n),
							} as ClassFilterOption),
					);
					return {
						filter: filter,
						options: options,
						placeholder:
							options.find((option) => option.value === filter)?.label ??
							this.i18n.translateString('global.class.all'),
						visible: true,
					};
				}),
			);
	}

	async ngAfterViewInit() {
		this.stateUpdater = await this.windowManager.getGlobalService('mainWindowStoreUpdater');
	}

	onSelected(option: IOption) {
		this.stateUpdater.next(new ArenaClassFilterSelectedEvent((option as ClassFilterOption).value));
	}
}

interface ClassFilterOption extends IOption {
	value: ArenaClassFilterType;
}
