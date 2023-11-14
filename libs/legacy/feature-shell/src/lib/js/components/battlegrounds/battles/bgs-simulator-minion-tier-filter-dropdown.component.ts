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
import { MainWindowStoreEvent } from '@services/mainwindow/store/events/main-window-store-event';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../services/localization-facade.service';
import { BgsSimulatorMinionTierFilterSelectedEvent } from '../../../services/mainwindow/store/events/battlegrounds/simulator/bgs-simulator-minion-tier-filter-selected-event';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../abstract-subscription-store.component';

@Component({
	selector: 'bgs-sim-minion-tier-filter',
	styleUrls: [],
	template: `
		<filter-dropdown
			*ngIf="filter$ | async as value"
			class="bgs-sim-minion-tier-filter-dropdown"
			[options]="options"
			[filter]="value.filter"
			[placeholder]="value.placeholder"
			[visible]="value.visible"
			(onOptionSelected)="onSelected($event)"
		></filter-dropdown>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsSimulatorMinionTierFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit, AfterViewInit
{
	options: IOption[];

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
		const tiers = [1, 2, 3, 4, 5, 6, 7];
		this.options = [
			{
				value: 'all',
				label: this.i18n.translateString('app.battlegrounds.filters.tier.all-tiers'),
			} as IOption,
			...tiers.map((tier) => ({
				value: `${tier}`,
				label: this.i18n.translateString('app.battlegrounds.filters.tier.tier', { value: tier }),
			})),
		];
	}

	ngAfterContentInit() {
		this.filter$ = this.store
			.listen$(([main, nav, prefs]) => prefs.bgsActiveSimulatorMinionTierFilter)
			.pipe(
				filter(([filter]) => !!filter),
				this.mapData(([filter]) => ({
					filter: filter,
					placeholder: this.options.find((option) => option.value === filter)?.label,
					visible: true,
				})),
			);
	}

	async ngAfterViewInit() {
		const mainWindow = await this.windowManager.getMainWindow();
		this.stateUpdater = mainWindow.mainWindowStoreUpdater;
	}

	onSelected(option: IOption) {
		this.stateUpdater.next(new BgsSimulatorMinionTierFilterSelectedEvent(option.value as any));
	}
}
