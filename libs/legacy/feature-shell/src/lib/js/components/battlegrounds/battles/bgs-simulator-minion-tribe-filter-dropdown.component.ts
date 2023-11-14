import {
	AfterContentInit,
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	EventEmitter,
} from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { CardsFacadeService, OverwolfService } from '@firestone/shared/framework/core';
import { MainWindowStoreEvent } from '@services/mainwindow/store/events/main-window-store-event';
import { Observable } from 'rxjs';
import { filter } from 'rxjs/operators';
import { LocalizationFacadeService } from '../../../services/localization-facade.service';
import { BgsSimulatorMinionTribeFilterSelectedEvent } from '../../../services/mainwindow/store/events/battlegrounds/simulator/bgs-simulator-minion-tribe-filter-selected-event';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../abstract-subscription-store.component';

@Component({
	selector: 'bgs-sim-minion-tribe-filter',
	styleUrls: [],
	template: `
		<filter-dropdown
			*ngIf="filter$ | async as value"
			class="bgs-sim-minion-tribe-filter-dropdown"
			[options]="options"
			[filter]="value.filter"
			[placeholder]="value.placeholder"
			[visible]="value.visible"
			(onOptionSelected)="onSelected($event)"
		></filter-dropdown>
	`,
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BattlegroundsSimulatorMinionTribeFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit, AfterViewInit
{
	options: IOption[];

	filter$: Observable<{ filter: string; placeholder: string; visible: boolean }>;

	private stateUpdater: EventEmitter<MainWindowStoreEvent>;
	private collator = new Intl.Collator('en-US');

	constructor(
		private readonly ow: OverwolfService,
		private readonly allCards: CardsFacadeService,
		private readonly i18n: LocalizationFacadeService,
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
	) {
		super(store, cdr);
		const battlegroundsCards = this.allCards.getCards().filter((card) => !!card.techLevel);
		const uniqueTribes = [
			...new Set(battlegroundsCards.flatMap((card) => card.races ?? []).map((race) => race?.toLowerCase())),
		].filter((race) => !!race && race !== 'all');
		this.options = [
			{
				value: 'all',
				label: this.i18n.translateString('app.battlegrounds.filters.tribe.all-tribes'),
			} as IOption,
			...uniqueTribes
				.map(
					(tribe) =>
						({
							label: this.i18n.translateString(`global.tribe.${tribe.toLowerCase()}`),
							value: tribe,
						} as IOption),
				)
				.sort((a, b) => this.collator.compare(a.label, b.label)),
			{
				value: 'blank',
				label: this.i18n.translateString('app.battlegrounds.filters.tribe.no-tribe'),
			} as IOption,
		];
	}

	ngAfterContentInit() {
		this.filter$ = this.store
			.listen$(([main, nav, prefs]) => prefs.bgsActiveSimulatorMinionTribeFilter)
			.pipe(
				filter(([filter]) => !!filter),
				this.mapData(([filter]) => ({
					filter: filter,
					placeholder: this.options.find((option) => option.value === filter)?.label,
					visible: true,
				})),
			);
	}

	ngAfterViewInit() {
		this.stateUpdater = this.ow.getMainWindow().mainWindowStoreUpdater;
	}

	onSelected(option: IOption) {
		this.stateUpdater.next(new BgsSimulatorMinionTribeFilterSelectedEvent(option.value));
	}
}
