import { AfterContentInit, ChangeDetectionStrategy, ChangeDetectorRef, Component } from '@angular/core';
import { IOption } from '@firestone-hs/ng-select';
import { LocalizationFacadeService } from '@services/localization-facade.service';
import { Observable } from 'rxjs';
import { GenericPreferencesUpdateEvent } from '../../../services/mainwindow/store/events/generic-preferences-update-event';
import { AppUiStoreFacadeService } from '../../../services/ui-store/app-ui-store-facade.service';
import { AbstractSubscriptionStoreComponent } from '../../abstract-subscription-store.component';

@Component({
	selector: 'replays-game-mode-filter-dropdown',
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
export class ReplaysGameModeFilterDropdownComponent
	extends AbstractSubscriptionStoreComponent
	implements AfterContentInit
{
	options: IOption[];

	filter$: Observable<{ filter: string; placeholder: string; visible: boolean }>;

	constructor(
		protected readonly store: AppUiStoreFacadeService,
		protected readonly cdr: ChangeDetectorRef,
		private readonly i18n: LocalizationFacadeService,
	) {
		super(store, cdr);
		this.options = [
			'all',
			'battlegrounds',
			'battlegrounds-friendly',
			'mercenaries-all',
			'mercenaries-pve',
			'mercenaries-pvp',
			'ranked',
			'ranked-standard',
			'ranked-wild',
			'ranked-classic',
			'ranked-twist',
			'both-duels',
			'duels',
			'paid-duels',
			'arena',
			'casual',
			'friendly',
			'tavern-brawl',
			'practice',
		].map(
			(value) =>
				({
					value: value === 'all' ? null : value,
					label: this.i18n.translateString(`app.replays.filters.game-mode.${value}`),
				} as IOption),
		);
	}

	ngAfterContentInit() {
		this.filter$ = this.store
			.listen$(([main, nav, prefs]) => prefs.replaysActiveGameModeFilter)
			.pipe(
				this.mapData(([filter]) => ({
					filter: filter,
					placeholder: this.options.find((option) => option.value === filter)?.label,
					visible: true,
				})),
			);
	}

	onSelected(option: IOption) {
		this.store.send(
			new GenericPreferencesUpdateEvent((prefs) => ({ ...prefs, replaysActiveGameModeFilter: option.value })),
		);
	}
}
